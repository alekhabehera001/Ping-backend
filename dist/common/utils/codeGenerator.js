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
exports.generateSecureOTP = generateSecureOTP;
exports.generateSecureOTPAsync = generateSecureOTPAsync;
exports.isValidOTP = isValidOTP;
const crypto = __importStar(require("node:crypto"));
function generateSecureOTP(length = 6) {
    const allowedDigits = '0123456789';
    const randomValues = new Uint8Array(length);
    crypto.randomFillSync(randomValues);
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = randomValues[i] % allowedDigits.length;
        otp += allowedDigits[randomIndex];
    }
    return otp;
}
async function generateSecureOTPAsync(length = 6) {
    return new Promise((resolve, reject) => {
        try {
            const allowedDigits = '0123456789';
            const randomValues = new Uint8Array(length);
            crypto.randomFill(randomValues, (err, buf) => {
                if (err) {
                    reject(new Error(err instanceof Error ? err.message : 'Failed to generate random values'));
                    return;
                }
                try {
                    let otp = '';
                    for (let i = 0; i < length; i++) {
                        const randomIndex = buf[i] % allowedDigits.length;
                        otp += allowedDigits[randomIndex];
                    }
                    resolve(otp);
                }
                catch {
                    reject(new Error('Failed to generate OTP'));
                }
            });
        }
        catch {
            reject(new Error('Failed to initialize OTP generation'));
        }
    });
}
function isValidOTP(otp) {
    return /^\d+$/.test(otp);
}
//# sourceMappingURL=codeGenerator.js.map