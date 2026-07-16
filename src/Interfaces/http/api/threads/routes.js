import express from 'express';

const createThreadsRouter = (handler, authMiddleware) => {
  const router = express.Router();

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.post('/:threadId/comments', authMiddleware, handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authMiddleware, handler.deleteCommentHandler);
  router.get('/:threadId', handler.getThreadHandler);

  return router;
};

export default createThreadsRouter;
