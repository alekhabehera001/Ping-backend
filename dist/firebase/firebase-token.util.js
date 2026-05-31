"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStableSocialId = extractStableSocialId;
exports.mapSignInProviderToApp = mapSignInProviderToApp;
function extractStableSocialId(decoded) {
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
function mapSignInProviderToApp(signInProvider) {
    if (signInProvider === 'google.com')
        return 'google';
    if (signInProvider === 'apple.com')
        return 'apple';
    if (signInProvider === 'facebook.com')
        return 'facebook';
    return signInProvider.replace(/\.com$/, '') || 'firebase';
}
//# sourceMappingURL=firebase-token.util.js.map