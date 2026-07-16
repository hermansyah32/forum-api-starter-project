import DetailThread from '../../Domains/threads/entities/DetailThread.js';

class GetThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
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

    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
    }));

    return new DetailThread({
      ...thread,
      comments: mappedComments,
    });
  }
}

export default GetThreadUseCase;
