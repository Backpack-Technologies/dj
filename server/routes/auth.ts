import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import db from '../db'

dotenv.config()

export default class Auth {
  all (req: Request, res: Response, next: NextFunction) { next() }
  
  async getToken (req: Request, res: Response) {
    try {
      // TODO: input validations
      const { email, pass } = {
        email: req.body.email,
        pass: req.body.pass
      }
  
      // TODO: replace with models
      const user = await db('users').where('email', email).first()
      if (!user) {
        return res.status(400).send('Email not found')
      }
  
      // check if password matches
      if (!(await bcrypt.compare(pass, user.pass))) {
        return res.status(401).send('Wrong password!')
      }

      const token = jwt.sign({
        userId: user.id,
        role: user.role,
        name: user.name
      }, String(process.env.JWT_SECRET))
      
      return res.status(200).send(`Welcome ${user.name}! Your access token is: ${token}`)
    } catch (err) {
      return res.status(500).send(err)
    }
  }

  async verifyToken (req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader && authHeader.split(' ')[1]
      
      if (!token) return res.status(401).send('No token provided')
  
      const user = jwt.verify(token, String(process.env.JWT_SECRET))
      res.locals.user = user
      
      next()
    } catch (err) {
      return res.status(403).send('Token not valid')
    }
  }
}
