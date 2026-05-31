"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerError = exports.getI18nMessage = exports.handleValidationError = exports.getMessageFromValidationError = exports.urlNotFound = exports.validationError = exports.respondError = exports.respondFailure = exports.respondSuccess = exports.respond = exports.createResponse = void 0;
const common_1 = require("@nestjs/common");
const StatusCode = __importStar(require("./response.statuscode.json"));
const createResponse = (status, message, statusCode, data = null) => {
    const response = {
        status,
        message,
        statusCode,
    };
    if (data !== null && data !== undefined) {
        response.data = data;
    }
    return response;
};
exports.createResponse = createResponse;
const respond = async (res, { status, message, statusCode, data, err }) => {
    const defaultMessage = status ? 'Query was successful' : 'Something went wrong';
    const logMessage = message || defaultMessage;
    if (err)
        common_1.Logger.error(err);
    common_1.Logger.log(`${logMessage}`, status ? 'info' : 'error');
    const responsePayload = {
        status,
        message: message || defaultMessage,
    };
    if (data != null) {
        responsePayload.data = data;
    }
    return res.status(statusCode).json(responsePayload);
};
exports.respond = respond;
const respondSuccess = (res, message, statusCode = StatusCode.OK, data = null) => {
    return (0, exports.respond)(res, { status: true, message, statusCode, data });
};
exports.respondSuccess = respondSuccess;
const respondFailure = (res, message, statusCode = StatusCode.NOT_FOUND, data = null) => {
    common_1.Logger.warn(`${message}`);
    return (0, exports.respond)(res, { status: false, message, statusCode, data });
};
exports.respondFailure = respondFailure;
const respondError = (message, statusCode = StatusCode.BAD_REQUEST) => {
    try {
        const error = new Error(message);
        error.status = statusCode;
        common_1.Logger.error(message);
        return error;
    }
    catch (err) {
        common_1.Logger.error(err);
    }
};
exports.respondError = respondError;
const validationError = (message) => {
    return module.exports.createResponse(false, message, StatusCode.BAD_REQUEST, '');
};
exports.validationError = validationError;
const urlNotFound = () => {
    const message = 'URL not found, please check the documentation';
    common_1.Logger.warn(message);
    const error = new Error(message);
    error.status = StatusCode.NOT_FOUND;
    return error;
};
exports.urlNotFound = urlNotFound;
const getMessageFromValidationError = (error) => error.details[0].message.replaceAll('"', '');
exports.getMessageFromValidationError = getMessageFromValidationError;
const handleValidationError = (res, error) => {
    const validationMessage = (0, exports.getMessageFromValidationError)(error);
    const response = (0, exports.validationError)(validationMessage);
    return (0, exports.respond)(res, { ...response, message: response.message });
};
exports.handleValidationError = handleValidationError;
const getI18nMessage = (i18n, key, fallback) => {
    if (!i18n?.t) {
        return fallback;
    }
    const translated = i18n.t(key);
    if (!translated ||
        translated === key ||
        (typeof translated === 'string' && translated.startsWith('common.'))) {
        return fallback;
    }
    return translated;
};
exports.getI18nMessage = getI18nMessage;
const handleServerError = (res, i18n) => {
    const message = (0, exports.getI18nMessage)(i18n, 'common.SOMETHING_WRONG', 'Something went wrong');
    const responseMessage = (0, exports.createResponse)(false, message, StatusCode.INTERNAL_SERVER_ERROR, '');
    return (0, exports.respond)(res, { ...responseMessage, message: responseMessage.message });
};
exports.handleServerError = handleServerError;
//# sourceMappingURL=response.js.map