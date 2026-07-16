import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AddReply from '../../../Domains/replies/entities/AddReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const addReply = new AddReply({
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'some reply',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'some reply',
        owner: 'user-123',
      }));
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies correctly according to thread_id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'reply content 1',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'reply content 2',
        isDelete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual('reply-1');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].content).toEqual('reply content 1');
      expect(replies[0].commentId).toEqual('comment-123');
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[0].date).toBeDefined();

      expect(replies[1].id).toEqual('reply-2');
      expect(replies[1].username).toEqual('dicoding');
      expect(replies[1].content).toEqual('reply content 2');
      expect(replies[1].commentId).toEqual('comment-123');
      expect(replies[1].is_delete).toEqual(true);
      expect(replies[1].date).toBeDefined();
    });
  });

  describe('findReplyById function', () => {
    it('should return null when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const reply = await replyRepositoryPostgres.findReplyById('reply-xxx');
      expect(reply).toBeNull();
    });

    it('should return reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'reply content',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const reply = await replyRepositoryPostgres.findReplyById('reply-123');

      // Assert
      expect(reply).toStrictEqual({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        content: 'reply content',
      });
    });
  });

  describe('deleteReplyById function', () => {
    it('should throw error when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await expect(replyRepositoryPostgres.deleteReplyById('reply-xxx')).rejects.toThrowError('REPLY_REPOSITORY.REPLY_NOT_FOUND');
    });

    it('should delete reply correctly (update is_delete to true)', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'reply content',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });
});
