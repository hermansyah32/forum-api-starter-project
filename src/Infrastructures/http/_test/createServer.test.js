import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import { describe } from 'vitest';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get('/unregisteredRoute');

    // Assert
    expect(response.status).toEqual(404);
  });

  it('should response 200 or 301 when request to /api-docs', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get('/api-docs');

    // Assert
    expect([200, 301, 302]).toContain(response.status);
  });

  it('should response 200 when request to /api-docs/', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get('/api-docs/');

    // Assert
    expect(response.status).toEqual(200);
    expect(response.text).toContain('<html');
  });

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedUser).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: ['Dicoding Indonesia'],
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });

    it('should response 400 when username more than 50 character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });

    it('should response 400 when username contain restricted character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });

    it('should response 400 when username unavailable', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const requestPayload = {
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'super_secret',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/users').send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak tersedia');
    });
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const app = await createServer(container);

      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const app = await createServer(container);

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'wrong_password',
      };
      const app = await createServer(container);

      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      const requestPayload = {
        username: 'dicoding',
      };
      const app = await createServer(container);

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      const requestPayload = {
        username: 123,
        password: 'secret',
      };
      const app = await createServer(container);

      const response = await request(app).post('/authentications').send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username dan password harus string');
    });
  });

  describe('when PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      const app = await createServer(container);

      await request(app).post('/users').send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const loginResponse = await request(app).post('/authentications').send({
        username: 'dicoding',
        password: 'secret',
      });

      const { refreshToken } = loginResponse.body.data;
      const response = await request(app).put('/authentications').send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 payload not contain refresh token', async () => {
      const app = await createServer(container);

      const response = await request(app).put('/authentications').send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      const app = await createServer(container);

      const response = await request(app).put('/authentications').send({ refreshToken: 123 });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      const app = await createServer(container);

      const response = await request(app).put('/authentications').send({ refreshToken: 'invalid_refresh_token' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name).createRefreshToken({ username: 'dicoding' });

      const response = await request(app).put('/authentications').send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      const app = await createServer(container);
      const refreshToken = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      const response = await request(app).delete('/authentications').send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const refreshToken = 'refresh_token';

      const response = await request(app).delete('/authentications').send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      const app = await createServer(container);

      const response = await request(app).delete('/authentications').send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });
  });

  describe('when POST /threads', () => {
    it('should response 401 when request do not have access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'Discussion Title',
        body: 'Discussion Body',
      };
      const app = await createServer(container);
      // Action
      const response = await request(app).post('/threads').send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Discussion Title',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
      // Action
      const response = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'Discussion Title',
        body: 123,
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
      // Action
      const response = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send(requestPayload);
      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should throw error when payload title more than 150 characters', async () => {
      // Arrange
      const randomTextTitle = 'a'.repeat(151);
      const payload = {
        title: randomTextTitle,
        body: 'Forum body',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
      // Action
      const response = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send(payload);
      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena karakter judul tidak boleh melebihi 150 karakter');
    });

    it('should throw error when payload body more than 2500 characters', async () => {
      // Arrange
      const randomTextTitle = 'a'.repeat(2501);
      const payload = {
        title: 'a title',
        body: randomTextTitle,
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
      // Action
      const response = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send(payload);
      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena karakter konten tidak boleh melebihi 2500 karakter');
    });

    it('should response 201 when request payload has full property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Discussion Title',
        body: 'Discussion Body',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
      // Action
      const response = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send(requestPayload);
      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toHaveProperty('id');
      expect(response.body.data.addedThread).toHaveProperty('title');
      expect(response.body.data.addedThread).toHaveProperty('owner');
    });
  });

  describe('when POST /threads/:threadId/comments', () => {
    it('should response 401 when request do not have access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'Comment Content',
      };
      const app = await createServer(container);
      // Action
      const response = await request(app).post('/threads/thread-123/comments').send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestPayload = {
        content: 'Comment content'
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send(requestPayload);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when request payload not have content property', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestPayload = {};
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not not meet data type specification', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestPayload = {
        content: 123
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should throw error when payload content more than 2500 characters', async () => {
      // Arrange
      const threadId = 'thread-123';
      const randomTextContent = 'a'.repeat(2501);
      const payload = {
        content: randomTextContent,
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send(payload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat komentar baru karena karakter konten tidak boleh melebihi 2500 karakter');
    });

    it('should response 201 when request payload has full property', async () => {
      // Arrange
      const threadId = 'thread-123';
      const payload = {
        content: 'Comment content',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });
      // Action
      const response = await request(app).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send(payload);
      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toHaveProperty('id');
      expect(response.body.data.addedComment).toHaveProperty('content');
      expect(response.body.data.addedComment).toHaveProperty('owner');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 401 when request do not have access token', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const app = await createServer(container);
      // Action
      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 403 when owner is not authorized', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'doe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      /* eslint-disable-next-line camelcase */
      await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-123', thread_id: threadId, content: 'Comment content' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-456', username: 'doe' });

      // Action
      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('anda tidak memiliki hak akses untuk menghapus komentar ini');
    });

    it('should response 200 when comment is deleted successfully', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });
      /* eslint-disable-next-line camelcase */
      await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-123', thread_id: threadId, content: 'Comment content' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread details with comments correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId1 = 'comment-1';
      const commentId2 = 'comment-2';

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'johndoe' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'Thread Title', body: 'Thread Body', owner: 'user-123' });

      await CommentsTableTestHelper.addComment({
        id: commentId1,
        owner: 'user-123',
        threadId: threadId,
        content: 'Comment content 1',
        isDelete: false,
      });

      await CommentsTableTestHelper.addComment({
        id: commentId2,
        owner: 'user-456',
        threadId: threadId,
        content: 'Comment content 2',
        isDelete: true,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        owner: 'user-123',
        threadId: threadId,
        commentId: commentId1,
        content: 'reply content 1',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        owner: 'user-456',
        threadId: threadId,
        commentId: commentId1,
        content: 'reply content 2',
        isDelete: true,
      });

      await LikesTableTestHelper.addLike({
        id: 'like-123',
        threadId,
        commentId: commentId1,
        userId: 'user-123',
      });

      const app = await createServer(container);

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();

      const { thread } = response.body.data;
      expect(thread.id).toEqual(threadId);
      expect(thread.title).toEqual('Thread Title');
      expect(thread.body).toEqual('Thread Body');
      expect(thread.username).toEqual('johndoe');
      expect(thread.date).toBeDefined();

      expect(thread.comments).toHaveLength(2);
      expect(thread.comments[0].id).toEqual(commentId1);
      expect(thread.comments[0].username).toEqual('johndoe');
      expect(thread.comments[0].content).toEqual('Comment content 1');
      expect(thread.comments[0].date).toBeDefined();
      expect(thread.comments[0].likeCount).toEqual(1);
      expect(thread.comments[0].replies).toHaveLength(2);
      expect(thread.comments[0].replies[0].id).toEqual('reply-1');
      expect(thread.comments[0].replies[0].username).toEqual('johndoe');
      expect(thread.comments[0].replies[0].content).toEqual('reply content 1');
      expect(thread.comments[0].replies[0].date).toBeDefined();
      expect(thread.comments[0].replies[1].id).toEqual('reply-2');
      expect(thread.comments[0].replies[1].username).toEqual('dicoding');
      expect(thread.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
      expect(thread.comments[0].replies[1].date).toBeDefined();

      expect(thread.comments[1].id).toEqual(commentId2);
      expect(thread.comments[1].username).toEqual('dicoding');
      expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(thread.comments[1].date).toBeDefined();
      expect(thread.comments[1].likeCount).toEqual(0);
      expect(thread.comments[1].replies).toHaveLength(0);
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-xxx');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 401 when request do not have access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post('/threads/thread-123/comments/comment-123/replies').send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const threadId = 'thread-xxx';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 'Reply content'
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-xxx';
      const requestPayload = {
        content: 'Reply content'
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 400 when request payload does not have content property', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {};
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat balasan karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload has wrong data type', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 123
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat balasan karena tipe data tidak sesuai');
    });

    it('should response 201 and return addedReply correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestPayload = {
        content: 'Reply content'
      };
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.id).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual('Reply content');
      expect(response.body.data.addedReply.owner).toEqual('user-123');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 401 when request do not have access token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).delete('/threads/thread-123/comments/comment-123/replies/reply-123');

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when reply is not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-xxx')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('balasan tidak ditemukan');
    });

    it('should response 403 when user is not the owner of reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-456',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('anda tidak memiliki hak akses untuk menghapus balasan ini');
    });

    it('should response 200 when reply deleted successfully', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('when PUT /threads/:threadId/comments/:commentId/likes', () => {
    it('should response 401 when request is not authenticated', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes');

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 404 when thread does not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-xxx/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 404 when comment does not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-xxx/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 200 and add like successfully when comment has not been liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 200 and remove like successfully when comment has already been liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' });
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const app = await createServer({});

    // Action
    const response = await request(app).post('/users').send(requestPayload);

    // Assert
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });
});
