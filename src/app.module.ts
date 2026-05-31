import * as path from 'node:path';
import * as Joi from 'joi';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import { DatabaseModule } from '@database/mongoose';
import { allowedLanguages } from './helpers/constant';
import { MongoSanitizeMiddleware } from './middlewares/mongo-sanitize.middleware';
import { WinstonLoggerModule } from './logger/winston-logger.module';
import { AppController } from './app.controller';
import configuration from './config/config';

import { AuthModule } from './v1/auth/auth.module';
import { UsersModule } from './v1/users/users.module';
import { CouplesModule } from './v1/couples/couples.module';
import { QuestionsModule } from './v1/questions/questions.module';
import { AnswersModule } from './v1/answers/answers.module';
import { MoodsModule } from './v1/moods/moods.module';
import { MemoriesModule } from './v1/memories/memories.module';
import { StreaksModule } from './v1/streaks/streaks.module';
import { NotificationsModule } from './v1/notifications/notifications.module';
import { UploadsModule } from './v1/uploads/uploads.module';
import { WebSocketModule } from './websocket/websocket.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'staging', 'production', 'test')
          .default('development'),
        MONGO_URI: Joi.string()
          .uri({ scheme: ['mongodb', 'mongodb+srv'] })
          .required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRE_SECONDS: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_EXPIRE_SECONDS: Joi.string().default('7d'),
        API_KEY: Joi.string().min(8).required(),
        CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
        SKIP_AWS_SECRETS: Joi.boolean().default(true),
      }),
      validationOptions: { abortEarly: true },
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: allowedLanguages[0],
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [new HeaderResolver(['x-app-language']), AcceptLanguageResolver],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    WinstonLoggerModule,
    AuthModule,
    UsersModule,
    CouplesModule,
    QuestionsModule,
    AnswersModule,
    MoodsModule,
    MemoriesModule,
    StreaksModule,
    NotificationsModule,
    UploadsModule,
    WebSocketModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MongoSanitizeMiddleware).forRoutes('*');
  }
}
