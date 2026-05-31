import { Writable } from 'node:stream';
import logger from './winston.logger';

export class WinstonStream extends Writable {
  _write(chunk: Buffer, encoding: string, callback: () => void) {
    logger.info(chunk.toString().trim());
    callback();
  }
}
