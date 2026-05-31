"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston_logger_1 = __importDefault(require("./winston.logger"));
function toLogString(message) {
    if (typeof message === 'string')
        return message;
    if (message instanceof Error)
        return message.message;
    return JSON.stringify(message);
}
let WinstonLoggerService = class WinstonLoggerService {
    info(message) {
        winston_logger_1.default.info(message);
    }
    log(message, context) {
        winston_logger_1.default.info(toLogString(message), { context });
    }
    error(message, trace) {
        winston_logger_1.default.error(toLogString(message), trace);
    }
    warn(message, context) {
        winston_logger_1.default.warn(toLogString(message), { context });
    }
    debug(message, context) {
        winston_logger_1.default.debug(toLogString(message), { context });
    }
    verbose(message, context) {
        winston_logger_1.default.verbose(toLogString(message), { context });
    }
    logDatabaseConnected(host, port, database) {
        const logMessage = `Connected to database ${database} at ${host}:${port}`;
        winston_logger_1.default.info(logMessage);
    }
};
exports.WinstonLoggerService = WinstonLoggerService;
exports.WinstonLoggerService = WinstonLoggerService = __decorate([
    (0, common_1.Injectable)()
], WinstonLoggerService);
//# sourceMappingURL=winston-logger.service.js.map