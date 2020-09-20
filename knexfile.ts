import dotenv from 'dotenv'

dotenv.config()

export default {
  client: 'mysql',
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
