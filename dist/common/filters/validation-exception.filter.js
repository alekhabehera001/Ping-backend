"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const forbidden_exception_1 = require("./forbidden-exception");
let ValidationExceptionFilter = class ValidationExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (response.headersSent) {
            return;
        }
        let status;
        if (exception instanceof forbidden_exception_1.ForbiddenException) {
            status = common_1.HttpStatus.FORBIDDEN;
        }
        else if (exception.getStatus) {
            status = exception.getStatus();
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
        const exceptionResponse = exception.getResponse();
        if (typeof exceptionResponse !== 'string' && Array.isArray(exceptionResponse.message)) {
            const errorMessages = exceptionResponse.message.map((message) => ({
                error: message,
            }));
            response.status(status).json({
                status: false,
                message: errorMessages[0].error ?? 'Bad Request',
            });
        }
        else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
            const body = {
                status: false,
                message: exceptionResponse.message ?? 'An unexpected error occurred',
            };
            if (exceptionResponse.data !== undefined) {
                body.data = exceptionResponse.data;
            }
            response.status(status).json(body);
        }
        else {
            const message = typeof exceptionResponse === 'string' ? exceptionResponse : 'An unexpected error occurred';
            response.status(status).json({
                status: false,
                message: message ?? 'An unexpected error occurred',
            });
        }
    }
};
exports.ValidationExceptionFilter = ValidationExceptionFilter;
exports.ValidationExceptionFilter = ValidationExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], ValidationExceptionFilter);
//# sourceMappingURL=validation-exception.filter.js.map