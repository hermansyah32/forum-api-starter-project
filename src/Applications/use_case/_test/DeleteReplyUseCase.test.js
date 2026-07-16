import { vi } from 'vitest';
import DeleteReply from '../../../Domains/replies/entities/DeleteReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123', threadId: 'thread-123' }));
    mockReplyRepository.findReplyById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' }));
    mockReplyRepository.deleteReplyById = vi.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).resolves.not.toThrow();

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockReplyRepository.findReplyById).toBeCalledWith('reply-123');
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith('reply-123');
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-xxx',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(false));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrowError('VERIFY_THREAD_EXIST.NOT_FOUND');
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-xxx',
      replyId: 'reply-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve(null));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrowError('VERIFY_COMMENT_EXISTS.NOT_FOUND');
  });

  it('should throw error when reply does not exist', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-xxx',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123', threadId: 'thread-123' }));
    mockReplyRepository.findReplyById = vi.fn()
      .mockImplementation(() => Promise.resolve(null));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrowError('VERIFY_REPLY_EXISTS.NOT_FOUND');
  });

  it('should throw error when reply is forbidden (different owner)', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123', threadId: 'thread-123' }));
    mockReplyRepository.findReplyById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'reply-123', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-456' }));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrowError('DELETE_REPLY.FORBIDDEN');
  });

  it('should throw error when comment does not belong to thread', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123', threadId: 'thread-456' }));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrowError('VERIFY_COMMENT_EXISTS.NOT_FOUND');
  });

  it('should throw error when reply does not belong to comment or thread', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123', threadId: 'thread-123' }));
    mockReplyRepository.findReplyById = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'reply-123', commentId: 'comment-456', threadId: 'thread-123', owner: 'user-123' }));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrowError('VERIFY_REPLY_EXISTS.NOT_FOUND');
  });
});
