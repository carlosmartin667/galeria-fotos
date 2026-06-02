const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const SECRET_PARAM_PATTERN = /\b(token|access_token|refresh_token|signature|sig|secret|password|X-Amz-Signature|X-Amz-Credential)=([^&\s]+)/gi;

export function redactSensitiveText(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  return String(value)
    .replace(JWT_PATTERN, '[token oculto]')
    .replace(SECRET_PARAM_PATTERN, '$1=[oculto]')
    .replace(URL_PATTERN, '[url oculta]');
}

export function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return [
    'storagekey',
    'storage',
    'signed',
    'firmada',
    'token',
    'secret',
    'password',
    'apikey',
    'api_key',
    'smtp',
    'resend',
    'urlfirmada'
  ].some((part) => normalized.includes(part));
}
