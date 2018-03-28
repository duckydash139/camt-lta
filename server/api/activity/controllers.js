import {
  Activities,
  Interests,
  Records,
  Users
} from '../models'

function escapeRegex (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

export const user = {
  async get (req, res) {
    if (req.query.keyword) {
      console.log(req.query.keyword)
      try {
        const regex = new RegExp(escapeRegex(req.query.keyword), 'gi')
        const normalFuzzySearch = { $or: [ { 'title': regex }, { 'location': regex }, { 'description': regex } ] }
        const foundActivities = await Activities.find(normalFuzzySearch)
        // console.log(foundActivities)
        res.status(201).json(foundActivities)
      } catch (e) {
        res.status(409).json(e)
      }
    } else if (req.query.page) {
      try {
        const events = await Activities.paginate({}, { sort: { date: -1 }, limit: 10, page: req.query.page })
        // console.log(events)
        res.status(201).json(events)
      } catch (e) {
        res.status(409).json(e)
      }
    } else {
      try {
        const events = await Activities.paginate({}, { sort: { date: -1 }, limit: 10 })
        // console.log(events)
        res.status(201).json(events)
      } catch (e) {
        res.status(409).json(e)
      }
    }
  },
  async add (req, res) {
    try {
      const {title, date, location, description, user, admin} = req.body
      console.log(req.body)

      const newActivity = new Activities({title, date, location, description, createdBy: {user, admin}})
      const added = await newActivity.save()
      res.status(201).json({success: true, message: 'created', id: added._id})
    } catch (e) {
      res.status(409).json({success: false, message: 'Oops! something went wrong'})
    }
  },
  async search (req, res) {
    const id = req.params.id
    const activity = await Activities.findOne({_id: id})
    const { title, date, location, description, unity } = activity
    const payload = { _id: id, title, date, location, description, unity }
    res.status(200).json(payload)
  },
  async submit (req, res) {
    try {
      const activity_id = req.params.id
      const { course_id, description, student_id, scores, photo } = req.body

      const student = await Users.findOne({student_id})

      const newRecord = new Records({
        course_id,
        activity_id,
        student_id,
        batch_id: student.tracking_id,
        description,
        scores,
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