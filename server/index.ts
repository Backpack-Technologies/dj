import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import db from './db'
import router from './routes/index'

dotenv.config()

// server configs
const port = process.env.PORT || 8080
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up api routes
app.use('/', router)

// spin up server only if db is connected
db.raw(`USE \`${process.env.DB_NAME}\` `)
  .then(() => {
    app.listen(port, () => console.info(`Express server running on http:/localhost:${port}`))
  })
  .catch(err => {
    console.error(`Couldn't connect to DB, shutting down server: ${err}`)
    process.exit()
  })
