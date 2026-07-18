import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(threadId, commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes(id, thread_id, comment_id, user_id) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, threadId, commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async deleteLike(threadId, commentId, userId) {
    const query = {
      text: 'DELETE FROM likes WHERE thread_id = $1 AND comment_id = $2 AND user_id = $3 RETURNING id',
      values: [threadId, commentId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return null;
    }
    return result.rows[0].id;
  }

  async checkLikeAvailability(threadId, commentId, userId) {
    const query = {
      text: 'SELECT id FROM likes WHERE thread_id = $1 AND comment_id = $2 AND user_id = $3',
      values: [threadId, commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `SELECT comment_id, COUNT(id)::int AS like_count 
             FROM likes 
             WHERE thread_id = $1 
             GROUP BY comment_id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default LikeRepositoryPostgres;
