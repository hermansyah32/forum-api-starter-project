import express from 'express';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import GeneralErrorTranslator from '../../Commons/exceptions/GeneralErrorTranslator.js';
import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import logger from '../../Commons/utils/logger.js';

const createServer = async (container) => {
  const app = express();

  // Middleware for parsing JSON
  app.use(express.json());

  // Serve OpenAPI Documentation
  const swaggerDocument = yaml.load(path.resolve(process.cwd(), './docs/openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Register routes
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', threads(container));

  // Global error handler
  /* eslint-disable-next-line no-unused-vars */
  app.use((error, req, res, next) => {
    // bila response tersebut error, tangani sesuai kebutuhan
    let translatedError = DomainErrorTranslator.translate(error);
    translatedError = GeneralErrorTranslator.translate(translatedError);

    // penanganan client error secara internal.
    if (translatedError instanceof ClientError) {
      logger.warn(`Client Error (${translatedError.statusCode}) on ${req.method} ${req.url}: ${translatedError.message}`);
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // penanganan server error sesuai kebutuhan
    logger.error(`Internal Server Error on ${req.method} ${req.url}: ${error.message}\nStack: ${error.stack}`);
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });

  return app;
};

export default createServer;
