import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import AuthenticationRepositoryPostgres from '../AuthenticationRepositoryPostgres.js';
import { expect } from 'vitest';

describe('AuthenticationRepository postgres', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addToken function', () => {
    it('should add token to database', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action
      await authenticationRepository.addToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('checkAvailabilityToken function', () => {
    it('should return null if token not available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action
      const result = await authenticationRepository.checkAvailabilityToken(token);

      // Assert
      expect(result).toBeNull();
    });

    it('should not return null if token available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      const result = await authenticationRepository.checkAvailabilityToken(token);

      // Assert
      expect(result).not.toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('should delete token from database', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      await authenticationRepository.deleteToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
