import AddedThread from '../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../Domains/threads/ThreadRepository.js';

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(threadPayload) {
    const { owner, title, body } = threadPayload;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, owner, title, body',
      values: [id, owner, title, body],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async findThreadById(threadId) {
    const query = {
      text: 'SELECT id, owner, title, body FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    const { id, owner, title, body } = result.rows[0];

    return {
      id,
      title,
      owner,
      body,
    };
  }

  async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0] ? true : false;
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, users.username, threads.created_at AS date
             FROM threads
             INNER JOIN users ON threads.owner = users.id
             WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return null;
    }

    return result.rows[0];
  }
}

export default ThreadRepositoryPostgres;
