import { vi } from 'vitest';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import DeleteComment from '../../../Domains/comments/entities/DeleteComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';


describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockDeleteCommentPayload = new DeleteComment(useCasePayload);
    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'some comment',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockCommentRepository.deleteCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const deletedComment = await deleteCommentUseCase.execute(mockDeleteCommentPayload);

    // Assert
    expect(deletedComment).toStrictEqual(true);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(mockDeleteCommentPayload.threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(mockDeleteCommentPayload.commentId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(mockDeleteCommentPayload.commentId);
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(false));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_THREAD_EXIST.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve(null));
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCasePayload.commentId);
  });

  it('should throw error when user is not authorized to delete the comment', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'some comment',
      owner: 'user-456', // different owner
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findCommentById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('DELETE_COMMENT.FORBIDDEN');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCasePayload.commentId);
  });
});