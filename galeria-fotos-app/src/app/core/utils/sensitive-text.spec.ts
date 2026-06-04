import { isSensitiveKey, redactSensitiveText, redactSensitiveValue, sanitizeMetadata, technicalReference } from './sensitive-text';

describe('sensitive text utils', () => {
  it('redacts tokens, bearer headers and URLs', () => {
    const value = redactSensitiveText('Bearer abc.def.ghi https://example.com/file?token=123');

    expect(value).toContain('Bearer [token oculto]');
    expect(value).toContain('[url oculta]');
    expect(value).not.toContain('abc.def.ghi');
    expect(value).not.toContain('token=123');
  });

  it('detects sensitive keys', () => {
    expect(isSensitiveKey('storageKey')).toBe(true);
    expect(isSensitiveKey('marcaAguaStorageKey')).toBe(true);
    expect(isSensitiveKey('signedUrl')).toBe(true);
    expect(isSensitiveKey('init_point')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('apiKey')).toBe(true);
  });

  it('hides sensitive keyed values and exposes only technical references', () => {
    expect(redactSensitiveValue('storageKey', 'folder/private-file.jpg')).toBe('Dato tecnico oculto');
    expect(technicalReference('folder/private-file.jpg')).toBe('Dato tecnico oculto (...file.jpg)');
  });

  it('sanitizes bitacora metadata without leaking signed URLs or storage keys', () => {
    const safe = sanitizeMetadata(JSON.stringify({
      storageKey: 'private/original.jpg',
      marcaAguaStorageKey: 'private/watermark.jpg',
      password: '12345678',
      apiKey: 'pexels-secret',
      callbackUrl: 'https://example.com/file.jpg?token=abc&signature=secret',
      signedUrl: 'https://cdn.example.com/original.jpg?X-Amz-Signature=abc&X-Amz-Credential=key',
      nested: {
        token: 'eyJabc.def.ghi',
        bearer: 'Bearer eyJprivate.payload.signature',
        action: 'created'
      }
    }));

    expect(safe).toContain('Dato tecnico oculto');
    expect(safe).toContain('[url oculta]');
    expect(safe).toContain('created');
    expect(safe).not.toContain('private/original.jpg');
    expect(safe).not.toContain('private/watermark.jpg');
    expect(safe).not.toContain('12345678');
    expect(safe).not.toContain('pexels-secret');
    expect(safe).not.toContain('signature=secret');
    expect(safe).not.toContain('X-Amz-Signature=abc');
    expect(safe).not.toContain('eyJabc.def.ghi');
    expect(safe).not.toContain('eyJprivate.payload.signature');
  });

  it('redacts long URLs with sensitive query values', () => {
    const value = redactSensitiveText('Descarga https://cdn.example.com/foto.jpg?access_token=abc123&sig=secret&expires=999');

    expect(value).toContain('[url oculta]');
    expect(value).not.toContain('access_token=abc123');
    expect(value).not.toContain('sig=secret');
  });
});
