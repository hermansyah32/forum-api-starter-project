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
      id: useCasePayload.commentId,
      content: 'some comment',
      owner: useCasePayload.owner,
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
    expect(mockCommentRepository.findCommentById).toBeCalledWith(mockDeleteCommentPayload.commentId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(mockDeleteCommentPayload.commentId);
  });
});