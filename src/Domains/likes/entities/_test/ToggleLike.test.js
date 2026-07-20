import ToggleLike from '../ToggleLike.js';

describe('ToggleLike entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
    };

    // Action & Assert
    expect(() => new ToggleLike(payload)).toThrowError('TOGGLE_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has different type of needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 123,
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new ToggleLike(payload)).toThrowError('TOGGLE_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ToggleLike object correctly when payload is valid', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action
    const toggleLike = new ToggleLike(payload);

    // Assert
    expect(toggleLike.threadId).toEqual(payload.threadId);
    expect(toggleLike.commentId).toEqual(payload.commentId);
    expect(toggleLike.userId).toEqual(payload.userId);
  });
});
