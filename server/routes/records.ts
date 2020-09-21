import express from 'express'

const router = express.Router()

router.route('/')
  .get(async (req, res) => { res.status(200).send('GET all recoreds') })
  .post(async (req, res) => { res. status(201).send('Record created') })

export default router
