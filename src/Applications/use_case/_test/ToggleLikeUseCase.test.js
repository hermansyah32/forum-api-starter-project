import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import ToggleLikeUseCase from '../ToggleLikeUseCase.js';

describe('ToggleLikeUseCase', () => {
  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(false));

    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action and Assert
    await expect(toggleLikeUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_THREAD_EXIST.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve(null));

    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action and Assert
    await expect(toggleLikeUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
  });

  it('should throw error when comment does not belong to thread', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'comment-123',
        threadId: 'thread-456', // mismatch thread
      }));

    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action and Assert
    await expect(toggleLikeUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
  });

  it('should orchestrate adding like action correctly when not liked yet', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'comment-123',
        threadId: 'thread-123',
      }));
    mockLikeRepository.checkLikeAvailability = vi.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = vi.fn()
      .mockImplementation(() => Promise.resolve('like-123'));

    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockLikeRepository.checkLikeAvailability).toBeCalledWith('thread-123', 'comment-123', 'user-123');
    expect(mockLikeRepository.addLike).toBeCalledWith('thread-123', 'comment-123', 'user-123');
  });

  it('should orchestrate deleting like action correctly when already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'comment-123',
        threadId: 'thread-123',
      }));
    mockLikeRepository.checkLikeAvailability = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = vi.fn()
      .mockImplementation(() => Promise.resolve('like-123'));

    const toggleLikeUseCase = new ToggleLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockLikeRepository.checkLikeAvailability).toBeCalledWith('thread-123', 'comment-123', 'user-123');
    expect(mockLikeRepository.deleteLike).toBeCalledWith('thread-123', 'comment-123', 'user-123');
  });
});
