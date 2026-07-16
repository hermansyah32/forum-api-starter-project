import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(commentPayload) {
    const { owner, threadId, content } = commentPayload;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, owner, thread_id, content',
      values: [id, owner, threadId, content],
    };

    const result = await this._pool.query(query);
    const data = result.rows[0];

    return new AddedComment(
      {
        id: data?.id,
        owner: data?.owner,
        content: data?.content,
      }
    );
  }

  async findCommentById(commentId) {
    const query = {
      text: 'SELECT id, owner, content, thread_id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    const data = result.rows[0];

    return {
      id: data.id,
      threadId: data.thread_id,
      owner: data.owner,
      content: data.content,
    };
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    return true;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.content, comments.is_delete, comments.created_at AS date
             FROM comments
             INNER JOIN users ON comments.owner = users.id
             WHERE comments.thread_id = $1
             ORDER BY comments.id ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.date,
      content: row.content,
      isDelete: row.is_delete,
    }));
  }
}

export default CommentRepositoryPostgres;
