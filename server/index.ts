import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import _knex from 'knex'
import bcrypt from 'bcrypt'

dotenv.config()

// server configs
const port = process.env.PORT || 8080
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// db setup
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

// index route
app.get('/', (req, res) => res.status(200).send('Hello World'))

// api routes
app.post('/users', async (req, res) => {
  try {
    // TODO: input validations
    const hashedPass = await bcrypt.hash(req.body.pass, 10)
    const user = {
      name: req.body.name,
      email: req.body.email,
      pass: hashedPass
    }
    const resp = await knex('users').insert(user)
    res.status(201).send(`USER CREATED WITH ID: ${resp.pop()}`)
  } catch (err) {
    res.status(500).send(err)
  }
})

app.post('/users/login', async (req, res) => {
  try {
    // TODO: input validations
    const { email, pass } = {
      email: req.body.email,
      pass: req.body.pass
    }

    // fetch user from db
    const user = await knex('users').where('email', email).first()
    console.log('FROM DB: ', user)
    if (!user) {
      res.status(400).send('Email not found')
    }

    // check if pass matches
    if (await bcrypt.compare(pass, user.pass)) {
      res.status(200).send(`Welcome ${user.name}!`)
    } else {
      res.status(401).send('Not allowed')
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

// spin up server only if db is connected
knex.raw(`USE \`${process.env.DB_NAME}\` `)
  .then(() => {
    app.listen(port, () => console.info(`Express server running at http:/localhost:${port}`))
  })
  .catch(err => {
    console.error(`Couldn't connect to DB, shutting down server: ${err}`)
    process.exit()
  })
