import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
}

type Env = 'development' | 'test' | 'staging' | 'production';

const baseConfig: DatabaseConfig = {
  username: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_USER_PASSWORD || '',
  database: process.env.MYSQL_DATABASE_NAME || '',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  dialect: 'mysql',
};

const config: Record<Env, DatabaseConfig> = {
  development: baseConfig,

  test: {
    ...baseConfig,
    database: process.env.MYSQL_DATABASE_NAME || 'test_db',
  },

  production: {
    ...baseConfig,
  },

  staging: {
    ...baseConfig,
  },
};

export = config;
