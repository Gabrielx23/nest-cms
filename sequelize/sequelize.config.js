// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: '127.0.0.1',
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    define: {
      paranoid: true,
      timestamp: true,
      freezeTableName: true,
      underscored: false,
    },
  },
};
