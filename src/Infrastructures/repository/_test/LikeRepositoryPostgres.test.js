import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    // Add setup data: user, thread, and comment
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like in database and return like id correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likeId = await likeRepositoryPostgres.addLike('thread-123', 'comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likeId).toEqual('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like correctly and return like id of the deleted record', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const deletedId = await likeRepositoryPostgres.deleteLike('thread-123', 'comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(deletedId).toEqual('like-123');
      expect(likes).toHaveLength(0);
    });

    it('should return null if trying to delete a non-existent like', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const deletedId = await likeRepositoryPostgres.deleteLike('thread-123', 'comment-123', 'user-123');

      // Assert
      expect(deletedId).toBeNull();
    });
  });

  describe('checkLikeAvailability function', () => {
    it('should return true if like exists', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const hasLiked = await likeRepositoryPostgres.checkLikeAvailability('thread-123', 'comment-123', 'user-123');

      // Assert
      expect(hasLiked).toBe(true);
    });

    it('should return false if like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const hasLiked = await likeRepositoryPostgres.checkLikeAvailability('thread-123', 'comment-123', 'user-123');

      // Assert
      expect(hasLiked).toBe(false);
    });
  });

  describe('getLikeCountsByThreadId function', () => {
    it('should return empty array when thread has no likes', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(0);
    });

    it('should return like counts grouped by comment ID correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'john' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });

      // comment-123 gets 2 likes
      await LikesTableTestHelper.addLike({ id: 'like-1', threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-2', threadId: 'thread-123', commentId: 'comment-123', userId: 'user-456' });
      // comment-456 gets 1 like
      await LikesTableTestHelper.addLike({ id: 'like-3', threadId: 'thread-123', commentId: 'comment-456', userId: 'user-123' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(2);
      const comment1Likes = likeCounts.find((lc) => lc.comment_id === 'comment-123');
      const comment2Likes = likeCounts.find((lc) => lc.comment_id === 'comment-456');

      expect(comment1Likes.like_count).toEqual(2);
      expect(comment2Likes.like_count).toEqual(1);
    });
  });
});
