"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTrustProxyValue = parseTrustProxyValue;
exports.default = configuration;
function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}. Set it in your .env file.`);
    }
    return value;
}
function optionalEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
}
function optionalEnvPort(key, defaultValue) {
    const raw = process.env[key];
    if (raw === undefined || raw.trim() === '') {
        return defaultValue;
    }
    const n = Number(raw.trim());
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
        return defaultValue;
    }
    return n;
}
function parseTrustProxyValue(value) {
    if (value === undefined || value === null || value === '') {
        return 0;
    }
    if (typeof value === 'number') {
        if (Number.isInteger(value) && value >= 0 && value <= 32) {
            return value;
        }
        return 0;
    }
    const raw = String(value).trim();
    if (raw === '') {
        return 0;
    }
    const lower = raw.toLowerCase();
    if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'off') {
        return 0;
    }
    if (lower === 'true' || lower === 'yes' || lower === 'on') {
        return 1;
    }
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= 32) {
        return n;
    }
    return 0;
}
function configuration() {
    return {
        PORT: optionalEnvPort('PORT', 3000),
        MONGO_URI: requireEnv('MONGO_URI'),
        JWT_SECRET: requireEnv('JWT_SECRET'),
        JWT_EXPIRE_SECONDS: optionalEnv('JWT_EXPIRE_SECONDS', '15m'),
        JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
        JWT_REFRESH_EXPIRE_SECONDS: optionalEnv('JWT_REFRESH_EXPIRE_SECONDS', '7d'),
        API_KEY: requireEnv('API_KEY'),
        CORS_ORIGINS: optionalEnv('CORS_ORIGINS', 'http://localhost:3000'),
    };
}
//# sourceMappingURL=config.js.map