import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import db from '../db'

export default class Users {
  all (req: Request, res: Response, next: NextFunction) { next() }

  get (req: Request, res: Response) {
    res.status(200).send('GET all users')
  }
  
  async create (req: Request, res: Response) {
    try {
      // TODO: input validations
      const hashedPass = await bcrypt.hash(req.body.pass, 10)
      const user = {
        name: req.body.name,
        email: req.body.email,
        pass: hashedPass
      }
      // TODO: replace with models
      const resp = await db('users').insert(user)
      return res.status(201).send(`USER CREATED WITH ID: ${resp.pop()}`)
    } catch (err) {
      return res.status(500).send(err)
    }
  }
  
  async login (req: Request, res: Response) {
    try {
      // TODO: input validations
      const { email, pass } = {
        email: req.body.email,
        pass: req.body.pass
      }
  
      // fetch user from db
      // TODO: replace with models
      const user = await db('users').where('email', email).first()
      if (!user) {
        return res.status(400).send('Email not found')
      }
  
      // check if pass matches
      if (await bcrypt.compare(pass, user.pass)) {
        return res.status(200).send(`Welcome ${user.name}!`)
      } else {
        return res.status(401).send('Wrong password!')
      }
    } catch (err) {
      return res.status(500).send(err)
    }
  }
}
