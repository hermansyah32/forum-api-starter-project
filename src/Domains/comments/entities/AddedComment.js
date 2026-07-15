class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, owner, thread_id, content } = payload;

    this.id = id;
    this.owner = owner;
    this.thread_id = thread_id;
    this.content = content;
  }

  _verifyPayload({ id, owner, thread_id, content }) {
    if (!id || !owner || !thread_id || !content) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof owner !== 'string' || typeof thread_id !== 'string' || typeof content !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default AddedComment;
