import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(replyPayload) {
    const { owner, threadId, commentId, content } = replyPayload;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies(id, owner, thread_id, comment_id, content) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, threadId, commentId, content],
    };

    const result = await this._pool.query(query);
    const data = result.rows[0];

    return new AddedReply({
      id: data?.id,
      content: data?.content,
      owner: data?.owner,
    });
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, users.username, replies.content, replies.created_at AS date, replies.comment_id, replies.is_delete 
             FROM replies 
             INNER JOIN users ON replies.owner = users.id 
             WHERE replies.thread_id = $1 
             ORDER BY replies.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      content: row.content,
      date: row.date,
      commentId: row.comment_id,
      is_delete: row.is_delete,
    }));
  }
}

export default ReplyRepositoryPostgres;
