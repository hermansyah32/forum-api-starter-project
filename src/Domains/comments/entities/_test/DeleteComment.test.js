import DeleteComment from '../DeleteComment.js';

describe('an DeleteComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const missingOwnerPayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    const missingThreadIdPayload = {
      owner: 'user-123',
      comment_id: 'comment-123',
    };

    const missingCommentIdPayload = {
      owner: 'user-123',
      thread_id: 'thread-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(missingOwnerPayload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new DeleteComment(missingThreadIdPayload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new DeleteComment(missingCommentIdPayload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const wrongCommentIdPayload = {
      owner: 'user-123',
      thread_id: 'thread-123',
      comment_id: 123,
    };

    const wrongThreadIdPayload = {
      owner: 'user-123',
      thread_id: 123,
      comment_id: 'comment-123',
    };

    const wrongOwnerPayload = {
      owner: 123,
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(wrongCommentIdPayload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new DeleteComment(wrongThreadIdPayload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new DeleteComment(wrongOwnerPayload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteComment object correctly', () => {
    // Arrange
    const payload = {
      owner: 'user-123',
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    // Action
    const deleteComment = new DeleteComment(payload);

    // Assert
    expect(deleteComment.thread_id).toEqual(payload.thread_id);
    expect(deleteComment.content).toEqual(payload.content);
    expect(deleteComment.owner).toEqual(payload.owner);
  });
});
