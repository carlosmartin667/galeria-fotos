import { isSensitiveKey, redactSensitiveText, redactSensitiveValue, technicalReference } from './sensitive-text';

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
  });

  it('hides sensitive keyed values and exposes only technical references', () => {
    expect(redactSensitiveValue('storageKey', 'folder/private-file.jpg')).toBe('Dato tecnico oculto');
    expect(technicalReference('folder/private-file.jpg')).toBe('Dato tecnico oculto (...file.jpg)');
  });
});
