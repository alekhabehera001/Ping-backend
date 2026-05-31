import { ObjectIdPipe } from './object-id.pipe';
import { BadRequestException } from '@nestjs/common';

describe('ObjectIdPipe', () => {
  let pipe: ObjectIdPipe;

  beforeEach(() => {
    pipe = new ObjectIdPipe();
  });

  it('passes through a valid ObjectId string', () => {
    const validId = '507f1f77bcf86cd799439011';
    expect(pipe.transform(validId)).toBe(validId);
  });

  it('throws BadRequestException for an invalid ObjectId', () => {
    expect(() => pipe.transform('not-an-object-id')).toThrow(BadRequestException);
  });

  it('throws BadRequestException for an empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });

  it('includes the invalid value in the error message', () => {
    try {
      pipe.transform('bad-id');
    } catch (e) {
      expect((e as BadRequestException).message).toContain('bad-id');
    }
  });
});
