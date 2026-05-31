import { PipeTransform } from '@nestjs/common';
export declare class ObjectIdPipe implements PipeTransform<string> {
    transform(value: string): string;
}
