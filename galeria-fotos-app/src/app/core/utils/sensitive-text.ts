const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const BEARER_PATTERN = /\bbearer\s+[A-Za-z0-9._~+/=-]+/gi;
const SECRET_PARAM_PATTERN = /\b(token|access_token|refresh_token|signature|sig|secret|password|X-Amz-Signature|X-Amz-Credential)=([^&\s]+)/gi;
const MAX_TEXT_LENGTH = 700;
const MAX_OBJECT_KEYS = 30;
const MAX_ARRAY_ITEMS = 20;

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

export function sanitizeMetadata(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const parsed = parseJsonIfPossible(value);
  const sanitized = sanitizeValue(parsed, 0, new WeakSet<object>());

  if (typeof sanitized === 'string') {
    return sanitized;
  }

  return JSON.stringify(sanitized, null, 2);
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
    'signature',
    'credential',
    'apikey',
    'api_key',
    'init_point',
    'initpoint',
    'payment',
    'preference',
    'tarjeta',
    'card',
    'cvv',
    'smtp',
    'resend'
  ].some((part) => normalized.includes(part));
}

function parseJsonIfPossible(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return value;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function sanitizeValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return truncate(redactSensitiveText(value));
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return '[referencia circular omitida]';
    }

    seen.add(value);
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen));

    if (value.length > MAX_ARRAY_ITEMS) {
      items.push(`${value.length - MAX_ARRAY_ITEMS} elementos omitidos`);
    }

    seen.delete(value);
    return items;
  }

  if (typeof value !== 'object') {
    return truncate(redactSensitiveText(value));
  }

  if (seen.has(value)) {
    return '[referencia circular omitida]';
  }

  if (depth >= 4) {
    return '[detalle profundo omitido]';
  }

  seen.add(value);
  const entries = Object.entries(value as Record<string, unknown>);
  const result: Record<string, unknown> = {};

  entries.slice(0, MAX_OBJECT_KEYS).forEach(([key, entryValue]) => {
    result[key] = isSensitiveKey(key) ? 'Dato tecnico oculto' : sanitizeValue(entryValue, depth + 1, seen);
  });

  if (entries.length > MAX_OBJECT_KEYS) {
    result['camposOmitidos'] = entries.length - MAX_OBJECT_KEYS;
  }

  seen.delete(value);
  return result;
}

function truncate(value: string): string {
  return value.length > MAX_TEXT_LENGTH ? `${value.slice(0, MAX_TEXT_LENGTH)}...` : value;
}
