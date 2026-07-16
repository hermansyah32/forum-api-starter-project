import DetailThread from '../../Domains/threads/entities/DetailThread.js';

class GetThreadUseCase {
  constructor({ commentRepository, threadRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    if (!useCasePayload) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof useCasePayload !== 'string' && typeof useCasePayload !== 'object') {
      throw new Error('GET_THREAD_USE_CASE.THREAD_ID_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const threadId = typeof useCasePayload === 'string' ? useCasePayload : useCasePayload.threadId;

    if (!threadId) {
      throw new Error('GET_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_THREAD_USE_CASE.THREAD_ID_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const isThreadExist = await this._threadRepository.verifyThreadExist(threadId);
    if (!isThreadExist) {
      throw new Error('VERIFY_THREAD_EXIST.NOT_FOUND');
    }

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const mappedComments = comments.map((comment) => {
      const commentReplies = replies
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        }));

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
        replies: commentReplies,
      };
    });

    return new DetailThread({
      ...thread,
      comments: mappedComments,
    });
  }
}

export default GetThreadUseCase;
