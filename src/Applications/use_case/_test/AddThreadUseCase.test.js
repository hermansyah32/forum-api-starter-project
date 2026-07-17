import { vi } from 'vitest';
import AddThread from '../../../Domains/threads/entities/AddThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddThreadUseCase from '../AddThreadUseCase.js';


describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'some thread',
      body: 'some body',
      owner: 'user-123',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'some thread',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);
    // Assert
    expect(addedThread).toStrictEqual(mockAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });

  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      title: 'some thread',
    };

    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrow('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has different type of needed property', async () => {
    // Arrange
    const useCasePayload = {
      title: 123,
      body: 'some body',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrow('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      title: 'some thread',
      body: 'some body',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn()
      .mockImplementation(() => Promise.reject(new Error('VERIFY_THREAD_EXIST.NOT_FOUND')));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrow('VERIFY_THREAD_EXIST.NOT_FOUND');
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});