/* istanbul ignore file */
import winston from 'winston';

const winstonLogger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true,
    }),
  ],
});

export default winstonLogger;
