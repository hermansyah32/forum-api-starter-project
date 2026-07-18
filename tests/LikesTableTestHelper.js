/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const LikesTableTestHelper = {
  async addLike({ id = 'like-123', threadId = 'thread-123', commentId = 'comment-123', userId = 'user-123' }) {
    const query = {
      text: 'INSERT INTO likes(id, thread_id, comment_id, user_id) VALUES($1, $2, $3, $4)',
      values: [id, threadId, commentId, userId],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

export default LikesTableTestHelper;
