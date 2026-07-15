import DeleteComment from '../../Domains/comments/entities/DeleteComment.js';

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(deleteCommentPayload) {
    const deleteComment = new DeleteComment(deleteCommentPayload);
    const isThreadExists = await this._threadRepository.verifyThreadExist(deleteComment.threadId);
    if (!isThreadExists) {
      throw new Error('VERIFY_THREAD_EXIST.NOT_FOUND');
    }
    const comment = await this._commentRepository.findCommentById(deleteComment.commentId);
    if (!comment) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    if (!deleteComment.owner || comment.owner != deleteComment.owner) {
      throw new Error('DELETE_COMMENT.FORBIDDEN');
    }

    return this._commentRepository.deleteCommentById(deleteComment.commentId);
  }
}

export default DeleteCommentUseCase;
