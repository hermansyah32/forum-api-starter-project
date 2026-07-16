import { vi } from 'vitest';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import GetThreadUseCase from '../GetThreadUseCase.js';

describe('GetThreadUseCase', () => {
  it('should orchestrate the get thread details action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = {
      id: threadId,
      title: 'some thread',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        content: 'content 1',
        date: '2021-08-08T07:26:21.497Z',
        isDelete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        content: 'content 2',
        date: '2021-08-08T07:28:21.497Z',
        isDelete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread).toStrictEqual(new DetailThread({
      id: 'thread-123',
      title: 'some thread',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:26:21.497Z',
          content: 'content 1',
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:28:21.497Z',
          content: '**komentar telah dihapus**',
        },
      ],
    }));

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const threadId = 'thread-xxx';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExist = vi.fn()
      .mockImplementation(() => Promise.resolve(false));

    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(getThreadUseCase.execute(threadId))
      .rejects
      .toThrow('VERIFY_THREAD_EXIST.NOT_FOUND');
  });

  it('should throw error when payload does not contain thread id', async () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(getThreadUseCase.execute({}))
      .rejects
      .toThrow('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error when thread id does not meet data type specification', async () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(getThreadUseCase.execute(123))
      .rejects
      .toThrow('GET_THREAD_USE_CASE.THREAD_ID_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload is null or undefined', async () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(getThreadUseCase.execute(null))
      .rejects
      .toThrow('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error when thread id in payload object is not a string', async () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(getThreadUseCase.execute({ threadId: 123 }))
      .rejects
      .toThrow('GET_THREAD_USE_CASE.THREAD_ID_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
