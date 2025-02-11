require('dotenv').config()

module.exports = {
  "development": {
    "username": process.env.DB_DEV_USERNAME,
    "password": process.env.DB_DEV_PWD,
    "database": process.env.DB_DEV_NAME,
    "host": process.env.DB_DEV_HOST,
    "dialect": process.env.DB_DEV_DIALECT
  },
  "test": {
    "username": process.env.DB_TEST_PWD,
    "password": process.env.DB_TEST_PWD,
    "database": process.env.DB_TEST_NAME,
    "host": process.env.DB_TEST_HOST,
    "dialect": process.env.DB_TEST_DIALECT
  },
  "production": {
    "username": process.env.DB_PROD_USERNAME,
    "password": process.env.DB_PROD_PASSWORD,
    "database": process.env.DB_PROD_NAME,
    "host": process.env.DB_PROD_HOST,
    "dialect": process.env.DB_PROD_DIALECT
  }
}
