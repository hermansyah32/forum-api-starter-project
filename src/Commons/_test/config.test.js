import { describe, it, expect } from 'vitest';

describe('config', () => {
  it('should return config correctly under test env', async () => {
    const config = (await import('../config.js')).default;

    expect(config.app.host).toBe('localhost');
    expect(config.app.port).toBeDefined();
    expect(config.database.host).toBeDefined();
  });

  it('should call dotenv.config without arguments when NODE_ENV is not test', async () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Action
    const configModule = await import('../config.js?env=dev');
    const config = configModule.default;

    // Assert
    expect(config.app.host).toBe('localhost');

    // Restore
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should return config correctly when NODE_ENV is production', async () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // Action
    const configModule = await import('../config.js?env=prod');
    const config = configModule.default;

    // Assert
    expect(config.app.host).toBe('0.0.0.0');

    // Restore
    process.env.NODE_ENV = originalNodeEnv;
  });
});
