import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import db from '../db'
import ac from '../accesscontrol'
import { Resource, UserRole } from '../types'

export default class Users {
  async create (req: Request, res: Response) {
    try {
      const { name, email, pass, role }: { name: string, email: string, pass: string, role: string } = req.body

      if (!name || !email || !pass) {
        return res.status(400).json('Name/Email/Password not provided!')
      }

      if (role && role !== UserRole.USER) {
        if (!res.locals.user) {
          return res.sendStatus(401)
        }
        const { role: currentUserRole }: { role: string } = res.locals.user

        if (role === UserRole.ADMIN && currentUserRole !== UserRole.ADMIN) {
          return res.sendStatus(403)
        }

        if (role === UserRole.MANAGER && currentUserRole === UserRole.USER) {
          return res.sendStatus(403)
        }
      }

      const hashedPass = await bcrypt.hash(pass, 10)
      const user = {
        name,
        email,
        pass: hashedPass,
        role: !role ? UserRole.USER : role
      }

      // TODO: replace with models
      const resp = await db('users').insert(user)
      return res.status(201).json({ id: resp.pop(), ...user })
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async list (req: Request, res: Response) {
    try {
      const { userId, role }: { userId: number, role: string } = res.locals.user

      let users = []
      if (ac.can(role).readAny(Resource.USERS).granted) {
        // TODO: replace with models
        users = await db('users')
      } else {
        // TODO: replace with models
        users = await db('users').where('id', userId)
      }

      return res.status(200).json(users)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async get (req: Request, res: Response) {
    try {
      const { userId, role }: { userId: number, role: string } = res.locals.user
      const resourceId = Number(req.params.id)

      const permission = (resourceId === userId)
        ? ac.can(role).readOwn(Resource.USERS)
        : ac.can(role).readAny(Resource.USERS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      // TODO: replace with models
      const user = await db('users').where('id', resourceId).first()
      if (!user) {
        return res.status(404).json()
      }

      return res.status(200).json(user)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async update (req: Request, res: Response) {
    try {
      const { name, email, pass, role, prefWorkingHours }: {
        name: string,
        email: string,
        pass: string,
        role: string,
        prefWorkingHours: number
      } = req.body

      if (!name && !email && !pass && !role && !prefWorkingHours) {
        return res.status(400).json('Nothing to update')
      }

      const { userId, role: currentUserRole }: { userId: number, role: string } = res.locals.user
      const resourceId = Number(req.params.id)

      const permission = (resourceId === userId)
        ? ac.can(currentUserRole).updateOwn(Resource.USERS)
        : ac.can(currentUserRole).updateAny(Resource.USERS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      // check special case for role update
      if (role && role !== UserRole.USER) {
        // if target role is 'admin' but current user is not an admin, then unauthorized
        if (role === UserRole.ADMIN && currentUserRole !== UserRole.ADMIN) {
          return res.sendStatus(403)
        }
        if (role === UserRole.MANAGER && currentUserRole === UserRole.USER) {
          return res.sendStatus(403)
        }
      }

      const hashedPass = pass ? await bcrypt.hash(pass, 10) : pass
      // TODO: replace with models
      await db('users').where('id', resourceId).update({
        name,
        email,
        pass: hashedPass,
        role,
        pref_working_hr: prefWorkingHours
      })

      return res.status(200).json(`User with ID ${resourceId} updated`)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async delete (req: Request, res: Response) {
    try {
      const { userId, role }: { userId: number, role: string } = res.locals.user
      const resourceId = Number(req.params.id)

      const permission = (resourceId === userId)
        ? ac.can(role).deleteOwn(Resource.USERS)
        : ac.can(role).deleteAny(Resource.USERS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      // TODO: replace with models
      const rowsDeleted = await db('users').where('id', resourceId).del()

      if (rowsDeleted) {
        return res.status(200).json(`User with ID ${resourceId} deleted`)
      } else {
        return res.status(404).json('User with ID not found')
      }
    } catch (err) {
      return res.status(500).json(err)
    }
  }
}
