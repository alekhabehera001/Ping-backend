"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonStream = void 0;
const node_stream_1 = require("node:stream");
const winston_logger_1 = __importDefault(require("./winston.logger"));
class WinstonStream extends node_stream_1.Writable {
    _write(chunk, encoding, callback) {
        winston_logger_1.default.info(chunk.toString().trim());
        callback();
    }
}
exports.WinstonStream = WinstonStream;
//# sourceMappingURL=winston-stream.js.map