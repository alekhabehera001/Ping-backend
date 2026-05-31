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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
const winston_logger_service_1 = require("../logger/winston-logger.service");
const firebase_token_util_1 = require("./firebase-token.util");
function normalizePrivateKeyFromEnv(key) {
    return key.replaceAll(String.raw `\n`, '\n');
}
let FirebaseService = class FirebaseService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        const nodeEnv = this.configService.get('NODE_ENV');
        if (nodeEnv !== 'test' && !admin.apps.length) {
            const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT')?.trim();
            if (serviceAccountJson) {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
                });
            }
            else {
                const projectId = this.configService.get('PROJECT_ID')?.trim();
                const privateKeyRaw = this.configService.get('PRIVATE_KEY')?.trim();
                const clientEmail = this.configService.get('CLIENT_EMAIL')?.trim();
                if (projectId && privateKeyRaw && clientEmail) {
                    admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId,
                            privateKey: normalizePrivateKeyFromEnv(privateKeyRaw),
                            clientEmail,
                        }),
                    });
                }
                else {
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                }
            }
        }
    }
    async verifySocialIdToken(idToken) {
        const tokenLength = idToken?.length ?? 0;
        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            const signInProvider = decoded.firebase?.sign_in_provider ?? '';
            const stableSocialId = (0, firebase_token_util_1.extractStableSocialId)(decoded);
            const appProvider = (0, firebase_token_util_1.mapSignInProviderToApp)(signInProvider);
            return {
                email: decoded.email,
                firebaseUid: decoded.uid,
                stableSocialId,
                signInProvider,
                appProvider,
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'unknown';
            this.logger.warn(`Firebase ID token verification failed: ${message}; tokenLength=${tokenLength}`, 'FirebaseService');
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        winston_logger_service_1.WinstonLoggerService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map