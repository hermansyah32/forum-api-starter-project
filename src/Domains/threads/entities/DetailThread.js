class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, username, date, comments } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.username = username;
    this.date = date;
    this.comments = comments;
  }

  _verifyPayload(payload) {
    const { id, title, body, username, date, comments } = payload;

    if (!id || !title || !body || !username || !date || !comments) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof username !== 'string' ||
      (typeof date !== 'string' && !(date instanceof Date)) ||
      !Array.isArray(comments)
    ) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    for (const comment of comments) {
      if (!comment.id || !comment.username || !comment.content || !comment.date || !comment.replies) {
        throw new Error('DETAIL_THREAD.COMMENT_NOT_CONTAIN_NEEDED_PROPERTY');
      }

      if (
        typeof comment.id !== 'string' ||
        typeof comment.username !== 'string' ||
        typeof comment.content !== 'string' ||
        (typeof comment.date !== 'string' && !(comment.date instanceof Date)) ||
        !Array.isArray(comment.replies)
      ) {
        throw new Error('DETAIL_THREAD.COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
      }

      for (const reply of comment.replies) {
        if (!reply.id || !reply.username || !reply.content || !reply.date) {
          throw new Error('DETAIL_THREAD.REPLY_NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (
          typeof reply.id !== 'string' ||
          typeof reply.username !== 'string' ||
          typeof reply.content !== 'string' ||
          (typeof reply.date !== 'string' && !(reply.date instanceof Date))
        ) {
          throw new Error('DETAIL_THREAD.REPLY_NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
    }
  }
}

export default DetailThread;
