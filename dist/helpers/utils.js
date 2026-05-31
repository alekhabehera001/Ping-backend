"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getI18nMessage = exports.generateVerficationCode = exports.GetMonthDate = exports.GenerateRandomString = exports.GenerateOtpCode = exports.generateRandomPassword = exports.generateRandomHex = exports.generateAccessCode = void 0;
const node_crypto_1 = require("node:crypto");
function buildPasswordCharset() {
    const upper = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(65 + i)).join('');
    const lower = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(97 + i)).join('');
    return upper + lower + '0123456789';
}
const PASSWORD_CHARSET = buildPasswordCharset();
function randomStringFromCharset(length) {
    const buf = (0, node_crypto_1.randomBytes)(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += PASSWORD_CHARSET.charAt(buf[i] % PASSWORD_CHARSET.length);
    }
    return result;
}
class GenerateOtpCode {
    generateOtp(length = 6) {
        const max = 10 ** length;
        return (0, node_crypto_1.randomInt)(0, max).toString().padStart(length, '0');
    }
}
exports.GenerateOtpCode = GenerateOtpCode;
const generateVerficationCode = (length = 6) => {
    if (process.env.NODE_ENV === 'development') {
        return '123456'.slice(0, length).padEnd(length, '0');
    }
    const max = 10 ** length;
    return (0, node_crypto_1.randomInt)(0, max).toString().padStart(length, '0');
};
exports.generateVerficationCode = generateVerficationCode;
const generateRandomHex = (length) => {
    return (0, node_crypto_1.randomBytes)(length).toString('hex');
};
exports.generateRandomHex = generateRandomHex;
const generateRandomPassword = (length = 8) => {
    return randomStringFromCharset(length);
};
exports.generateRandomPassword = generateRandomPassword;
const generateAccessCode = () => {
    const timeStamp = Date.now();
    const num = 999999 - Number(timeStamp.toString().slice(7));
    return `ACCCODE${num.toString()}`;
};
exports.generateAccessCode = generateAccessCode;
class GenerateRandomString {
    constructor() {
        this.randomString = (length) => {
            return randomStringFromCharset(length);
        };
    }
}
exports.GenerateRandomString = GenerateRandomString;
class GetMonthDate {
    constructor() {
        this.getMonthDate = (date) => {
            const CurrentMonthstart = new Date(date);
            const CurrentMonthend = new Date(CurrentMonthstart);
            CurrentMonthend.setMonth(CurrentMonthend.getMonth() + 1);
            CurrentMonthend.setDate(0);
            CurrentMonthend.setHours(23, 59, 59, 999);
            const currentMonthDate = { start: CurrentMonthstart, end: CurrentMonthend };
            const startOfPreviousMonth = new Date(date);
            startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
            startOfPreviousMonth.setDate(1);
            const endOfPreviousMonth = new Date(startOfPreviousMonth);
            endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth() + 1);
            endOfPreviousMonth.setDate(0);
            endOfPreviousMonth.setHours(23, 59, 59, 999);
            const previousMonthDate = {
                start: startOfPreviousMonth,
                end: endOfPreviousMonth,
            };
            return { currentMonthDate, previousMonthDate };
        };
    }
}
exports.GetMonthDate = GetMonthDate;
const getI18nMessage = (i18n, key, fallback) => {
    if (!i18n?.t) {
        return fallback;
    }
    const translated = i18n.t(key);
    if (!translated || translated === key || translated.startsWith('common.')) {
        return fallback;
    }
    return translated;
};
exports.getI18nMessage = getI18nMessage;
//# sourceMappingURL=utils.js.map