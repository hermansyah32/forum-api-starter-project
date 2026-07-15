import DeleteComment from '../../Domains/comments/entities/DeleteComment.js';

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(deleteCommentPayload) {
    const deleteComment = new DeleteComment(deleteCommentPayload);
    const isThreadExists = this._threadRepository.verifyThreadExist(deleteComment.thread_id);
    if (!isThreadExists) {
      throw new Error('VERIFY_THREAD_EXIST.NOT_FOUND');
    }
    const comment = await this._commentRepository.findCommentById(deleteComment.comment_id);
    if (!comment) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    if (!deleteComment.owner || comment.owner != deleteComment.owner) {
      throw new Error('DELETE_COMMENT.FORBIDDEN');
    }

    return this._commentRepository.deleteCommentById(deleteComment.comment_id);
  }
}

export default DeleteCommentUseCase;
