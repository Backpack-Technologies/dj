import { Request, Response } from 'express'
import ac from '../accesscontrol'
import { Resource, RecordType } from '../types'
import { RecordModel } from '../models'

const recordModel = new RecordModel()

export default class Records {
  async create (req: Request, res: Response) {
    try {
      const userId = Number(req.body.userId)
      const workDescription = String(req.body.workDescription)
      const workDurationHours = Number(req.body.workDurationHours)
      const workDate = new Date(req.body.workDate)

      if (!userId || !workDescription || !workDurationHours || !workDate) {
        return res.status(400).json('UserId/Description/Duration/Date not provided!')
      }

      const { userId: currentUserId, role: currentUserRole }: {
        userId: number, role: string
      } = res.locals.user

      const permission = (userId === currentUserId)
        ? ac.can(currentUserRole).createOwn(Resource.RECORDS)
        : ac.can(currentUserRole).createAny(Resource.RECORDS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      const record: RecordType = {
        userId,
        workDescription,
        workDurationHours,
        workDate
      }

      const retRecord = await recordModel.create(record)
      return res.status(201).json(retRecord)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async list (req: Request, res: Response) {
    try {
      const { userId, role }: { userId: number, role: string } = res.locals.user

      let records: RecordType[] = []
      if (ac.can(role).readAny(Resource.RECORDS).granted) {
        records = await recordModel.findAll()
      } else {
        records = await recordModel.findAll(userId)
      }
      return res.status(200).json(records)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async listByDate (req: Request, res: Response) {
    try {
      const { userId, role }: { userId: number, role: string } = res.locals.user
      const from = new Date(req.params.from)
      const to = new Date(req.params.to)

      if (!from || !to) {
        return res.status(400).json()
      }

      let records: RecordType[] = []
      if (ac.can(role).readAny(Resource.RECORDS).granted) {
        records = await recordModel.findAllByDate(from, to)
      } else {
        records = await recordModel.findAllByDate(from, to, userId)
      }
      return res.status(200).json(records)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async get (req: Request, res: Response) {
    try {
      const { userId: currentUserId, role: currentUserRole }: {
        userId: number, role: string
      } = res.locals.user
      const resourceId = Number(req.params.id)

      const records = await recordModel.find(resourceId)
      if (!records || !records.length) {
        return res.status(404).json()
      }
      const record = records[0]

      const permission = (record.userId === currentUserId)
        ? ac.can(currentUserRole).readOwn(Resource.RECORDS)
        : ac.can(currentUserRole).readAny(Resource.RECORDS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      return res.status(200).json(record)
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async update (req: Request, res: Response) {
    try {
      const userId = Number(req.body.userId)
      const workDescription = String(req.body.workDescription)
      const workDurationHours = Number(req.body.workDurationHours)
      const workDate = new Date(req.body.workDate)

      if (!userId && !workDescription && !workDurationHours && !workDate) {
        return res.status(400).json('Nothing to update!')
      }

      const { userId: currentUserId, role: currentUserRole }: {
        userId: number, role: string
      } = res.locals.user
      const resourceId = Number(req.params.id)

      // fetch record's userId (might not be present in body)
      const recordUserId = await recordModel.findOwnerId(resourceId)
      if (recordUserId === null) {
        return res.status(404).json(`Record ID ${resourceId} not found`)
      }

      const permission = (recordUserId === currentUserId)
        ? ac.can(currentUserRole).updateOwn(Resource.RECORDS)
        : ac.can(currentUserRole).updateAny(Resource.RECORDS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      const record: RecordType = {
        id: resourceId,
        userId,
        workDescription,
        workDurationHours,
        workDate
      }
      const isSaved = await recordModel.save(record)

      if (isSaved) {
        return res.status(200).json(`Record ID ${resourceId} updated`)
      } else {
        return res.status(404).json(`Record ID ${resourceId} not found`)
      }
    } catch (err) {
      return res.status(500).json(err)
    }
  }

  async delete (req: Request, res: Response) {
    try {
      const { userId: currentUserId, role: currentUserRole }: {
        userId: number, role: string
      } = res.locals.user
      const resourceId = Number(req.params.id)

      // fetch record's userId (might not be present in body)
      const recordUserId = await recordModel.findOwnerId(resourceId)
      if (recordUserId === null) {
        return res.status(404).json(`Record ID ${resourceId} not found`)
      }

      const permission = (recordUserId === currentUserId)
        ? ac.can(currentUserRole).updateOwn(Resource.RECORDS)
        : ac.can(currentUserRole).updateAny(Resource.RECORDS)

      if (!permission.granted) {
        return res.sendStatus(403)
      }

      const isDeleted = await recordModel.delete(resourceId)
      if (isDeleted) {
        return res.status(200).json(`Record ID ${resourceId} deleted`)
      } else {
        return res.status(404).json(`Record ID ${resourceId} not found`)
      }
    } catch (err) {
      return res.status(500).json(err)
    }
  }
}
