import { Logger } from '@nestjs/common';
import * as StatusCode from './response.statuscode.json';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

export interface ResponseOptions {
  status: boolean;
  message: string;
  statusCode: number;
  data?: unknown;
  err?: unknown;
}

interface AppError extends Error {
  status?: number;
}

interface ResponsePayload {
  status: boolean;
  message: string;
  statusCode: number;
  data?: unknown;
}

interface ValidationErrorDetail {
  message: string;
}

interface ValidationError {
  details: ValidationErrorDetail[];
}

export const createResponse = (
  status: boolean,
  message: string,
  statusCode: number,
  data: unknown = null,
): ResponsePayload => {
  const response: ResponsePayload = {
    status,
    message,
    statusCode,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return response;
};

export const respond = async (
  res: Response,
  { status, message, statusCode, data, err }: ResponseOptions,
) => {
  const defaultMessage = status ? 'Query was successful' : 'Something went wrong';

  const logMessage = message || defaultMessage;

  if (err) Logger.error(err);

  Logger.log(`${logMessage}`, status ? 'info' : 'error');

  const responsePayload: { status: boolean; message: string; data?: unknown } = {
    status,
    message: message || defaultMessage,
  };
  if (data != null) {
    responsePayload.data = data;
  }
  return res.status(statusCode).json(responsePayload);
};

export const respondSuccess = (
  res: Response,
  message: string,
  statusCode: number = StatusCode.OK,
  data: unknown = null,
) => {
  return respond(res, { status: true, message, statusCode, data });
};

export const respondFailure = (
  res: Response,
  message: string,
  statusCode: number = StatusCode.NOT_FOUND,
  data: unknown = null,
) => {
  Logger.warn(`${message}`);
  return respond(res, { status: false, message, statusCode, data });
};

export const respondError = (message: string, statusCode: number = StatusCode.BAD_REQUEST) => {
  try {
    const error: AppError = new Error(message);
    error.status = statusCode;
    Logger.error(message);
    return error;
  } catch (err) {
    Logger.error(err);
  }
};

export const validationError = (message: string) => {
  return module.exports.createResponse(false, message, StatusCode.BAD_REQUEST, '');
};

export const urlNotFound = () => {
  const message = 'URL not found, please check the documentation';
  Logger.warn(message);
  const error: AppError = new Error(message);
  error.status = StatusCode.NOT_FOUND;
  return error;
};

export const getMessageFromValidationError = (error: ValidationError) =>
  error.details[0].message.replaceAll('"', '');

export const handleValidationError = (res: Response, error: ValidationError) => {
  const validationMessage = getMessageFromValidationError(error);
  const response = validationError(validationMessage);
  return respond(res, { ...response, message: response.message });
};

export const getI18nMessage = (
  i18n: I18nContext | undefined,
  key: string,
  fallback: string,
): string => {
  if (!i18n?.t) {
    return fallback;
  }
  const translated = i18n.t(key) as string;
  if (
    !translated ||
    translated === key ||
    (typeof translated === 'string' && translated.startsWith('common.'))
  ) {
    return fallback;
  }
  return translated;
};

export const handleServerError = (res: Response, i18n: I18nContext) => {
  const message = getI18nMessage(i18n, 'common.SOMETHING_WRONG', 'Something went wrong');
  const responseMessage = createResponse(false, message, StatusCode.INTERNAL_SERVER_ERROR, '');
  return respond(res, { ...responseMessage, message: responseMessage.message });
};
