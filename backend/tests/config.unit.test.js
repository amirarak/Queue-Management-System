describe('config jwt secret behavior', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  test('uses test fallback secret only in test env', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'test';

    let config;
    jest.isolateModules(() => {
      config = require('../src/config');
    });

    expect(config.jwt.secret).toBe('test-jwt-secret');
  });

  test('throws on missing secret outside test env', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';

    expect(() => {
      jest.isolateModules(() => {
        require('../src/config');
      });
    }).toThrow('JWT_SECRET must be set in environment variables');
  });
});
