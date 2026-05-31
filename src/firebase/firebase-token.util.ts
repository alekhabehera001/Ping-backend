import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Stable provider subject from Firebase token claims (not the client).
 * Apple/Google numeric/string subs live under firebase.identities.
 */
export function extractStableSocialId(decoded: DecodedIdToken): string {
  const firebase = decoded.firebase;
  if (!firebase) {
    return decoded.uid;
  }
  const signInProvider = firebase.sign_in_provider;
  const identities = firebase.identities ?? {};

  if (signInProvider === 'apple.com') {
    const ids = identities['apple.com'];
    if (Array.isArray(ids) && ids[0]) {
      return String(ids[0]);
    }
    return decoded.uid;
  }
  if (signInProvider === 'google.com') {
    const ids = identities['google.com'];
    if (Array.isArray(ids) && ids[0]) {
      return String(ids[0]);
    }
    return decoded.uid;
  }
  if (signInProvider === 'facebook.com') {
    const ids = identities['facebook.com'];
    if (Array.isArray(ids) && ids[0]) {
      return String(ids[0]);
    }
    return decoded.uid;
  }
  return decoded.uid;
}

/** Maps Firebase sign_in_provider to our User.provider values. */
export function mapSignInProviderToApp(signInProvider: string): string {
  if (signInProvider === 'google.com') return 'google';
  if (signInProvider === 'apple.com') return 'apple';
  if (signInProvider === 'facebook.com') return 'facebook';
  return signInProvider.replace(/\.com$/, '') || 'firebase';
}
