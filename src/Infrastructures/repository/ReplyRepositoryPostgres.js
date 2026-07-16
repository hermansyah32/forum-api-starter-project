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
}

export default ReplyRepositoryPostgres;
