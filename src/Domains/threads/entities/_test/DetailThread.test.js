import DetailThread from '../DetailThread.js';

describe('DetailThread entity', () => {
  it('should create DetailThread object correctly when payload is valid', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'some title',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          content: 'some content',
          date: '2021-08-08T07:26:21.497Z',
          likeCount: 0,
          replies: [
            {
              id: 'reply-123',
              username: 'dicoding',
              content: 'some reply',
              date: '2021-08-08T07:28:21.497Z',
            },
          ],
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.comments).toStrictEqual(payload.comments);
  });

  it('should throw error when payload does not contain needed properties', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'some title',
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
      .toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: 'some body',
      username: 'dicoding',
      date: 2021,
      comments: 'invalid comments type',
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
      .toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when a comment does not contain needed properties', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'some title',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-123',
        },
      ],
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
      .toThrowError('DETAIL_THREAD.COMMENT_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when a comment does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'some title',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-123',
          username: 123,
          content: 'some content',
          date: true,
          likeCount: 'invalid likeCount type',
          replies: 'invalid replies type',
        },
      ],
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
      .toThrowError('DETAIL_THREAD.COMMENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when a reply does not contain needed properties', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'some title',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          content: 'some content',
          date: '2021-08-08T07:26:21.497Z',
          likeCount: 0,
          replies: [
            {
              id: 'reply-123',
            },
          ],
        },
      ],
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
      .toThrowError('DETAIL_THREAD.REPLY_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when a reply does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'some title',
      body: 'some body',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          content: 'some content',
          date: '2021-08-08T07:26:21.497Z',
          likeCount: 0,
          replies: [
            {
              id: 'reply-123',
              username: 123,
              content: 'some reply content',
              date: true,
            },
          ],
        },
      ],
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
      .toThrowError('DETAIL_THREAD.REPLY_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
