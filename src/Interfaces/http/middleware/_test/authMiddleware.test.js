import { describe, expect, it, vi } from 'vitest';
import authMiddleware from '../authMiddleware.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import UserRepository from '../../../../Domains/users/UserRepository.js';

describe('authMiddleware', () => {
  it('should throw authentication error key when authorization header is missing', async () => {
    //arrange
    const middleware = authMiddleware({});
    const req = {
      headers: {},
    };
    const res = {};
    const next = vi.fn();

    //action
    await middleware(req, res, next);

    //assert
    expect(next).toBeCalledWith(new Error('VERIFY_AUTHENTICATION_EXIST.NOT_FOUND'));
  });

  it('should throw authentication error key when authorization header is not Bearer', async () => {
    //arrange
    const middleware = authMiddleware({});
    const req = {
      headers: {
        authorization: 'Basic some-credentials',
      },
    };
    const res = {};
    const next = vi.fn();

    //action
    await middleware(req, res, next);

    //assert
    expect(next).toBeCalledWith(new Error('VERIFY_AUTHENTICATION_EXIST.NOT_FOUND'));
  });

  it('should throw authentication error key when token verification fails', async () => {
    //arrange
    const mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyAccessToken = vi.fn()
      .mockImplementation(() => Promise.reject(new Error('VERIFY_AUTHENTICATION_EXIST.INVALID_TOKEN')));

    const mockContainer = {
      getInstance: vi.fn().mockReturnValue(mockTokenManager),
    };

    const middleware = authMiddleware(mockContainer);
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };
    const res = {};
    const next = vi.fn();

    //action
    await middleware(req, res, next);

    //assert
    expect(mockContainer.getInstance).toBeCalledWith(AuthenticationTokenManager.name);
    expect(mockTokenManager.verifyAccessToken).toBeCalledWith('invalid-token');
    expect(next).toBeCalledWith(new Error('VERIFY_AUTHENTICATION_EXIST.INVALID_TOKEN'));
  });

  it('should verify token, decode payload and assign to req.auth on success', async () => {
    //arrange
    const mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyAccessToken = vi.fn().mockImplementation(() => Promise.resolve());
    mockTokenManager.decodePayload = vi.fn().mockImplementation(() => Promise.resolve({ id: 'user-123', username: 'username-of-user' }));

    const mockUserRepository = new UserRepository();
    mockUserRepository.getUserById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'user-123', username: 'username-of-user', fullname: 'Fullname of User' }));

    const mockContainer = {
      getInstance: vi.fn().mockImplementation((name) => {
        if (name === AuthenticationTokenManager.name) {
          return mockTokenManager;
        }
        if (name === UserRepository.name) {
          return mockUserRepository;
        }
        return null;
      }),
    };

    const middleware = authMiddleware(mockContainer);
    const req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    const res = {};
    const next = vi.fn();

    //action
    await middleware(req, res, next);

    //assert
    expect(mockContainer.getInstance).toBeCalledWith(AuthenticationTokenManager.name);
    expect(mockTokenManager.verifyAccessToken).toBeCalledWith('valid-token');
    expect(mockTokenManager.decodePayload).toBeCalledWith('valid-token');
    expect(req.auth).toStrictEqual({ id: 'user-123', username: 'username-of-user', fullname: 'Fullname of User' });
    expect(next).toBeCalledWith();
  });

  // TODO: Add this test later
  // it('should throw authentication error key when user is not found', async () => {
  //   //arrange
  //   const mockTokenManager = new AuthenticationTokenManager();
  //   mockTokenManager.verifyAccessToken = vi.fn().mockImplementation(() => Promise.resolve());
  //   mockTokenManager.decodePayload = vi.fn().mockImplementation(() => Promise.resolve({ id: 'user-123' }));

  //   const mockUserRepository = new UserRepository();
  //   mockUserRepository.getUserById = vi.fn().mockImplementation(() => Promise.resolve(null));

  //   const mockContainer = {
  //     getInstance: vi.fn().mockImplementation((name) => {
  //       if (name === AuthenticationTokenManager.name) {
  //         return mockTokenManager;
  //       }
  //       if (name === UserRepository.name) {
  //         return mockUserRepository;
  //       }
  //       return null;
  //     }),
  //   };

  //   const middleware = authMiddleware(mockContainer);
  //   const req = {
  //     headers: {
  //       authorization: 'Bearer valid-token',
  //     },
  //   };
  //   const res = {};
  //   const next = vi.fn();

  //   //action
  //   await middleware(req, res, next);

  //   //assert
  //   expect(next).toBeCalledWith(new Error('VERIFY_USER_EXIST.NOT_FOUND'));
  // });
});