import AddThread from '../AddThread.js';

describe('an AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const missingOwnerPayload = {
      title: 'Forum title',
      body: 'Forum body',
    };

    const missingTitlePayload = {
      owner: 'user-123',
      body: 'Forum body',
    };

    const missingBodyPayload = {
      owner: 'user-123',
      title: 'Forum title',
    };

    // Action and Assert
    expect(() => new AddThread(missingOwnerPayload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new AddThread(missingTitlePayload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new AddThread(missingBodyPayload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const wrongBodyPayload = {
      title: 'Forum title',
      body: 123,
      owner: 'user-123',
    };

    const wrongTitlePayload = {
      title: true,
      body: 'Forum body',
      owner: 'user-123',
    };

    const wrongOwnerPayload = {
      title: 'Forum title',
      body: 'Forum body',
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddThread(wrongBodyPayload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new AddThread(wrongTitlePayload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new AddThread(wrongOwnerPayload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload title more than 150 characters', () => {
    // Arrange
    const randomTextTile = 'a'.repeat(151);
    const payload = {
      title: randomTextTile,
      body: 'Forum body',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_LIMIT_CHAR_150');
  });

  it('should throw error when payload body more than 2500 characters', () => {
    // Arrange
    const randomTextBody = 'a'.repeat(2501);
    const payload = {
      title: 'Forum title',
      body: randomTextBody,
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.BODY_LIMIT_CHAR_2500');
  });

  it('should create addThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Forum title',
      body: 'Forum body',
      owner: 'user-123',
    };

    // Action
    const addThread = new AddThread(payload);

    // Assert
    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.owner).toEqual(payload.owner);
  });
});
