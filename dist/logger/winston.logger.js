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
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');
const options = {
    info: {
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        colorize: true,
        level: logLevel,
    },
    console: {
        level: logLevel,
        handleExceptions: true,
        handleRejections: true,
        json: true,
        colorize: true,
    },
};
const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(winston.format.errors(), winston.format.timestamp(), winston.format.colorize(), winston.format.align(), winston.format.simple(), winston.format.prettyPrint(), winston.format.printf((log) => `${log['timestamp']} | ${log.level}: ${log.message}`)),
    transports: [
        new winston.transports.DailyRotateFile(options.info),
        new winston.transports.Console(options.console),
    ],
    exitOnError: false,
});
exports.default = logger;
//# sourceMappingURL=winston.logger.js.map