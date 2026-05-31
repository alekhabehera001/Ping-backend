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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.AppModule = void 0;
const path = __importStar(require("node:path"));
const Joi = __importStar(require("joi"));
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const nestjs_i18n_1 = require("nestjs-i18n");
const mongoose_1 = require("./database/mongoose");
const constant_1 = require("./helpers/constant");
const mongo_sanitize_middleware_1 = require("./middlewares/mongo-sanitize.middleware");
const winston_logger_module_1 = require("./logger/winston-logger.module");
const app_controller_1 = require("./app.controller");
const config_2 = __importDefault(require("./config/config"));
const auth_module_1 = require("./v1/auth/auth.module");
const users_module_1 = require("./v1/users/users.module");
const couples_module_1 = require("./v1/couples/couples.module");
const questions_module_1 = require("./v1/questions/questions.module");
const answers_module_1 = require("./v1/answers/answers.module");
const moods_module_1 = require("./v1/moods/moods.module");
const memories_module_1 = require("./v1/memories/memories.module");
const streaks_module_1 = require("./v1/streaks/streaks.module");
const notifications_module_1 = require("./v1/notifications/notifications.module");
const uploads_module_1 = require("./v1/uploads/uploads.module");
const websocket_module_1 = require("./websocket/websocket.module");
const queues_module_1 = require("./queues/queues.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(mongo_sanitize_middleware_1.MongoSanitizeMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: '.env',
                load: [config_2.default],
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
            event_emitter_1.EventEmitterModule.forRoot(),
            mongoose_1.DatabaseModule,
            nestjs_i18n_1.I18nModule.forRootAsync({
                useFactory: () => ({
                    fallbackLanguage: constant_1.allowedLanguages[0],
                    loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
                }),
                resolvers: [new nestjs_i18n_1.HeaderResolver(['x-app-language']), nestjs_i18n_1.AcceptLanguageResolver],
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
            }),
            winston_logger_module_1.WinstonLoggerModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            couples_module_1.CouplesModule,
            questions_module_1.QuestionsModule,
            answers_module_1.AnswersModule,
            moods_module_1.MoodsModule,
            memories_module_1.MemoriesModule,
            streaks_module_1.StreaksModule,
            notifications_module_1.NotificationsModule,
            uploads_module_1.UploadsModule,
            websocket_module_1.WebSocketModule,
            queues_module_1.QueuesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map