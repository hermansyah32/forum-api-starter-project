import InvariantError from './InvariantError.js';
import NotFoundError from './NotFoundError.js';
import AuthenticationError from './AuthenticationError.js';

const GeneralErrorTranslator = {
  translate(error) {
    return GeneralErrorTranslator._directories[error.message] || error;
  },
};

GeneralErrorTranslator._directories = {
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'VERIFY_USER_EXIST.NOT_FOUND': new NotFoundError('user tidak ditemukan'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'VERIFY_AUTHENTICATION_EXIST.NOT_FOUND': new AuthenticationError('Missing authentication'),
  'VERIFY_AUTHENTICATION_EXIST.INVALID_TOKEN': new AuthenticationError('akses token tidak valid'),
  'VERIFY_AUTHENTICATION_EXIST.INVALID_REFRESH_TOKEN': new InvariantError('refresh token tidak valid'),
  'VERIFY_AUTHENTICATION_EXIST.INVALID_CREDENTIALS': new AuthenticationError('kredensial yang Anda masukkan salah'),
  'VERIFY_AUTHENTICATION_EXIST.REFRESH_TOKEN_NOT_FOUND': new InvariantError('refresh token tidak ditemukan di database'),
  'VERIFY_THREAD_EXIST.NOT_FOUND': new NotFoundError('thread tidak ditemukan'),
  'VERIFY_COMMENT_EXISTS.NOT_FOUND': new NotFoundError('komentar tidak ditemukan'),
  'VERIFY_REPLY_EXISTS.NOT_FOUND': new NotFoundError('balasan tidak ditemukan'),
  'GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID': new InvariantError('harus mengirimkan thread id'),
  'GET_THREAD_USE_CASE.THREAD_ID_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('thread id harus string'),
};

export default GeneralErrorTranslator;
