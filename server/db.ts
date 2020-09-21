import _knex from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const knex = _knex({
  client: 'mysql',
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST
  },
  debug: true
})

export default knex
