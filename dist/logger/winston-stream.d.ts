import { Writable } from 'node:stream';
export declare class WinstonStream extends Writable {
    _write(chunk: Buffer, encoding: string, callback: () => void): void;
}
