class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, owner, threadId, content } = payload;

    this.id = id;
    this.owner = owner;
    this.threadId = threadId;
    this.content = content;
  }

  _verifyPayload({ id, owner, threadId, content }) {
    if (!id || !owner || !threadId || !content) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string' || typeof content !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default AddedComment;
