import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const payload = {
        ...req.body,
        owner: req.auth.id || null,
      };
      const addedThread = await addThreadUseCase.execute(payload);

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;
