import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import GetThreadUseCase from '../../../../Applications/use_case/GetThreadUseCase.js';
import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';
import ToggleLikeUseCase from '../../../../Applications/use_case/ToggleLikeUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const payload = {
        ...req.body,
        owner: req.auth.id,
      };
      const addedThread = await addThreadUseCase.execute(payload);

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async postCommentHandler(req, res, next) {
    try {
      const { threadId } = req.params;
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const payload = {
        ...req.body,
        threadId: threadId,
        owner: req.auth.id,
      };
      const addedComment = await addCommentUseCase.execute(payload);

      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const owner = req.auth.id;
      const deletePayload = {
        owner,
        threadId: threadId,
        commentId: commentId
      };

      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute(deletePayload);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadHandler(req, res, next) {
    try {
      const { threadId } = req.params;
      const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
      const thread = await getThreadUseCase.execute(threadId);

      res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async postReplyHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const payload = {
        ...req.body,
        threadId,
        commentId,
        owner: req.auth.id,
      };
      const addedReply = await addReplyUseCase.execute(payload);

      res.status(201).json({
        status: 'success',
        data: {
          addedReply,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
    try {
      const { threadId, commentId, replyId } = req.params;
      const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
      const payload = {
        owner: req.auth.id,
        threadId,
        commentId,
        replyId,
      };
      await deleteReplyUseCase.execute(payload);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  async putLikeCommentHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const toggleLikeUseCase = this._container.getInstance(ToggleLikeUseCase.name);
      const payload = {
        threadId,
        commentId,
        userId: req.auth.id,
      };
      await toggleLikeUseCase.execute(payload);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;
