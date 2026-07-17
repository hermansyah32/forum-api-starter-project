import { vi } from 'vitest';
import AddComment from '../../../Domains/comments/entities/AddComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import AddCommentUseCase from '../AddCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';


describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      content: 'some comment',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'some comment',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = vi.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);
    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      content: useCasePayload.content,
    }));
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      content: 'some comment',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(false));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_THREAD_EXIST.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
  });

  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
    };
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action and Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has different type of needed property', async () => {
    // Arrange
    const useCasePayload = {
      owner: 123,
      threadId: 'thread-123',
      content: 'some comment',
    };
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action and Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when comment not found', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      content: 'some comment',
    };

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = vi.fn()
      .mockImplementation(() => Promise.reject(new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND')));
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      content: useCasePayload.content,
    }));
  });
});