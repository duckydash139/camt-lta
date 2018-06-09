import axios from 'axios'
import qs from 'querystring'
import jwt from 'jsonwebtoken'
import _ from 'lodash'

import {
  Activities,
  Batches,
  Criteria,
  Interests,
  Notifications,
  Records,
  Users
} from '../models'

import { grading, generatePdf, paginate } from '../helpers'

import { Types } from 'mongoose'

const ObjectId = Types.ObjectId

const createToken = payload => {
  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '2h' })
  return token
}

export const oauth = {
  async connectToApi (req, res, next) {
    try {
      const getToken = await axios.post(
        'https://oauth.cmu.ac.th/v1/GetToken.aspx',
        qs.stringify({
          code: req.query.code,
          redirect_uri: process.env.CMU_REDIRECT_URI,
          client_id: process.env.CMU_CLIENT_ID,
          client_secret: process.env.CMU_CLIENT_SECRET,
          grant_type: 'authorization_code'
        })
      )
      const userInfo = await axios(
        `https://oauth.cmu.ac.th/v1/UserInfo.aspx?access_token=${
          getToken.data.access_token
        }`
      )
      const { data } = userInfo.data
      const users = await Users.find({ student_id: data.student_id })
      // setup payload to create token
      const payload = {
        student_id: data.student_id
      }
      // is it new User
      if (users.length === 0) {
        // console.log('regis')
        // regis user
        const {
          itaccount_name,
          citizen_id,
          student_id,
          first_name,
          last_name,
          organization
        } = data
        const newUser = new Users({
          username: itaccount_name,
          citizen_id,
          student_id,
          first_name: `${first_name.en_US[0]}${first_name.en_US.toLowerCase().substring(1)}`,
          last_name: `${last_name.en_US[0]}${last_name.en_US.toLowerCase().substring(1)}`,
          organization: organization.code
        })
        await newUser.save()
        // generate token
        res.status(201).json({
          success: true,
          message: 'signup',
          token: createToken(payload)
        })
      } else {
        // console.log('signin')
        // generate token
        res.status(200).json({
          success: true,
          message: 'signin',
          token: createToken(payload)
        })
      }
    } catch (e) {
      res.status(409).json({ status: 'error', message: e })
    }
  }
}

