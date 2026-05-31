export declare function parseTrustProxyValue(value: unknown): number;
export default function configuration(): {
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRE_SECONDS: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRE_SECONDS: string;
    API_KEY: string;
    CORS_ORIGINS: string;
};
