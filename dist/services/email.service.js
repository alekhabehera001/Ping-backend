"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_ses_1 = require("@aws-sdk/client-ses");
const escape_html_1 = __importDefault(require("escape-html"));
const winston_logger_service_1 = require("../logger/winston-logger.service");
function cleanEnv(value) {
    if (value == null) {
        return undefined;
    }
    const t = String(value).trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1).trim();
    }
    return t;
}
function buildOtpEmailContent(otp, expiryMinutes) {
    const safe = (0, escape_html_1.default)(otp);
    const subject = 'Your verification code';
    const text = [
        'Hi,',
        '',
        `Use this code to verify your email address:`,
        '',
        `  ${otp}`,
        '',
        `This code expires in ${expiryMinutes} minutes.`,
        '',
        `If you did not request this, you can safely ignore this email.`,
        '',
        '— Klara',
    ].join('\n');
    const fontSans = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
    const fontMono = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
    const bodyStyle = `margin:0;padding:0;background-color:#f4f4f5;font-family:${fontSans};`;
    const outerTableStyle = 'background-color:#f4f4f5;padding:32px 16px';
    const cardStyle = 'max-width:480px;background-color:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden';
    const otpBoxStyle = 'display:inline-block;padding:16px 28px;background-color:#fafafa;border:1px solid ' +
        '#e4e4e7;border-radius:8px;letter-spacing:0.35em;font-size:26px;font-weight:600;' +
        `color:#18181b;font-family:${fontMono}`;
    const htmlTdRowClose = '        </td></tr>';
    const html = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        `  <title>${(0, escape_html_1.default)(subject)}</title>`,
        '</head>',
        `<body style="${bodyStyle}">`,
        '  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">',
        `Your code: ${safe}</span>`,
        `  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${outerTableStyle}">`,
        '    <tr><td align="center">',
        `      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${cardStyle}">`,
        '        <tr><td style="padding:28px 32px 8px 32px;">',
        '          <p style="margin:0;font-size:15px;line-height:1.5;color:#3f3f46;">Hi,</p>',
        '          <p style="margin:16px 0 0 0;font-size:15px;line-height:1.5;color:#3f3f46;">',
        'Use this code to verify your email address:</p>',
        htmlTdRowClose,
        '        <tr><td align="center" style="padding:20px 32px;">',
        `          <div style="${otpBoxStyle}">`,
        `                ${safe}`,
        '              </div>',
        '            </td></tr>',
        '        <tr><td style="padding:0 32px 24px 32px;">',
        '          <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;">',
        `This code expires in <strong style="color:#52525b;">${expiryMinutes} minutes</strong>. `,
        'Do not share it with anyone.</p>',
        '          <p style="margin:16px 0 0 0;font-size:13px;line-height:1.5;color:#71717a;">',
        'If you did not request this email, you can safely ignore it.</p>',
        htmlTdRowClose,
        '        <tr><td style="padding:16px 32px 28px 32px;border-top:1px solid #f4f4f5;">',
        '          <p style="margin:0;font-size:12px;color:#a1a1aa;">— Klara</p>',
        htmlTdRowClose,
        '      </table>',
        '    </td></tr>',
        '  </table>',
        '</body>',
        '</html>',
    ].join('\n');
    return { subject, text, html };
}
let EmailService = class EmailService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
    }
    sesConfig() {
        const region = cleanEnv(this.configService.get('AWS_SES_REGION'));
        const accessKeyId = cleanEnv(this.configService.get('AWS_SES_ACCESS_KEY_ID'));
        const secretAccessKey = cleanEnv(this.configService.get('AWS_SES_SECRET_ACCESS_KEY'));
        const from = cleanEnv(this.configService.get('AWS_SES_FROM_EMAIL'));
        if (!region || !accessKeyId || !secretAccessKey || !from) {
            return null;
        }
        return { region, accessKeyId, secretAccessKey, from };
    }
    async sendViaSes(to, otp) {
        const cfg = this.sesConfig();
        if (!cfg) {
            throw new Error('SES configuration incomplete');
        }
        const client = new client_ses_1.SESClient({
            region: cfg.region,
            credentials: {
                accessKeyId: cfg.accessKeyId,
                secretAccessKey: cfg.secretAccessKey,
            },
        });
        const expiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES') ?? 5;
        const { subject, text, html } = buildOtpEmailContent(otp, expiryMinutes);
        await client.send(new client_ses_1.SendEmailCommand({
            Source: cfg.from,
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: { Charset: 'UTF-8', Data: subject },
                Body: {
                    Text: { Charset: 'UTF-8', Data: text },
                    Html: { Charset: 'UTF-8', Data: html },
                },
            },
        }));
        this.logger.log(`OTP email sent via SES to ${to}`, 'EmailService');
    }
    async sendOtpEmail(email, otp) {
        if (this.sesConfig()) {
            try {
                await this.sendViaSes(email, otp);
                return;
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`SES send failed for ${email}: ${msg}`, 'EmailService');
                throw err;
            }
        }
        const nodeEnv = this.configService.get('NODE_ENV');
        if (nodeEnv === 'development' || nodeEnv === 'test') {
            this.logger.log(`OTP for ${email}: ${otp}`, 'EmailService');
            return;
        }
        this.logger.warn(`No AWS SES env vars configured; OTP for ${email} was not emailed`, 'EmailService');
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        winston_logger_service_1.WinstonLoggerService])
], EmailService);
//# sourceMappingURL=email.service.js.map