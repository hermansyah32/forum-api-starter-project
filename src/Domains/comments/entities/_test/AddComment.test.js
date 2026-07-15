import AddComment from '../AddComment.js';

describe('an AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const missingOwnerPayload = {
      thread_id: 'thread-123',
      content: 'Forum content',
    };

    const missingThreadIdPayload = {
      owner: 'user-123',
      content: 'Forum content',
    };

    const missingContentPayload = {
      owner: 'user-123',
      thread_id: 'thread-123',
    };

    // Action and Assert
    expect(() => new AddComment(missingOwnerPayload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new AddComment(missingThreadIdPayload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new AddComment(missingContentPayload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const wrongContentPayload = {
      owner: 'user-123',
      thread_id: 'thread-123',
      content: 123,
    };

    const wrongThread_idPayload = {
      owner: 'user-123',
      thread_id: 123,
      content: 'Forum content',
    };

    const wrongOwnerPayload = {
      owner: 123,
      thread_id: 'thread-123',
      content: 'Forum content',
    };

    // Action and Assert
    expect(() => new AddComment(wrongContentPayload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new AddComment(wrongThread_idPayload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new AddComment(wrongOwnerPayload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload content more than 2500 characters', () => {
    // Arrange
    const randomTextContent = 'a'.repeat(2501);
    const payload = {
      owner: 'user-123',
      thread_id: 'thread-123',
      content: randomTextContent,
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.CONTENT_LIMIT_CHAR_2500');
  });

  it('should create addComment object correctly', () => {
    // Arrange
    const payload = {
      owner: 'user-123',
      thread_id: 'thread-123',
      content: 'Comment content',
    };

    // Action
    const addComment = new AddComment(payload);

    // Assert
    expect(addComment.thread_id).toEqual(payload.thread_id);
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.owner).toEqual(payload.owner);
  });
});
