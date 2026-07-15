import AuthenticationTokenManager from '../../Applications/security/AuthenticationTokenManager.js';
import config from '../../Commons/config.js';

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    return this._jwt.sign(payload, config.auth.accessTokenKey);
  }

  async createRefreshToken(payload) {
    return this._jwt.sign(payload, config.auth.refreshTokenKey);
  }

  async verifyRefreshToken(token) {
    try {
      this._jwt.verify(token, config.auth.refreshTokenKey);
    } catch {
      throw new Error('VERIFY_AUTHENTICATION_EXIST.INVALID_REFRESH_TOKEN');
    }
  }

  async verifyAccessToken(token) {
    try {
      this._jwt.verify(token, config.auth.accessTokenKey);
    } catch {
      throw new Error('VERIFY_AUTHENTICATION_EXIST.INVALID_TOKEN');
    }
  }

  async decodePayload(token) {
    const payload = this._jwt.decode(token);
    return payload;
  }
}

export default JwtTokenManager;