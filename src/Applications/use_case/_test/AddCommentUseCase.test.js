import { vi } from 'vitest';
import AddComment from '../../../Domains/comments/entities/AddComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import AddCommentUseCase from '../AddCommentUseCase.js';


describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      thread_id: 'thread-123',
      content: 'some comment',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      thread_id: useCasePayload.thread_id,
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = vi.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);
    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      owner: useCasePayload.owner,
      thread_id: useCasePayload.thread_id,
      content: useCasePayload.content,
    }));
  });
});