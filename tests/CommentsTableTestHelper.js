/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', owner = 'user-123', threadId = 'thread-123', content = 'some content', isDelete = false }) {
    const query = {
      text: 'INSERT INTO comments(id, owner, thread_id, content, is_delete) VALUES($1, $2, $3, $4, $5)',
      values: [id, owner, threadId, content, isDelete],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

export default CommentsTableTestHelper;
