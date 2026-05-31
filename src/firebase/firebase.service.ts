import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { extractStableSocialId, mapSignInProviderToApp } from './firebase-token.util';

export interface VerifiedFirebaseSocialToken {
  email: string | undefined;
  firebaseUid: string;
  stableSocialId: string;
  signInProvider: string;
  appProvider: string;
}

/** PEM in .env often stores newlines as the two characters \n — normalize for crypto. */
function normalizePrivateKeyFromEnv(key: string): string {
  return key.replaceAll(String.raw`\n`, '\n');
}

@Injectable()
export class FirebaseService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv !== 'test' && !admin.apps.length) {
      const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT')?.trim();
      if (serviceAccountJson) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
        });
      } else {
        const projectId = this.configService.get<string>('PROJECT_ID')?.trim();
        const privateKeyRaw = this.configService.get<string>('PRIVATE_KEY')?.trim();
        const clientEmail = this.configService.get<string>('CLIENT_EMAIL')?.trim();
        if (projectId && privateKeyRaw && clientEmail) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey: normalizePrivateKeyFromEnv(privateKeyRaw),
              clientEmail,
            }),
          });
        } else {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
        }
      }
    }
  }

  /**
   * Verifies a Firebase ID token and returns trusted identity fields only.
   * Never surfaces Firebase error details to callers.
   */
  async verifySocialIdToken(idToken: string): Promise<VerifiedFirebaseSocialToken> {
    const tokenLength = idToken?.length ?? 0;
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const signInProvider = decoded.firebase?.sign_in_provider ?? '';
      const stableSocialId = extractStableSocialId(decoded);
      const appProvider = mapSignInProviderToApp(signInProvider);

      return {
        email: decoded.email,
        firebaseUid: decoded.uid,
        stableSocialId,
        signInProvider,
        appProvider,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      this.logger.warn(
        `Firebase ID token verification failed: ${message}; tokenLength=${tokenLength}`,
        'FirebaseService',
      );
      throw new UnauthorizedException('Invalid token');
    }
  }
}
