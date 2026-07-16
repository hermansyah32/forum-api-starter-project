import InvariantError from './InvariantError.js';
import AuthorizationError from './AuthorizationError.js';

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
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
  'ADD_THREAD.TITLE_LIMIT_CHAR_150': new InvariantError('tidak dapat membuat thread baru karena karakter judul tidak boleh melebihi 150 karakter'),
  'ADD_THREAD.BODY_LIMIT_CHAR_2500': new InvariantError('tidak dapat membuat thread baru karena karakter konten tidak boleh melebihi 2500 karakter'),
  'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
  'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
  'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'),
  'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat komentar baru karena tipe data tidak sesuai'),
  'ADD_COMMENT.CONTENT_LIMIT_CHAR_2500': new InvariantError('tidak dapat membuat komentar baru karena karakter konten tidak boleh melebihi 2500 karakter'),
  'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'),
  'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat komentar baru karena tipe data tidak sesuai'),
  'DELETE_COMMENT.FORBIDDEN': new AuthorizationError('anda tidak memiliki hak akses untuk menghapus komentar ini'),
  'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menghapus komentar karena properti yang dibutuhkan tidak ada'),
  'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menghapus komentar karena tipe data tidak sesuai'),
  'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat detail thread karena properti yang dibutuhkan tidak ada'),
  'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat detail thread karena tipe data tidak sesuai'),
  'DETAIL_THREAD.COMMENT_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat detail thread karena properti komentar yang dibutuhkan tidak ada'),
  'DETAIL_THREAD.COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat detail thread karena tipe data komentar tidak sesuai'),
};

export default DomainErrorTranslator;
