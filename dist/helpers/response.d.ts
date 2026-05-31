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
export declare const createResponse: (status: boolean, message: string, statusCode: number, data?: unknown) => ResponsePayload;
export declare const respond: (res: Response, { status, message, statusCode, data, err }: ResponseOptions) => Promise<Response<any, Record<string, any>>>;
export declare const respondSuccess: (res: Response, message: string, statusCode?: number, data?: unknown) => Promise<Response<any, Record<string, any>>>;
export declare const respondFailure: (res: Response, message: string, statusCode?: number, data?: unknown) => Promise<Response<any, Record<string, any>>>;
export declare const respondError: (message: string, statusCode?: number) => AppError | undefined;
export declare const validationError: (message: string) => any;
export declare const urlNotFound: () => AppError;
export declare const getMessageFromValidationError: (error: ValidationError) => string;
export declare const handleValidationError: (res: Response, error: ValidationError) => Promise<Response<any, Record<string, any>>>;
export declare const getI18nMessage: (i18n: I18nContext | undefined, key: string, fallback: string) => string;
export declare const handleServerError: (res: Response, i18n: I18nContext) => Promise<Response<any, Record<string, any>>>;
export {};
