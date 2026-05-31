interface I18nContextLike {
    t: (key: string) => string;
}
declare class GenerateOtpCode {
    generateOtp(length?: number): string;
}
declare const generateVerficationCode: (length?: number) => string;
declare const generateRandomHex: (length: number) => string;
declare const generateRandomPassword: (length?: number) => string;
declare const generateAccessCode: () => string;
declare class GenerateRandomString {
    randomString: (length: number) => string;
}
declare class GetMonthDate {
    getMonthDate: (date: string | Date) => {
        currentMonthDate: {
            start: Date;
            end: Date;
        };
        previousMonthDate: {
            start: Date;
            end: Date;
        };
    };
}
declare const getI18nMessage: (i18n: I18nContextLike | null | undefined, key: string, fallback: string) => string;
export { generateAccessCode, generateRandomHex, generateRandomPassword, GenerateOtpCode, GenerateRandomString, GetMonthDate, generateVerficationCode, getI18nMessage, };
