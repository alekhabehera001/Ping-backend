// Load environment variables first (.env for local dev, then AWS Secrets Manager on EC2).
// AppModule is imported dynamically inside main() — it must not be required until after
// loadSecretsFromAwsIfNeeded() has populated process.env, because @nestjs/config's
// ConfigModule.forRoot({ validationSchema }) runs Joi validation eagerly at forRoot()
// call time, which happens when app.module is evaluated.
import dns from 'dns';
// Mirror the DNS override in main.ts — system DNS may fail to resolve
// MongoDB Atlas SRV records; Google/Cloudflare resolvers are reliable.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
import * as dotenv from 'dotenv';
dotenv.config();
import { loadSecretsFromAwsIfNeeded } from './config/secrets-aws.loader';

// dependencies
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { EventEmitter } from 'node:events';
import { NestFactory } from '@nestjs/core';
import type { Type } from '@nestjs/common';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ForbiddenExceptionFilter } from './common/filters/forbidden-exception.filter';
import { ResponseInterceptor } from './response/response.interceptor';
import { WinstonStream } from './logger/winston-stream';
import morgan from 'morgan';

// Services
import { WinstonLoggerService } from './logger/winston-logger.service';

// Set the maximum number of listeners to avoid the warning
EventEmitter.defaultMaxListeners = 50;

async function bootstrap(AppModule: Type<unknown>) {
  let logger: WinstonLoggerService | undefined;
  try {
    // Body parsers must be applied to the raw Express instance BEFORE NestFactory.create()
    // calls app.init() internally — which triggers configure() and registers all module
    // middleware. If body parsers are added via app.use() after create(), they end up AFTER
    // MongoSanitizeMiddleware and ApiKeyMiddleware in the Express chain, so req.body is
    // always undefined when those middleware run.
    const server = express();
    server.disable('x-powered-by');
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    // Create the NestJS application using the pre-configured Express instance
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: new WinstonLoggerService(),
      bodyParser: false,
    });

    // Access the logger and config from the application context
    logger = app.get(WinstonLoggerService);
    const configService = app.get(ConfigService);

    const trustProxyHops = configService.get<number>('TRUST_PROXY') ?? 0;
    if (trustProxyHops > 0) {
      server.set('trust proxy', trustProxyHops);
    }

    const corsOrigins = (configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
      .split(',')
      .map(s => s.trim());

    const corsOptions: CorsOptions = {
      origin: corsOrigins,
      credentials: true,
      exposedHeaders: 'Content-Type, X-Auth-Token',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
    };

    // Apply Helmet for additional security
    app.use(helmet());

    // Apply HTTP response compression
    app.use(compression());

    // Apply HPP middlewares
    app.use(hpp());

    // Enable CORS with default settings
    app.enableCors(corsOptions);

    // Setup global pipes and filters
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    // ForbiddenExceptionFilter is registered last so it takes precedence over
    // ValidationExceptionFilter for 403 responses (NestJS applies last-registered first).
    app.useGlobalFilters(new ValidationExceptionFilter(), new ForbiddenExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Set global prefix
    app.setGlobalPrefix('api', {
      exclude: [
        { path: 'stripe/webhook', method: RequestMethod.POST },
        { path: 'webhooks/apple', method: RequestMethod.POST },
        { path: 'webhooks/google', method: RequestMethod.POST },
      ],
    });

    // Use morgan for logging
    app.use(
      morgan(':method :url :status :res[content-length] - :response-time ms', {
        stream: new WinstonStream(),
      }),
    );

    // Start the application server
    const port = configService.get<number>('PORT') ?? 3000;
    await app.listen(port);
    logger!.log(`Server listening on port ${port}`);
  } catch (error) {
    logger ??= new WinstonLoggerService();
    logger.error('Error starting server', error as string);
  }
}

async function main() {
  try {
    await loadSecretsFromAwsIfNeeded();
  } catch (err) {
    console.error('FATAL: could not load secrets from AWS Secrets Manager', err);
    process.exit(1);
  }
  // Dynamic import: AppModule (and the ConfigModule.forRoot call inside it) must not be
  // evaluated until process.env has been populated by the secrets loader above.
  const { AppModule } = await import('./app.module');
  await bootstrap(AppModule);
}

main();
