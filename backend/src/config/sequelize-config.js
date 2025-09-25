require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "postgres"
  },
  "test": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD || (process.env.DB_PASSWORD_FILE ? require('fs').readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim() : null),
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD || (process.env.DB_PASSWORD_FILE ? require('fs').readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim() : null),
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": false
    }
  }
};