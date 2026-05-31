import { generateSecureOTP, generateSecureOTPAsync, isValidOTP } from './codeGenerator';

describe('codeGenerator', () => {
  describe('generateSecureOTP', () => {
    it('generates a string of the correct length (default 6)', () => {
      const otp = generateSecureOTP();
      expect(otp).toHaveLength(6);
    });

    it('generates a string of a custom length', () => {
      expect(generateSecureOTP(4)).toHaveLength(4);
      expect(generateSecureOTP(8)).toHaveLength(8);
    });

    it('contains only digits', () => {
      const otp = generateSecureOTP(10);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('generates different values on successive calls', () => {
      const results = new Set(Array.from({ length: 20 }, () => generateSecureOTP()));
      // With 1,000,000 possible 6-digit OTPs the probability of 20 identical
      // results is negligible; we just need more than 1 unique value.
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('generateSecureOTPAsync', () => {
    it('resolves to a digit-only string of the requested length', async () => {
      const otp = await generateSecureOTPAsync(6);
      expect(otp).toHaveLength(6);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('defaults to length 6', async () => {
      const otp = await generateSecureOTPAsync();
      expect(otp).toHaveLength(6);
    });
  });

  describe('isValidOTP', () => {
    it('returns true for a digit-only string', () => {
      expect(isValidOTP('123456')).toBe(true);
    });

    it('returns false when the string contains non-digit characters', () => {
      expect(isValidOTP('12a456')).toBe(false);
      expect(isValidOTP('123 456')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidOTP('')).toBe(false);
    });
  });
});
