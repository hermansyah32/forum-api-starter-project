import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import AddThread from '../../../Domains/threads/entities/AddThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        owner: 'user-123',
        title: 'a title',
        body: 'a body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById(`thread-${fakeIdGenerator()}`);
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        owner: 'user-123',
        title: 'a title',
        body: 'a body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a title',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadExist function', () => {
    it('should return true when thread exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadId = `thread${fakeIdGenerator()}`;
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const isExist = await threadRepositoryPostgres.verifyThreadExist(threadId);

      // Assert
      expect(isExist).toBe(true);
    });

    it('should return false when thread does not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadId = `thread${fakeIdGenerator()}`;
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const isExist = await threadRepositoryPostgres.verifyThreadExist(threadId);

      // Assert
      expect(isExist).toBe(false);
    });
  });

  describe('findThreadById function', () => {
    it('should return null when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.findThreadById('thread-xxx');

      // Assert
      expect(thread).toBeNull();
    });

    it('should return thread details correctly when thread is found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        owner: 'user-123',
      });

      // Action
      const thread = await threadRepositoryPostgres.findThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'a title',
        body: 'a body',
        owner: 'user-123',
      });
    });
  });
});
