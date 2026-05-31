import { ValidationExceptionFilter } from './validation-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { ForbiddenException } from './forbidden-exception';

function makeHost(jsonMock: jest.Mock, headersSent = false): ArgumentsHost {
  const res = {
    headersSent,
    status: jest.fn().mockReturnThis(),
    json: jsonMock,
  };
  return {
    switchToHttp: () => ({ getResponse: () => res }),
  } as unknown as ArgumentsHost;
}

describe('ValidationExceptionFilter', () => {
  let filter: ValidationExceptionFilter;

  beforeEach(() => {
    filter = new ValidationExceptionFilter();
  });

  it('returns status:false with string exception response', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock);
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      message: 'Bad Request',
    });
  });

  it('returns first validation message when response.message is an array', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock);
    const exception = new HttpException(
      { message: ['field is required', 'field must be a string'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      message: 'field is required',
    });
  });

  it('returns message from object exception response', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock);
    const exception = new HttpException(
      { message: 'Custom error message' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      message: 'Custom error message',
    });
  });

  it('uses 403 status for local ForbiddenException', () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { headersSent: false, status: statusMock, json: jsonMock };
    const host = {
      switchToHttp: () => ({ getResponse: () => res }),
    } as unknown as ArgumentsHost;

    const exception = new ForbiddenException('Access denied');
    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
  });

  it('does nothing when headers are already sent', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock, true);
    const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(jsonMock).not.toHaveBeenCalled();
  });

  it('falls back to generic message when exception response has no message', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock);
    // Passing an object without a message key
    const exception = new HttpException({ error: 'some error' }, HttpStatus.INTERNAL_SERVER_ERROR);

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: false, message: expect.any(String) }),
    );
  });
});
