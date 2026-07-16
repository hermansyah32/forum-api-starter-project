/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    owner = 'user-123',
    threadId = 'thread-123',
    commentId = 'comment-123',
    content = 'some reply content',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies(id, owner, thread_id, comment_id, content, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, owner, threadId, commentId, content, isDelete],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

export default RepliesTableTestHelper;
