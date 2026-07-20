/* istanbul ignore file */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.test.env'),
    override: true,
  });
} else {
  dotenv.config();
}

const getSslConfig = () => {
  if (process.env.PGSSL === 'true') {
    if (process.env.PGSSLCA) {
      return {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.resolve(process.cwd(), process.env.PGSSLCA)).toString(),
      };
    }
    return { rejectUnauthorized: false };
  }
  return undefined;
};

const config = {
  app: {
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    port: process.env.PORT,
    debug: process.env.NODE_ENV === 'development' ? { request: ['error'] } : {},
  },
  database: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: getSslConfig(),
  },
  auth: {
    jwtStrategy: 'forumapi',
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
};

export default config;