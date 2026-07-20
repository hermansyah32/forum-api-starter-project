import ToggleLike from '../../Domains/likes/entities/ToggleLike.js';

class ToggleLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const toggleLike = new ToggleLike(useCasePayload);

    const isThreadExist = await this._threadRepository.verifyThreadExist(toggleLike.threadId);
    if (!isThreadExist) {
      throw new Error('VERIFY_THREAD_EXIST.NOT_FOUND');
    }

    const comment = await this._commentRepository.findCommentById(toggleLike.commentId);
    if (!comment || comment.threadId !== toggleLike.threadId) {
      throw new Error('VERIFY_COMMENT_EXISTS.NOT_FOUND');
    }

    const hasLiked = await this._likeRepository.checkLikeAvailability(
      toggleLike.threadId,
      toggleLike.commentId,
      toggleLike.userId
    );

    if (hasLiked) {
      await this._likeRepository.deleteLike(
        toggleLike.threadId,
        toggleLike.commentId,
        toggleLike.userId
      );
    } else {
      await this._likeRepository.addLike(
        toggleLike.threadId,
        toggleLike.commentId,
        toggleLike.userId
      );
    }
  }
}

export default ToggleLikeUseCase;
