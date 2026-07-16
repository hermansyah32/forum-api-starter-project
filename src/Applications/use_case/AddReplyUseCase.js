import AddReply from '../../Domains/replies/entities/AddReply.js';

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);

    const isThreadExist = await this._threadRepository.verifyThreadExist(addReply.threadId);
    if (!isThreadExist) {
      throw new Error('VERIFY_THREAD_EXIST.NOT_FOUND');
    }

    const comment = await this._commentRepository.findCommentById(addReply.commentId);
    if (!comment) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    if (comment.threadId !== addReply.threadId) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    return this._replyRepository.addReply(addReply);
  }
}

export default AddReplyUseCase;
