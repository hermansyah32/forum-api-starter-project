import InvariantError from './InvariantError.js';
import NotFoundError from './NotFoundError.js';
import AuthorizationError from './AuthorizationError.js';
import AuthenticationError from './AuthenticationError.js';

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
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
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
  'ADD_THREAD.TITLE_LIMIT_CHAR_150': new InvariantError('tidak dapat membuat thread baru karena karakter judul tidak boleh melebihi 150 karakter'),
  'ADD_THREAD.BODY_LIMIT_CHAR_2500': new InvariantError('tidak dapat membuat thread baru karena karakter konten tidak boleh melebihi 2500 karakter'),
  'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
  'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
  'VERIFY_THREAD_EXIST.NOT_FOUND': new NotFoundError('thread tidak ditemukan'),
  'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'),
  'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat komentar baru karena tipe data tidak sesuai'),
  'ADD_COMMENT.CONTENT_LIMIT_CHAR_2500': new InvariantError('tidak dapat membuat komentar baru karena karakter konten tidak boleh melebihi 2500 karakter'),
  'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'),
  'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat komentar baru karena tipe data tidak sesuai'),
  'VERIFY_COMMENT_EXISTS.NOT_FOUND': new NotFoundError('komentar tidak ditemukan'),
  'DELETE_COMMENT.FORBIDDEN': new AuthorizationError('anda tidak memiliki hak akses untuk menghapus komentar ini'),
  'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menghapus komentar karena properti yang dibutuhkan tidak ada'),
  'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menghapus komentar karena tipe data tidak sesuai'),
  'GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID': new InvariantError('harus mengirimkan thread id'),
  'GET_THREAD_USE_CASE.THREAD_ID_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('thread id harus string'),
  'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat detail thread karena properti yang dibutuhkan tidak ada'),
  'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat detail thread karena tipe data tidak sesuai'),
  'DETAIL_THREAD.COMMENT_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat detail thread karena properti komentar yang dibutuhkan tidak ada'),
  'DETAIL_THREAD.COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat detail thread karena tipe data komentar tidak sesuai'),
};

export default DomainErrorTranslator;
