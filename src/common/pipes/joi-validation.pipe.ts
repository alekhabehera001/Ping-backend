import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown) {
    if (value === undefined || value === null) {
      value = {};
    }
    const { error, value: validated } = this.schema.validate(value, {
      abortEarly: true,
      stripUnknown: true,
      allowUnknown: false,
    });
    if (error) {
      throw new BadRequestException(error.details[0].message.replace(/['"]/g, ''));
    }
    return validated;
  }
}
