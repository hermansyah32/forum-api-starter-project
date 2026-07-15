import AddComment from '../../Domains/comments/entities/AddComment.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    const isThreadExist = await this._threadRepository.verifyThreadExist(useCasePayload.thread_id);
    if (!isThreadExist) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return this._commentRepository.addComment(addComment);
  }
}

export default AddCommentUseCase;
