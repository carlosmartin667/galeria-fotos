const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const BEARER_PATTERN = /\bbearer\s+[A-Za-z0-9._~+/=-]+/gi;
const SECRET_PARAM_PATTERN = /\b(token|access_token|refresh_token|signature|sig|secret|password|X-Amz-Signature|X-Amz-Credential)=([^&\s]+)/gi;

export function redactSensitiveText(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  return String(value)
    .replace(JWT_PATTERN, '[token oculto]')
    .replace(BEARER_PATTERN, 'Bearer [token oculto]')
    .replace(SECRET_PARAM_PATTERN, '$1=[oculto]')
    .replace(URL_PATTERN, '[url oculta]');
}

export function redactSensitiveValue(key: string, value: unknown): string {
  if (isSensitiveKey(key)) {
    return 'Dato tecnico oculto';
  }

  return redactSensitiveText(value);
}

export function technicalReference(value: unknown, visibleChars = 8): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const text = String(value);
  const suffix = text.length > visibleChars ? text.slice(-visibleChars) : text;
  return suffix ? `Dato tecnico oculto (...${suffix})` : 'Dato tecnico oculto';
}

export function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return [
    'storagekey',
    'marcaaguastoragekey',
    'marcaagua',
    'storage',
    'signed',
    'signedurl',
    'firmada',
    'urlfirmada',
    'token',
    'bearer',
    'access_token',
    'refresh_token',
    'secret',
    'password',
    'apikey',
    'api_key',
    'init_point',
    'initpoint',
    'smtp',
    'resend'
  ].some((part) => normalized.includes(part));
}
