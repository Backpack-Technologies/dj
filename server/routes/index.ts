import express from 'express'
import Users from './users'
import Auth from './auth'

const router = express.Router()
const auth = new Auth()
const users = new Users()

router.route('/').get((req, res) => res.status(200).send('Hello World'))

router.route('/auth')
  .post(auth.getToken)

router.route('/users')
  .get(auth.verifyToken, users.get)
  .post(users.create)

export default router
