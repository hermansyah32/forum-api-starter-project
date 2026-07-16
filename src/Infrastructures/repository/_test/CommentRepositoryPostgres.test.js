import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AddComment from '../../../Domains/comments/entities/AddComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'a body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(`comment-${fakeIdGenerator()}`);
      expect(comments).not.toBeNull();
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'a body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: `comment-${fakeIdGenerator()}`,
        content: 'a body',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'a body',
      });

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toBe(true);
    });

    it('should return null if comment to delete is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const result = await commentRepositoryPostgres.deleteCommentById('comment-xxx');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when thread has no comments', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-xxx');

      // Assert
      expect(comments).toHaveLength(0);
    });

    it('should return comments correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'johndoe' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'content 1',
        isDelete: false,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        owner: 'user-456',
        threadId: 'thread-123',
        content: 'content 2',
        isDelete: true,
      });

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-1');
      expect(comments[0].username).toEqual('johndoe');
      expect(comments[0].content).toEqual('content 1');
      expect(comments[0].is_delete).toBe(false);
      expect(comments[0].date).toBeDefined();

      expect(comments[1].id).toEqual('comment-2');
      expect(comments[1].username).toEqual('dicoding');
      expect(comments[1].content).toEqual('content 2');
      expect(comments[1].is_delete).toBe(true);
      expect(comments[1].date).toBeDefined();
    });
  });
});
