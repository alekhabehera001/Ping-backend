"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokenMiddleware = exports.ApiKeyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const constant_1 = require("../helpers/constant");
const config_1 = require("@nestjs/config");
const winston_logger_service_1 = require("../logger/winston-logger.service");
const chalk_1 = __importDefault(require("chalk"));
let ApiKeyMiddleware = class ApiKeyMiddleware {
    constructor(configService, loggers) {
        this.configService = configService;
        this.loggers = loggers;
        this.WEBHOOK_BYPASS_PATHS = ['/webhooks/apple', '/webhooks/google'];
        this.SENSITIVE_BODY_FIELDS = new Set([
            'password',
            'confirmpassword',
            'otp',
            'token',
            'refreshtoken',
            'accesstoken',
            'secret',
            'apikey',
            'pin',
            'code',
        ]);
    }
    safeCompare(a, b) {
        try {
            const bufA = Buffer.from(a);
            const bufB = Buffer.from(b);
            if (bufA.length !== bufB.length)
                return false;
            return (0, node_crypto_1.timingSafeEqual)(bufA, bufB);
        }
        catch {
            return false;
        }
    }
    redactBody(value) {
        if (Array.isArray(value)) {
            return value.map(item => this.redactBody(item));
        }
        if (value !== null && typeof value === 'object') {
            const redacted = {};
            for (const [key, val] of Object.entries(value)) {
                redacted[key] = this.SENSITIVE_BODY_FIELDS.has(key.toLowerCase())
                    ? '[REDACTED]'
                    : this.redactBody(val);
            }
            return redacted;
        }
        return value;
    }
    isWebhookBypassPath(path) {
        return this.WEBHOOK_BYPASS_PATHS.some(p => path === p || path.startsWith(p + '/'));
    }
    resolveLanguage(xLangHeader, acceptLanguageHeader) {
        if (xLangHeader) {
            const lang = String(xLangHeader).toLowerCase().trim();
            if (constant_1.allowedLanguages.includes(lang))
                return lang;
        }
        else if (acceptLanguageHeader) {
            const lang = String(acceptLanguageHeader).toLowerCase().split(',')[0].trim().split('-')[0];
            if (constant_1.allowedLanguages.includes(lang))
                return lang;
        }
        return 'en';
    }
    use(req, res, next) {
        if (req.method === 'OPTIONS') {
            return next();
        }
        const apiKey = req.headers['x-api-key'];
        const appVersion = req.headers['x-app-version'];
        const xLangHeader = req.headers['x-app-language'];
        const acceptLanguageHeader = req.headers['accept-language'];
        const requestPath = req.originalUrl.split('?')[0];
        if (!this.isWebhookBypassPath(requestPath)) {
            if (!apiKey) {
                return res.status(403).json({ status: false, message: 'x-api-key is required in header' });
            }
            const validApiKey = this.configService.get('API_KEY');
            if (!validApiKey || !this.safeCompare(String(apiKey), validApiKey)) {
                return res.status(403).json({ status: false, message: 'Invalid x-api-key' });
            }
            if (!appVersion) {
                return res.status(403).json({
                    status: false,
                    message: 'x-app-version is required in header',
                });
            }
            this.loggers.log('', 'info');
            this.loggers.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', 'info');
            this.loggers.log('', 'info');
            const safeHeaders = { ...req.headers };
            delete safeHeaders['authorization'];
            delete safeHeaders['x-api-key'];
            delete safeHeaders['cookie'];
            this.loggers.log('Request Headers: ' + chalk_1.default.yellow(JSON.stringify(safeHeaders, null, 2)), 'info');
            this.loggers.log('Request Body: ' + chalk_1.default.yellow(JSON.stringify(this.redactBody(req.body), null, 2)), 'info');
            const language = this.resolveLanguage(xLangHeader, acceptLanguageHeader);
            req['language'] = language;
        }
        next();
    }
};
exports.ApiKeyMiddleware = ApiKeyMiddleware;
exports.ApiKeyMiddleware = ApiKeyMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        winston_logger_service_1.WinstonLoggerService])
], ApiKeyMiddleware);
class AuthTokenMiddleware {
    use(req, res, next) {
        if (!req.header('Authorization')) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        next();
    }
}
exports.AuthTokenMiddleware = AuthTokenMiddleware;
//# sourceMappingURL=apiRequest.middleware.js.map