"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const secrets_aws_loader_1 = require("./config/secrets-aws.loader");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const hpp_1 = __importDefault(require("hpp"));
const express_1 = __importDefault(require("express"));
const platform_express_1 = require("@nestjs/platform-express");
const node_events_1 = require("node:events");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const validation_exception_filter_1 = require("./common/filters/validation-exception.filter");
const forbidden_exception_filter_1 = require("./common/filters/forbidden-exception.filter");
const response_interceptor_1 = require("./response/response.interceptor");
const winston_stream_1 = require("./logger/winston-stream");
const morgan_1 = __importDefault(require("morgan"));
const winston_logger_service_1 = require("./logger/winston-logger.service");
node_events_1.EventEmitter.defaultMaxListeners = 50;
async function bootstrap(AppModule) {
    let logger;
    try {
        const server = (0, express_1.default)();
        server.disable('x-powered-by');
        server.use(express_1.default.json());
        server.use(express_1.default.urlencoded({ extended: true }));
        const app = await core_1.NestFactory.create(AppModule, new platform_express_1.ExpressAdapter(server), {
            logger: new winston_logger_service_1.WinstonLoggerService(),
            bodyParser: false,
        });
        logger = app.get(winston_logger_service_1.WinstonLoggerService);
        const configService = app.get(config_1.ConfigService);
        const trustProxyHops = configService.get('TRUST_PROXY') ?? 0;
        if (trustProxyHops > 0) {
            server.set('trust proxy', trustProxyHops);
        }
        const corsOrigins = (configService.get('CORS_ORIGINS') ?? 'http://localhost:3000')
            .split(',')
            .map(s => s.trim());
        const corsOptions = {
            origin: corsOrigins,
            credentials: true,
            exposedHeaders: 'Content-Type, X-Auth-Token',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
        };
        app.use((0, helmet_1.default)());
        app.use((0, compression_1.default)());
        app.use((0, hpp_1.default)());
        app.enableCors(corsOptions);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
        app.useGlobalFilters(new validation_exception_filter_1.ValidationExceptionFilter(), new forbidden_exception_filter_1.ForbiddenExceptionFilter());
        app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
        app.setGlobalPrefix('api', {
            exclude: [
                { path: 'stripe/webhook', method: common_1.RequestMethod.POST },
                { path: 'webhooks/apple', method: common_1.RequestMethod.POST },
                { path: 'webhooks/google', method: common_1.RequestMethod.POST },
            ],
        });
        app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', {
            stream: new winston_stream_1.WinstonStream(),
        }));
        const port = configService.get('PORT') ?? 3000;
        await app.listen(port);
        logger.log(`Server listening on port ${port}`);
    }
    catch (error) {
        logger ??= new winston_logger_service_1.WinstonLoggerService();
        logger.error('Error starting server', error);
    }
}
async function main() {
    try {
        await (0, secrets_aws_loader_1.loadSecretsFromAwsIfNeeded)();
    }
    catch (err) {
        console.error('FATAL: could not load secrets from AWS Secrets Manager', err);
        process.exit(1);
    }
    const { AppModule } = await Promise.resolve().then(() => __importStar(require('./app.module')));
    await bootstrap(AppModule);
}
main();
//# sourceMappingURL=main.js.map