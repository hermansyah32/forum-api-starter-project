import GeneralErrorTranslator from '../GeneralErrorTranslator.js';
import InvariantError from '../InvariantError.js';
import NotFoundError from '../NotFoundError.js';
import AuthenticationError from '../AuthenticationError.js';

describe('GeneralErrorTranslator', () => {
  it('should translate error correctly', () => {
    expect(GeneralErrorTranslator.translate(new Error('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('harus mengirimkan username dan password'));
    expect(GeneralErrorTranslator.translate(new Error('VERIFY_USER_EXIST.NOT_FOUND')))
      .toStrictEqual(new NotFoundError('user tidak ditemukan'));
    expect(GeneralErrorTranslator.translate(new Error('VERIFY_AUTHENTICATION_EXIST.NOT_FOUND')))
      .toStrictEqual(new AuthenticationError('Missing authentication'));
    expect(GeneralErrorTranslator.translate(new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND')))
      .toStrictEqual(new NotFoundError('komentar tidak ditemukan'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = GeneralErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
