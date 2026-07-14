import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import UserRepository from '../../../Domains/users/UserRepository.js';

const authMiddleware = (container) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    await container.getInstance(AuthenticationTokenManager.name)
      .verifyAccessToken(token);
    const decodedPayload = await container.getInstance(AuthenticationTokenManager.name)
      .decodePayload(token);
    const userDetail = await container.getInstance(UserRepository.name)
      .getUserById(decodedPayload.id);

    req.auth = userDetail;

    next();
  } catch (error) {
    next(error);
  }
};


export default authMiddleware;