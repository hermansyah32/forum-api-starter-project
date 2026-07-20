class ToggleLike {
  constructor(payload) {
    this._verifyPayload(payload);

    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.userId = payload.userId;
  }

  _verifyPayload({ threadId, commentId, userId }) {
    if (!threadId || !commentId || !userId) {
      throw new Error('TOGGLE_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof userId !== 'string') {
      throw new Error('TOGGLE_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default ToggleLike;
