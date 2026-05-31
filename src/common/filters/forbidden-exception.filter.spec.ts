import { ForbiddenExceptionFilter } from './forbidden-exception.filter';
import { ForbiddenException, ArgumentsHost } from '@nestjs/common';

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

describe('ForbiddenExceptionFilter', () => {
  let filter: ForbiddenExceptionFilter;

  beforeEach(() => {
    filter = new ForbiddenExceptionFilter();
  });

  it('returns 403 with status:false and the exception message', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock);
    const exception = new ForbiddenException('Not allowed');

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      message: 'Not allowed',
    });
  });

  it('uses default Forbidden message when none is provided', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock);
    const exception = new ForbiddenException();

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: false, message: expect.any(String) }),
    );
  });

  it('does nothing when headers are already sent', () => {
    const jsonMock = jest.fn();
    const host = makeHost(jsonMock, true);
    const exception = new ForbiddenException('Forbidden');

    filter.catch(exception, host);

    expect(jsonMock).not.toHaveBeenCalled();
  });
});
