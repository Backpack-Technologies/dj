import express from 'express'
import Users from './users'

const router = express.Router()
const users = new Users()

router.route('/').get((req, res) => res.status(200).send('Hello World'))

router.route('/users')
  .get(users.get)
  .post(users.create)

router.route('/users/login')
  .post(users.login)

export default router
