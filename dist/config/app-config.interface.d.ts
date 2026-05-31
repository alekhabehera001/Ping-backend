export interface AppConfig {
    PORT: number;
    NODE_ENV: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRE_SECONDS: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRE_SECONDS: string;
    API_KEY: string;
    CORS_ORIGINS: string;
    LOG_LEVEL: string;
    HEADER_LANGUAGE: string;
}
