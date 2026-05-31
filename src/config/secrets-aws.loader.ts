import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

/**
 * Normalize secret payload before JSON.parse: BOM variants, then trim, then drop any junk before first `{` or `[`.
 */
function normalizeSecretJsonString(raw: string): string {
  let s = raw;
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1);
  } else if (s.startsWith('\u00ef\u00bb\u00bf')) {
    s = s.slice(3);
  }
  s = s.trim();
  const jsonStart = s.search(/[\[{]/);
  if (jsonStart > 0) {
    s = s.slice(jsonStart);
  }
  return s;
}

/**
 * Loads JSON key/value from AWS Secrets Manager into process.env before Nest bootstrap.
 * Uses the EC2 instance profile (IAM role) — no access keys on the server.
 *
 * Local dev: set SKIP_AWS_SECRETS=true and use .env as usual.
 */
export async function loadSecretsFromAwsIfNeeded(): Promise<void> {
  if (process.env.SKIP_AWS_SECRETS === 'true') {
    return;
  }

  const secretId = process.env.AWS_SECRET_ID;
  if (!secretId) {
    return;
  }

  const region = process.env.AWS_REGION ?? 'eu-central-1';

  const client = new SecretsManagerClient({ region });
  const out = await client.send(new GetSecretValueCommand({ SecretId: secretId }));

  const raw = out.SecretString;
  if (!raw) {
    throw new Error(`Secrets Manager returned empty SecretString for "${secretId}"`);
  }

  const normalized = normalizeSecretJsonString(raw);
  const parsed = JSON.parse(normalized) as Record<string, unknown>;
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined && value !== null) {
      process.env[key] = String(value);
    }
  }
}
