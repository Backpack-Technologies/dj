import { User } from "./types";
import db from './db'

export class UserModel {
  private formatToDB(user: User) {
    const { id, name, email, pass, role,
      prefWorkingHours: pref_working_hr,
      createdAt: created_at
    } = user
    return {
      id, name, email, pass, role,
      pref_working_hr, created_at
    }
  }

  private formatFromDB(user: any): User {
    const { id, name, email, role,
      pref_working_hr: prefWorkingHours,
      created_at: createdAt
    } = user
    return {
      id, name, email, role,
      prefWorkingHours, createdAt
    }
  }

  async create(user: User): Promise<User> {
    const dbUser = this.formatToDB(user)
    const resp = await db('users').insert(dbUser)
    const id = resp.pop()
    if (!id) {
      throw new Error('Couldn\'t insert into DB')
    }
    return { id, ...user }
  }
  
  async find (id: number) {
    const dbUser = await db('users').where('id', id).first()
    return dbUser ? [this.formatFromDB(dbUser)] : []
  }

  async findAll () {
    const dbUsers = await db('users')
    return dbUsers.map(u => this.formatFromDB(u))
  }

  async save (user: User) {
    const dbUser = this.formatToDB(user)
    console.log(dbUser)
    return !!await db('users').where('id', dbUser.id).update(dbUser)
  }

  async delete (id: number) {
    return !!await db('users').where('id', id).del()
  }
}
