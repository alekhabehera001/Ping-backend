import * as crypto from 'node:crypto';

/**
 * Generates a secure OTP using digits 0-9
 * @param length The length of the OTP to generate
 * @returns A string containing the generated OTP
 */
export function generateSecureOTP(length: number = 6): string {
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

/**
 * Generates a secure OTP using digits 0-9 (async version)
 * @param length The length of the OTP to generate
 * @returns Promise<string> containing the generated OTP
 */
export async function generateSecureOTPAsync(length: number = 6): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const allowedDigits = '0123456789';
      const randomValues = new Uint8Array(length);

      crypto.randomFill(randomValues, (err, buf) => {
        if (err) {
          reject(
            new Error(err instanceof Error ? err.message : 'Failed to generate random values'),
          );
          return;
        }

        try {
          let otp = '';
          for (let i = 0; i < length; i++) {
            const randomIndex = buf[i] % allowedDigits.length;
            otp += allowedDigits[randomIndex];
          }
          resolve(otp);
        } catch {
          reject(new Error('Failed to generate OTP'));
        }
      });
    } catch {
      reject(new Error('Failed to initialize OTP generation'));
    }
  });
}

/**
 * Verifies if an OTP contains only allowed digits (0-9)
 * @param otp The OTP to verify
 * @returns boolean indicating if OTP is valid
 */
export function isValidOTP(otp: string): boolean {
  return /^\d+$/.test(otp);
}
