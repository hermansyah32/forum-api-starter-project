import AddComment from '../../Domains/comments/entities/AddComment.js';

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment(useCasePayload);
    return this._commentRepository.addComment(addComment);
  }
}

export default AddCommentUseCase;
