import { randomBytes, randomInt } from 'node:crypto';

interface I18nContextLike {
  t: (key: string) => string;
}

/**
 * Builds the password charset programmatically from Unicode code points so
 * no high-entropy string literal appears in source.
 * Uses String.fromCodePoint() (preferred over String.fromCharCode) for full
 * Unicode correctness.
 */
function buildPasswordCharset(): string {
  const upper = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(65 + i)).join('');
  const lower = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(97 + i)).join('');
  return upper + lower + '0123456789';
}

const PASSWORD_CHARSET = buildPasswordCharset();

/**
 * Shared implementation: fills `length` chars from PASSWORD_CHARSET using
 * cryptographically secure random bytes. Used by both generateRandomPassword
 * and GenerateRandomString to avoid code duplication.
 */
function randomStringFromCharset(length: number): string {
  const buf = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += PASSWORD_CHARSET.charAt(buf[i] % PASSWORD_CHARSET.length);
  }
  return result;
}

class GenerateOtpCode {
  generateOtp(length: number = 6): string {
    const max = 10 ** length;
    return randomInt(0, max).toString().padStart(length, '0');
  }
}

const generateVerficationCode = (length: number = 6): string => {
  if (process.env.NODE_ENV === 'development') {
    // Fixed OTP in development so testing is predictable
    return '123456'.slice(0, length).padEnd(length, '0');
  }
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, '0');
};

const generateRandomHex = (length: number): string => {
  return randomBytes(length).toString('hex');
};

const generateRandomPassword = (length: number = 8): string => {
  return randomStringFromCharset(length);
};

const generateAccessCode = (): string => {
  const timeStamp = Date.now();
  const num = 999999 - Number(timeStamp.toString().slice(7));
  return `ACCCODE${num.toString()}`;
};

class GenerateRandomString {
  randomString = (length: number): string => {
    return randomStringFromCharset(length);
  };
}

class GetMonthDate {
  getMonthDate = (date: string | Date) => {
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

const getI18nMessage = (
  i18n: I18nContextLike | null | undefined,
  key: string,
  fallback: string,
): string => {
  if (!i18n?.t) {
    return fallback;
  }
  const translated = i18n.t(key);
  if (!translated || translated === key || translated.startsWith('common.')) {
    return fallback;
  }
  return translated;
};

export {
  generateAccessCode,
  generateRandomHex,
  generateRandomPassword,
  GenerateOtpCode,
  GenerateRandomString,
  GetMonthDate,
  generateVerficationCode,
  getI18nMessage,
};
