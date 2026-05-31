"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSecretsFromAwsIfNeeded = loadSecretsFromAwsIfNeeded;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
function normalizeSecretJsonString(raw) {
    let s = raw;
    if (s.charCodeAt(0) === 0xfeff) {
        s = s.slice(1);
    }
    else if (s.startsWith('\u00ef\u00bb\u00bf')) {
        s = s.slice(3);
    }
    s = s.trim();
    const jsonStart = s.search(/[\[{]/);
    if (jsonStart > 0) {
        s = s.slice(jsonStart);
    }
    return s;
}
async function loadSecretsFromAwsIfNeeded() {
    if (process.env.SKIP_AWS_SECRETS === 'true') {
        return;
    }
    const secretId = process.env.AWS_SECRET_ID;
    if (!secretId) {
        return;
    }
    const region = process.env.AWS_REGION ?? 'eu-central-1';
    const client = new client_secrets_manager_1.SecretsManagerClient({ region });
    const out = await client.send(new client_secrets_manager_1.GetSecretValueCommand({ SecretId: secretId }));
    const raw = out.SecretString;
    if (!raw) {
        throw new Error(`Secrets Manager returned empty SecretString for "${secretId}"`);
    }
    const normalized = normalizeSecretJsonString(raw);
    const parsed = JSON.parse(normalized);
    for (const [key, value] of Object.entries(parsed)) {
        if (value !== undefined && value !== null) {
            process.env[key] = String(value);
        }
    }
}
//# sourceMappingURL=secrets-aws.loader.js.map