export const index = {
  async get (req, res) {
    try {
      let users = await Users.find({})
      if (users.length === 0) {
        res.status(404).json({ message: 'No users exist at this moment.' })
      }
      res.status(200).json(users)
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async findStudent (req, res) {
    try {
      let query = req.params.id
      const regex = new RegExp(`^${query}`)
      // let users = await Users.find({'student_id': `/${req.params.id}/`}).limit(5)
      let users = await Users.aggregate([
        {
          $project: {
            stringify: { $toLower: '$student_id' },
            student_id: 1,
            first_name: 1,
            last_name: 1
          }
        },
        { $match: { 'stringify': regex } },
        { $limit : 5 }
      ])
      if (users.length === 0) {
        res.status(404).json({ message: 'Not found' })
      } else {
        res.status(200).json(users)
      }
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async miniDetail (req, res) {
    try {
      let user = await Users.findOne({ _id: ObjectId(req.params.id) })
      if (user.length === 0) {
        res.status(404).json({ message: 'Not found' })
      }
      res.status(200).json({
        student_id: user.student_id,
        first_name: user.first_name,
        last_name: user.last_name
      })
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async search (req, res) {
    try {
      let users = await Users.find({ student_id: req.params.id })
      if (users.length === 0) {
        res.status(404).json({ message: 'Not found' })
      }
      let {
        username,
        citizen_id,
        student_id,
        first_name,
        last_name,
        organization,
        tracking,
        tracking_id,
        history
      } = users[0]
      let payload = {
        id: users[0]._id,
        username,
        citizenId: citizen_id,
        studentId: student_id,
        firstName: first_name,
        lastName: last_name,
        tracking,
        trackingId: tracking_id,
        history
      }
      res.status(200).json(payload)
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async setCourse (req, res) {
    try {
      const userId = req.params.id
      const courseId = req.body.course

      const batch = await Batches.findOne({
        is_open: true,
        course_id: courseId
      })

      await Users.findOneAndUpdate(
        { student_id: userId },
        { tracking: courseId, tracking_id: batch._id }
      )
      res.status(200).json({ success: true, message: 'updated' })
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async createdList (req, res) {
    try {
      const userId = parseInt(req.params.id)
      const limit = parseInt(req.query.limit) || 10
      const page = parseInt(req.query.page)|| 1

      const student = await Users.findOne({
        student_id: userId
      })

      const result = await Activities.paginate(
        { 'createdBy.user': ObjectId(student._id), isAvailable: true },
        { sort: { createdAt: -1 }, limit, page }
      )

      res.status(200).json(result)
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async interest (req, res) {
    try {
      const userId = parseInt(req.params.id)
      const limit = parseInt(req.query.limit) || 10
      const page = parseInt(req.query.page)|| 1

      const aggregate = Interests.aggregate([
        {
          $match: {'student_id': { $eq: userId }}
        },
        {
          $lookup: {
            from: 'activities',
            localField: 'activity_id',
            foreignField: '_id',
            as: 'activity_doc'
          }
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ '$activity_doc', 0 ] }, '$$ROOT' ] } }
        },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            student_id: '$student_id',
            activity_id: '$activity_id',
            activity_title: '$title'
          }
        }
      ])

      const data = await Interests.aggregatePaginate(aggregate, { page, limit })
      res.status(200).json({
        docs: data.data,
        total: data.totalCount,
        limit,
        'offset': 0,
        page,
        'pages': data.pageCount
      })
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async history (req, res) {
    try {
      const userId = req.params.id
      // find user's id
      const { _id } = await Users.findOne({
        student_id: userId
      })
      // find records that created by this user
      const normalRecords = await Records.find({
        student_id: userId,
        // file: null
      })
      // find records that this user is participant
      const isParticipant = await Records.find({
        participants: ObjectId(_id),
        student_id: !userId
      })
      const allRecords = _.sortBy([
        ...normalRecords,
        ...isParticipant
      ], 'createdAt').reverse()

      let totalPage = Math.ceil(allRecords.length / 10)
      if (req.query.page) {
        const result = {
          docs: paginate(allRecords, 10, req.query.page),
          page: parseInt(req.query.page),
          pages: totalPage > 0 ? totalPage : 1,
          total: totalPage > 0 ? totalPage : 1,
          limit: 10
        }
        res.status(200).json(result)
      } else {
        const result = {
          docs: paginate(allRecords, 10, 1),
          page: 1,
          pages: totalPage > 0 ? totalPage : 1,
          total: totalPage > 0 ? totalPage : 1,
          limit: 10
        }
        res.status(200).json(result)
      }
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async historyById (req, res) {
    try {
      const recordId = req.params.record
      const result = await Records.find({ _id: recordId })
      res.status(200).json(result)
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async fetchNotify (req, res) {
    try {
      const userId = req.params.id
      const limit = Number(req.query.limit) || 7
      const page = req.query.page || 1
      const result = await Notifications.paginate(
        { student_id: userId },
        { sort: { createdAt: -1 }, limit, page }
      )
      res.status(200).json(result)
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async markAllAs (req, res) {
    try {
      const userId = req.params.id
      const limit = Number(req.query.limit) || 7
      const page = req.query.page || 1
      const { docs } = await Notifications.paginate(
        { student_id: userId },
        { sort: { createdAt: -1 }, limit, page }
      )
      const { is_read } = req.body

      docs.map(notify => {
        Notifications.findOneAndUpdate({ _id: notify._id }, { is_read }).then()
      })

      const result = await Notifications.paginate(
        { student_id: userId },
        { sort: { createdAt: -1 }, limit, page }
      )
      res.status(200).json(result)
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async updateNotify (req, res) {
    try {
      const notifyId = req.params.notifyId
      const result = await Notifications.findOne({ _id: notifyId })
      const isRead = !result.is_read
      await result.set({ is_read: isRead })
      await result.save()
      res.status(200).json({ success: true, message: 'updated' })
    } catch (e) {
      res.json({ status: 'error', message: e })
    }
  },
  async checkScore (req, res, next) {
    try {
      const studentId = Number(req.params.id)
      const courseId = req.params.course

      // const student = await Users.findOne({'student_id': studentId})

      const data = await grading.student(studentId, courseId)
      res.status(200).json(data)
    } catch (e) {
      res.status(409).json({ status: 'error', message: e })
    }
  },
  async exportHistory (req, res, next) {
    try {
      const studentId = Number(req.params.id)
      const courseId = req.params.course

      let buffer = []

      const records = await Records.find({
        student_id: studentId,
        course_id: courseId
      })
      const student = await Users.findOne({ student_id: studentId })

      for (let item of records) {
        if (item.status.approved !== false) {
          const event = await Activities.findOne({ _id: item.activity_id })
          const { structure } = await Criteria.findOne({
            batch_id: item.batch_id
          })

          let scoresBuffer = []

          item.scores.map(score => {
            structure.map(criteria => {
              if (criteria.id === score.id) {
                scoresBuffer.push({
                  id: score.id,
                  title: criteria.title || 'error',
                  count: score.count,
                  point: score.point
                })
              }
            })
          })

          buffer.push({
            event: {
              id: item.activity_id,
              title: event.title,
              date: event.date,
              location: event.location,
              description: event.description
            },
            comment: item.description,
            picture: item.picture,
            status: item.status,
            scores: scoresBuffer
          })
        }
      }
      const profile = {
        student_id: studentId,
        course_id: courseId,
        first_name: student.first_name,
        last_name: student.last_name
      }
      generatePdf(profile, buffer, binary => {
        // res.contentType('application/pdf')
        // console.log('binary')
        // console.log(binary)
        // res.send(binary)
        const filename = `${studentId}_${courseId}.pdf`

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
        res.end(binary, 'binary')
      })
    } catch (e) {
      res.status(409).json({ status: 'error', message: e })
    }
  }
}
