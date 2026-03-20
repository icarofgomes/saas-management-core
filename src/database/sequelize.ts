import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE_NAME as string,
  process.env.MYSQL_USERNAME as string,
  process.env.MYSQL_USER_PASSWORD as string,
  {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    dialect: process.env.DB_DIALECT as Dialect,
    pool: {
      max: Number(process.env.MYSQL_CONNECTION_LIMIT) || 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
    },
    logging: false,
  },
);
