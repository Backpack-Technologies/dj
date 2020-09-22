import express from 'express'
import Users from './routes/users'
import Auth from './routes/auth'
import Records from './routes/records'

const router = express.Router()
const auth = new Auth()
const users = new Users()
const records = new Records()

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

router.route('/records')
  .all(auth.authenticate)
  .post(records.create)
  .get(records.list)

router.route('/records/:id')
  .all(auth.authenticate)
  .get(records.get)
  .patch(records.update)
  .delete(records.delete)

router.route('/records/:from/:to')
  .all(auth.authenticate)
  .get(records.listByDate)

export default router
