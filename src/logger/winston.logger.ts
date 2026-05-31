import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logLevel =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

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

// instantiate a new winston Logger with the settings defined above
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.errors(),
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.align(),
    winston.format.simple(),
    winston.format.prettyPrint(),
    winston.format.printf(
      (log: winston.Logform.TransformableInfo) =>
        `${log['timestamp'] as string} | ${log.level}: ${log.message as string}`,
    ),
  ),
  transports: [
    new winston.transports.DailyRotateFile(options.info),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

export default logger;
