import DeleteReply from '../../Domains/replies/entities/DeleteReply.js';

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const deleteReply = new DeleteReply(useCasePayload);

    const isThreadExist = await this._threadRepository.verifyThreadExist(deleteReply.threadId);
    if (!isThreadExist) {
      throw new Error('VERIFY_THREAD_EXIST.NOT_FOUND');
    }

    const comment = await this._commentRepository.findCommentById(deleteReply.commentId);
    if (!comment) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    if (comment.threadId !== deleteReply.threadId) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    const reply = await this._replyRepository.findReplyById(deleteReply.replyId);
    if (!reply) {
      throw new Error('VERIFY_REPLY_EXISTS.NOT_FOUND');
    }

    if (reply.commentId !== deleteReply.commentId || reply.threadId !== deleteReply.threadId) {
      throw new Error('VERIFY_REPLY_EXISTS.NOT_FOUND');
    }

    if (reply.owner !== deleteReply.owner) {
      throw new Error('DELETE_REPLY.FORBIDDEN');
    }

    await this._replyRepository.deleteReplyById(deleteReply.replyId);
  }
}

export default DeleteReplyUseCase;
