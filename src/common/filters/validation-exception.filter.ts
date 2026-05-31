import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ForbiddenException } from './forbidden-exception';

interface ExceptionResponseObject {
  message: string | string[];
  error?: string;
  statusCode?: number;
  data?: unknown;
}

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (response.headersSent) {
      return;
    }

    let status: HttpStatus;
    if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception.getStatus) {
      status = exception.getStatus();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const exceptionResponse = exception.getResponse() as ExceptionResponseObject | string;

    if (typeof exceptionResponse !== 'string' && Array.isArray(exceptionResponse.message)) {
      const errorMessages = exceptionResponse.message.map((message: string) => ({
        error: message,
      }));

      response.status(status).json({
        status: false,
        message: errorMessages[0].error ?? 'Bad Request',
      });
    } else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      const body: Record<string, unknown> = {
        status: false,
        message: exceptionResponse.message ?? 'An unexpected error occurred',
      };
      if (exceptionResponse.data !== undefined) {
        body.data = exceptionResponse.data;
      }
      response.status(status).json(body);
    } else {
      const message =
        typeof exceptionResponse === 'string' ? exceptionResponse : 'An unexpected error occurred';
      response.status(status).json({
        status: false,
        message: message ?? 'An unexpected error occurred',
      });
    }
  }
}
