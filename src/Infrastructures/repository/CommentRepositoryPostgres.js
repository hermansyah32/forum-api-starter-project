import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(commentPayload) {
    const { owner, thread_id, content } = commentPayload;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, owner, thread_id, content',
      values: [id, owner, thread_id, content],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async findCommentById(commentId) {
    const query = {
      text: 'SELECT id, owner, content, thread_id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('comment tidak ditemukan');
    }

    const { id, owner, thread_id, content } = result.rows[0];

    return {
      id,
      thread_id,
      owner,
      content,
    };
  }
}

export default CommentRepositoryPostgres;
