import express from 'express';

const createThreadsRouter = (handler, authMiddleware) => {
  const router = express.Router();

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.post('/:threadId/comments', authMiddleware, handler.postCommentHandler);

  return router;
};

export default createThreadsRouter;
