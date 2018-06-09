import {
  Activities,
  Interests,
  Records,
  Users
} from '../models'

import { grading } from '../helpers'
import { Types } from 'mongoose'

const ObjectId = Types.ObjectId

function escapeRegex (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

export const user = {
  async get (req, res) {
    if (req.query.keyword) {
      try {
        const regex = new RegExp(escapeRegex(req.query.keyword), 'gi')
        const normalFuzzySearch = { isAvailable: true, $or: [ { 'title': regex }, { 'location': regex }, { 'description': regex } ] }
        const foundActivities = await Activities.find(normalFuzzySearch)
        // console.log(foundActivities)
        res.status(201).json(foundActivities)
      } catch (e) {
        res.status(409).json(e)
      }
    } else if (req.query.page) {
      try {
        const events = await Activities.paginate({isAvailable: true}, { sort: { startAt: -1 }, limit: 10, page: req.query.page })
        // console.log(events)
        res.status(201).json(events)
      } catch (e) {
        res.status(409).json(e)
      }
    } else {
      try {
        const events = await Activities.paginate({isAvailable: true}, { sort: { startAt: -1 }, limit: 10 })
        // console.log(events)
        res.status(201).json(events)
      } catch (e) {
        res.status(409).json(e)
      }
    }
  },
  async add (req, res) {
    try {
      const { title, startAt, endAt, location, description, user, admin } = req.body

      const newActivity = new Activities({title, startAt, endAt, location, description, isAvailable: true, createdBy: {user, admin}})
      const added = await newActivity.save()
      res.status(201).json({success: true, message: 'created', id: added._id})
    } catch (e) {
      res.status(409).json({success: false, message: 'Oops! something went wrong'})
    }
  },
  async edit (req, res) {
    try {
      const id = req.params.id
      const { title, startAt, endAt, location, description } = req.body

      await Activities.findOneAndUpdate(
        { _id: ObjectId(id) },
        { title, startAt, endAt, location, description }
      )

      res.status(200).json({success: true, message: 'updated!'})
    } catch (e) {
      res.status(409).json({success: false, message: e})
    }
  },
  async delete (req, res) {
    try {
      const id = req.params.id

      await Activities.findOneAndUpdate(
        { _id: ObjectId(id) },
        { isAvailable: false }
      )

      res.status(200).json({success: true, message: 'deleted!'})
    } catch (e) {
      res.status(409).json({success: false, message: e})
    }
  },
  async checkActivity (req, res) {
    try {
      const id = req.params.id

      const search = await Records.find({
        activity_id: ObjectId(id)
      })

      if (search.length > 0) {
        res.status(200).json({
          deletable: false
        })
      } else {
        res.status(200).json({
          deletable: true
        })
      }
    } catch (e) {
      res.status(409).json({success: false, message: e})
    }
  },
  async search (req, res) {
    const id = req.params.id
    const activity = await Activities.findOne({_id: id, isAvailable: true})
    const { title, startAt, endAt, location, description, unity } = activity
    const payload = { _id: id, title, startAt, endAt, location, description, unity }
    res.status(200).json(payload)
  },
  async submit (req, res) {
    try {
      const activity_id = req.params.id
      const { course_id, reflections, student_id, scores, photo } = req.body

      const student = await Users.findOne({student_id})

      const newScore = await grading.save(scores, student.tracking_id)

      const newRecord = new Records({
        course_id,
        activity_id,
        student_id,
        batch_id: student.tracking_id,
        reflections,
        scores: newScore,
        picture: photo,
        status: {
          approved: null
        }
      })

      const added = await newRecord.save()
      res.status(201).json({success: true, message: 'created', id: added._id})
    } catch (e) {
      res.status(409).json(e)
    }
  },
  async report (req, res) {
    try {
      const activity_id = req.params.id
      const { course_id, reflections, student_id, scores, file, participants } = req.body

      const student = await Users.findOne({student_id})

      const newScore = await grading.save(scores, student.tracking_id)

      const newRecord = new Records({
        course_id,
        activity_id,
        student_id,
        batch_id: student.tracking_id,
        reflections,
        participants,
        scores: newScore,
        file,
        status: {
          approved: null
        }
      })

      const added = await newRecord.save()
      res.status(201).json({success: true, message: 'created', id: added._id})
    } catch (e) {
      res.status(409).json(e)
    }
  },
  async cancel (req, res) {
    try {
      const record_id = req.params.id

      const payload = {
        status: {
          approved: false,
          approvedWithCondition: false,
          approvedBy: 'user',
          comment: 'Canceled by user.'
        }
      }

      await Records.findOneAndUpdate({_id: record_id}, payload)
      res.status(200).json({success: true,
        message: {
          approved: false,
          approvedWithCondition: false,
          approvedBy: 'user',
          comment: 'Canceled by user.'
        }
      })
    } catch (e) {
      res.status(409).json(e)
    }
  },
  async interest (req, res) {
    try {
      const activity_id = req.params.id
      const student_id = req.body.student_id

      const isSaved = await Interests.findOne({student_id, activity_id})

      if (!isSaved) {
        // save
        const newInterest = new Interests({activity_id, student_id})
        await newInterest.save()

        res.status(201).json({success: false, message: 'saved'})
      } else {
        // console.log(isSaved._id)
        await Interests.remove({_id: isSaved._id})
        res.status(200).json({success: true, message: 'deleted'})
      }
    } catch (e) {
      res.status(409).json(e)
    }
  },
  async checkInterest (req, res) {
    try {
      const activity_id = req.params.id
      const student_id = req.body.student_id

      const isSaved = await Interests.findOne({student_id, activity_id})

      if (!isSaved) {
        res.status(200).json({success: false, message: 'saved'})
      } else {
        res.status(200).json({success: true, message: 'deleted'})
      }
    } catch (e) {
      res.status(409).json(e)
    }
  }
}
