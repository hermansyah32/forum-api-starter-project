import AuthenticationRepository from '../../../Domains/authentications/AuthenticationRepository.js';
import AuthenticationTokenManager from '../../security/AuthenticationTokenManager.js';
import RefreshAuthenticationUseCase from '../RefreshAuthenticationUseCase.js';
import { vi } from 'vitest';

describe('RefreshAuthenticationUseCase', () => {
  it('should throw error if use case payload not contain refresh token', async () => {
    // Arrange
    const useCasePayload = {};
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action & Assert
    await expect(refreshAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
  });

  it('should throw error if refresh token not string', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 1,
    };
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action & Assert
    await expect(refreshAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the refresh authentication action correctly', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 'some_refresh_token',
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    // Mocking
    mockAuthenticationRepository.checkAvailabilityToken = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockAuthenticationTokenManager.verifyRefreshToken = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = vi.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));
    mockAuthenticationTokenManager.createAccessToken = vi.fn()
      .mockImplementation(() => Promise.resolve('some_new_access_token'));
    // Create the use case instace
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const accessToken = await refreshAuthenticationUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationTokenManager.verifyRefreshToken)
      .toBeCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationRepository.checkAvailabilityToken)
      .toBeCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationTokenManager.createAccessToken)
      .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
    expect(accessToken).toEqual('some_new_access_token');
  });

  it('should throw error when refresh token verification fails', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 'some_refresh_token',
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    mockAuthenticationTokenManager.verifyRefreshToken = vi.fn()
      .mockImplementation(() => Promise.reject(new Error('VERIFY_AUTHENTICATION_EXIST.INVALID_REFRESH_TOKEN')));

    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(refreshAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_AUTHENTICATION_EXIST.INVALID_REFRESH_TOKEN');
    expect(mockAuthenticationTokenManager.verifyRefreshToken).toBeCalledWith(useCasePayload.refreshToken);
  });

  it('should throw error when refresh token not found in database', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 'some_refresh_token',
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    mockAuthenticationTokenManager.verifyRefreshToken = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationRepository.checkAvailabilityToken = vi.fn()
      .mockImplementation(() => Promise.reject(null));

    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(refreshAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrow('AUTHENTICATION_REPOSITORY.TOKEN_NOT_FOUND');
    expect(mockAuthenticationTokenManager.verifyRefreshToken).toBeCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith(useCasePayload.refreshToken);
  });
});
