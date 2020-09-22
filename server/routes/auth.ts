import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import db from '../db'

dotenv.config()

export default class Auth {
  async generateToken (req: Request, res: Response) {
    try {
      const { email, pass } = {
        email: req.body.email,
        pass: req.body.pass
      }

      if (!email || !pass) {
        return res.status(400).json('Email/Password not provided!')
      }

      // TODO: replace with models
      const user = await db('users').where('email', email).first()
      if (!user) {
        return res.status(400).json('Email not found')
      }

      // check if password matches
      if (!(await bcrypt.compare(pass, user.pass))) {
        return res.status(401).json('Wrong password!')
      }

      const token = jwt.sign({
        userId: user.id,
        role: user.role,
        name: user.name
      }, String(process.env.JWT_SECRET))

      return res.status(200).json({ token })
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  authenticate (req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]
      if (!token) return res.status(401).json('No token provided')

      const user = jwt.verify(token, String(process.env.JWT_SECRET))
      res.locals.user = user

      next()
    } catch (err) {
      return res.status(403).json('Token not valid')
    }
  }

  authenticateSilently (req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]
      if (!token) return next()

      const user = jwt.verify(token, String(process.env.JWT_SECRET))
      res.locals.user = user

      next()
    } catch (err) {
      return next()
    }
  }
}
