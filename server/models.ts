import { User, RecordType } from './types'
import db from './db'

export class UserModel {
  private formatToDB (user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      pass: user.pass,
      role: user.role,
      pref_working_hr: user.prefWorkingHours,
      created_at: user.createdAt
    }
  }

  private formatFromDB (user: any): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      prefWorkingHours: user.pref_working_hr,
      createdAt: user.created_at
    }
  }

  async create (user: User): Promise<User> {
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

export class RecordModel {
  private formatToDB (record: RecordType) {
    return {
      id: record.id,
      user_id: record.userId,
      work_description: record.workDescription,
      work_duration_hr: record.workDurationHours,
      work_date: record.workDate,
      created_at: record.createdAt
    }
  }

  private formatFromDB (record: any): RecordType {
    return {
      id: record.id,
      userId: record.user_id,
      workDescription: record.work_description,
      workDurationHours: record.work_duration_hr,
      workDate: record.work_date,
      createdAt: record.created_at
    }
  }

  async create (record: RecordType): Promise<RecordType> {
    const dbRecord = this.formatToDB(record)
    const resp = await db('records').insert(dbRecord)
    const id = resp.pop()
    if (!id) {
      throw new Error('Couldn\'t insert into DB')
    }
    return { id, ...record }
  }

  async find (id: number) {
    const dbRecord = await db('records').where('id', id).first()
    return dbRecord ? [this.formatFromDB(dbRecord)] : []
  }

  async findAll (userId: number | null = null) {
    let dbRecords = []
    if (userId === null) {
      dbRecords = await db('records')
    } else {
      dbRecords = await db('records').where('user_id', userId)
    }
    return dbRecords.map(r => this.formatFromDB(r))
  }

  async findAllByDate (from: Date, to: Date, userId: number | null = null) {
    let dbRecords = []
    if (userId === null) {
      dbRecords = await db('records')
        .where('work_date', '>', from)
        .andWhere('work_date', '<=', to)
    } else {
      dbRecords = await db('records')
        .where('work_date', '>', from)
        .andWhere('work_date', '<=', to)
        .andWhere('user_id', userId)
    }
    return dbRecords.map(r => this.formatFromDB(r))
  }

  async findOwnerId (id: number) {
    const dbRecord = await db('records').where('id', id).first()
    return dbRecord ? Number(dbRecord.user_id) : null
  }

  async save (record: RecordType) {
    const dbRecord = this.formatToDB(record)
    console.log(dbRecord)
    return !!await db('records').where('id', dbRecord.id).update(dbRecord)
  }

  async delete (id: number) {
    return !!await db('records').where('id', id).del()
  }
}
