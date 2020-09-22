import express from 'express'
import Users from './routes/users'
import Auth from './routes/auth'

const router = express.Router()
const auth = new Auth()
const users = new Users()

router.route('/')
  .get((req, res) => res.status(200).json())

router.route('/auth')
  .post(auth.generateToken)

router.route('/users')
  .post(auth.authenticateSilently, users.create)
  .get(auth.authenticate, users.list)

router.route('/users/:id')
  .all(auth.authenticate)
  .get(users.get)
  .patch(users.update)
  .delete(users.delete)

export default router
