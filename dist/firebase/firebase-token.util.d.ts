import type { DecodedIdToken } from 'firebase-admin/auth';
export declare function extractStableSocialId(decoded: DecodedIdToken): string;
export declare function mapSignInProviderToApp(signInProvider: string): string;
