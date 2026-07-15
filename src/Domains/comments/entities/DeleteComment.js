class AddComment {
    constructor(payload) {
        this._verifyPayload(payload);

        const { owner, thread_id, comment_id } = payload;

        this.owner = owner;
        this.thread_id = thread_id;
        this.comment_id = comment_id;
    }

    _verifyPayload({ owner, thread_id, comment_id }) {
        if (!owner || !thread_id || !comment_id) {
            throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof owner !== 'string' || typeof thread_id !== 'string' || typeof comment_id !== 'string') {
            throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

export default AddComment;