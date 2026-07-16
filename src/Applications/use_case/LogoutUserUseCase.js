class LogoutUserUseCase {
  constructor({
    authenticationRepository,
  }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { refreshToken } = useCasePayload;
    const result = await this._authenticationRepository.checkAvailabilityToken(refreshToken);
    if (!result) {
      throw new Error('VERIFY_AUTHENTICATION_EXIST.REFRESH_TOKEN_NOT_FOUND');
    }
    await this._authenticationRepository.deleteToken(refreshToken);
  }

  _validatePayload(payload) {
    const { refreshToken } = payload;
    if (!refreshToken) {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    }

    if (typeof refreshToken !== 'string') {
      throw new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default LogoutUserUseCase;
