import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import _ from 'lodash'
import excel from 'node-excel-export'

import { Types } from 'mongoose'

import {
  Accounts,
  Activities,
  Batches,
  Criteria,
  Notifications,
  Records,
  Users
} from '../models'

import { grading, sheets } from '../helpers'

const ObjectId = Types.ObjectId

const createToken = payload => {
  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' })
  return token
}
/**
 * Admin section
 **/
export const admin = {
  async signup(req, res, next) {
    try {
      const { username, password } = req.body

      const newAccount = new Accounts({
        username,
        password,
        is_active: true,
        is_root: false
      })

      await newAccount.save()
      res.status(201).json({ success: true, message: 'created' })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async signin(req, res, next) {
    try {
      const { username, password } = req.body
      if (!username || !password) {
        res
          .status(401)
          .json({ success: false, message: 'invalid username or password' })
      }
      const account = await Accounts.findOne({ username })
      const hash = account.password
      const matched = await bcrypt.compare(password, hash)
      // setup payload to create Token
      const payload = {
        id: account._id,
        username: account.username,
        isAdmin: account.is_root
      }
      // isMatched
      if (matched) {
        if (account.is_active) {
          res.status(200).json({
            success: true,
            message: 'signed in',
            token: createToken(payload)
          })
        } else {
          res
            .status(401)
            .json({ success: false, message: 'this username is deactivated' })
        }
      } else {
        res
          .status(401)
          .json({ success: false, message: 'invalid username or password' })
      }
    } catch (e) {
      res
        .status(401)
        .json({ success: false, message: 'invalid username or password' })
    }
  },
  async list(req, res, next) {
    try {
      let buffer = []
      const result = await Accounts.find()

      result.map(user => {
        buffer.push({
          username: user.username,
          is_active: user.is_active,
          is_admin: user.is_root
        })
      })

      res.status(200).json({ success: true, data: buffer })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async permission(req, res, next) {
    try {
      const { username } = req.body

      const user = await Accounts.findOne({ username })

      const result = await Accounts.findOneAndUpdate(
        {
          username
        },
        {
          is_root: !user.is_root
        }
      )

      res.status(200).json({
        username: result.username,
        is_active: result.is_active,
        is_admin: result.is_root
      })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async status(req, res, next) {
    try {
      const { username } = req.body

      const user = await Accounts.findOne({ username })

      const result = await Accounts.findOneAndUpdate(
        {
          username
        },
        {
          is_active: !user.is_active
        }
      )

      res.status(200).json({
        username: result.username,
        is_active: result.is_active,
        is_admin: result.is_root
      })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  }
}
/**
 * Student section
 **/
export const student = {
  async all(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 20
      const page = Number(req.query.page) || 1

      const data = await Users.find({}).sort({ student_id: -1 })
      res.status(200).json(data)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async byId(req, res, next) {
    try {
      const data = await Users.findOne({ student_id: req.params.id })
      res.status(200).json(data)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async clearTracking(req, res, next) {
    try {
      await Users.findOneAndUpdate(
        {
          student_id: req.params.id
        },
        { tracking: 0 }
      )
      res.status(200).json({ success: true, message: 'updated!' })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async history(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 10
      const page = Number(req.query.page) || 1
      const studentId = Number(req.params.id)

      const aggregate = Records.aggregate([
        {
          $match: {
            student_id: studentId,
            'status.approved': true
          }
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
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$activity_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $project: {
            activity_doc: 0
          }
        },
        {
          $project: {
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            course_id: '$course_id',
            activity_id: '$activity_id',
            activity_title: '$title',
            approved: '$status.approved',
            approvedWithCondition: '$status.approvedWithCondition'
          }
        }
      ])

      const data = await Records.aggregatePaginate(aggregate, { page, limit })
      res.status(200).json({
        docs: data.data,
        total: data.totalCount,
        limit,
        page,
        pages: data.pageCount
      })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async historyById(req, res, next) {
    try {
      const data = await Records.findOne({ _id: req.params.eventId })
      res.status(200).json(data)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async checkScore(req, res, next) {
    try {
      let result = []
      let isCheckedOut = false
      let payload = {
        scores: [],
        criteria: ''
      }
      const studentId = Number(req.params.id)
      const courseId = req.params.course

      const student = await Users.findOne({ student_id: studentId })

      for (let item of student.history) {
        if (item.course_id === courseId) {
          result = item.scores
          payload.criteria = item.batch_id
          isCheckedOut = true
        }
      }

      if (!isCheckedOut) {
        result = await grading.student(studentId, courseId)
        payload.criteria = student.tracking_id
      }

      payload.scores = result

      res.status(200).json(payload)
    } catch (e) {
      res.status(409).json({ status: 'error', message: e })
    }
  }
}
/**
 * Record section
 **/
export const activity = {
  async all(req, res) {
    try {
      const result = await Activities.find({ isAvailable: true }).sort({ startAt: -1 })
      res.status(200).json(result)
    } catch (e) {
      res
        .status(409)
        .json({ success: false, message: 'Oops! something went wrong' })
    }
  },
  async add(req, res) {
    try {
      const {
        title,
        startAt,
        endAt,
        location,
        description,
        unity,
        admin
      } = req.body

      const newActivity = new Activities({
        title,
        startAt,
        endAt,
        location,
        description,
        unity,
        createdBy: {
          admin
        }
      })
      const added = await newActivity.save()
      res.status(201).json({ success: true, message: 'created', id: added._id })
    } catch (e) {
      res
        .status(409)
        .json({ success: false, message: 'Oops! something went wrong' })
    }
  },
  async pending(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 10
      const page = Number(req.query.page) || 1

      const aggregate = await Records.aggregate([
        {
          $match: {
            'status.approved': {
              $eq: null
            }
          }
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
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$activity_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'student_id',
            foreignField: 'student_id',
            as: 'student_doc'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$student_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $sort: {
            updatedAt: -1
          }
        },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            course_id: '$course_id',
            student_id: '$student_id',
            first_name: '$first_name',
            last_name: '$last_name',
            activity_id: '$activity_id',
            activity_title: '$title'
          }
        }
      ])

      // const data = await Records.aggregatePaginate(aggregate, { page, limit })

      res.status(200).json(aggregate)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async approved(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 10
      const page = Number(req.query.page) || 1

      const aggregate = await Records.aggregate([
        {
          $match: {
            'status.approved': {
              $eq: true
            }
          }
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
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$activity_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'student_id',
            foreignField: 'student_id',
            as: 'student_doc'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$student_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $sort: {
            updatedAt: -1
          }
        },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            course_id: '$course_id',
            student_id: '$student_id',
            first_name: '$first_name',
            last_name: '$last_name',
            activity_id: '$activity_id',
            activity_title: '$title'
          }
        }
      ])

      // const data = await Records.aggregatePaginate(aggregate, { page, limit })

      res.status(200).json(aggregate)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async canceled(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 10
      const page = Number(req.query.page) || 1

      const aggregate = await Records.aggregate([
        {
          $match: {
            'status.approved': {
              $eq: false
            }
          }
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
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$activity_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'student_id',
            foreignField: 'student_id',
            as: 'student_doc'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$student_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $sort: {
            updatedAt: -1
          }
        },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            course_id: '$course_id',
            student_id: '$student_id',
            first_name: '$first_name',
            last_name: '$last_name',
            activity_id: '$activity_id',
            activity_title: '$title'
          }
        }
      ])

      // const data = await Records.aggregatePaginate(aggregate, { page, limit })

      res.status(200).json(aggregate)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async action(req, res, next) {
    try {
      const eventId = req.params.id
      const {
        scores,
        approved,
        approvedWithCondition,
        approvedBy,
        comment
      } = req.body
      const status = {
        approved,
        approvedWithCondition,
        approvedBy,
        comment
      }

      const item = await Records.findOne({ _id: eventId })
      const activityDetail = await Activities.findOne({ _id: item.activity_id })
      const student = await Users.findOne({ student_id: item.student_id })

      const newScore = await grading.save(scores, student.tracking_id)

      let newNotify = new Notifications({
        student_id: item.student_id,
        activity_id: item.activity_id,
        activity_title: activityDetail.title,
        record_id: item._id,
        is_approve: false,
        is_read: false
      })

      if (approved) {
        await Records.findOneAndUpdate(
          {
            _id: eventId
          },
          {
            scores: newScore,
            status
          }
        )
        newNotify.is_approve = true
        await newNotify.save()
      } else {
        await Records.findOneAndUpdate(
          {
            _id: eventId
          },
          { status }
        )
        await newNotify.save()
      }

      res.status(200).json({ success: true, message: 'updated' })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async isApproved(req, res, next) {
    try {
      let earnedPoint = []
      const eventId = req.params.id
      const { activity_id, student_id } = await Records.findOne({
        _id: eventId
      })
      const data = await Records.find({
        _id: {
          $ne: eventId
        },
        activity_id,
        student_id
      })
      if (data.length > 0) {
        data.map(eachRecord => {
          eachRecord.scores.map(score => {
            if (score.count) {
              earnedPoint.push({ id: score.id, point: score.point })
            }
          })
        })
        res.status(200).json({ success: true, message: earnedPoint })
      } else {
        res.status(200).json({ success: true, message: null })
      }
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async viewById(req, res, next) {
    try {
      const id = req.params.id

      const data = await Records.aggregate([
        {
          $match: {
            _id: ObjectId(id)
          }
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
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$activity_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'student_id',
            foreignField: 'student_id',
            as: 'student_doc'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$student_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $project: {
            student_doc: 0,
            activity_doc: 0
          }
        }
      ])

      res.status(200).json(data)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  }
}
/**
 * Course section
 **/
export const course = {
  async newBatch(req, res, next) {
    try {
      const course_id = req.params.id
      const { unity_setting, structure } = req.body

      const result = await Batches.findOne({ course_id, is_open: true })

      if (result) {
        await Batches.findOneAndUpdate(
          {
            _id: result._id
          },
          { unity_setting }
        )
        await Criteria.findOneAndUpdate(
          {
            batch_id: result._id
          },
          { structure }
        )
        res.status(200).json({ success: true, message: 'updated' })
      } else {
        const batch = new Batches({ course_id, unity_setting, is_open: true })
        const created = await batch.save()

        const rule = new Criteria({
          course_id,
          batch_id: created._id,
          structure
        })

        console.log(structure)

        await rule.save()

        res
          .status(201)
          .json({ success: true, message: 'created', id: created._id })
      }
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async batch(req, res, next) {
    try {
      const limit = Number(req.query.limit) || 10
      const page = Number(req.query.page) || 1

      const courseId = req.params.id
      const result = await Batches.paginate(
        {
          course_id: courseId,
          is_open: false
        },
        {
          sort: {
            updatedAt: -1
          },
          limit,
          page
        }
      )

      res.status(200).json({ success: true, data: result })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async checkBatch(req, res, next) {
    try {
      const courseId = Number(req.params.id)
      const result = await Batches.findOne({
        course_id: courseId,
        is_open: true
      })

      if (!result) {
        res.status(200).json({
          success: false,
          message: 'Please create new batch to continue..'
        })
      } else {
        const rule = await Criteria.findOne({ batch_id: result._id })
        res.status(200).json({
          success: true,
          id: result._id,
          unity_id: result.unity_id,
          participants: result.unity_setting,
          createdAt: result.createdAt,
          structure: rule.structure
        })
      }
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async batchById(req, res, next) {
    try {
      const batchId = req.params.batch
      const result = await Batches.findOne({ _id: batchId })

      res
        .status(200)
        .json({ success: true, data: result, timestamp: Date.now() })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async scoreboard(req, res, next) {
    try {
      const courseId = Number(req.params.id)
      const result = await Batches.findOne({
        course_id: courseId,
        is_open: true
      })

      if (!result) {
        res.status(200).json({
          success: false,
          message: 'Please create new batch to continue..'
        })
      }
      const startFrom = result.createdAt

      let buffer = []
      const unfiltered = await Records.aggregate([
        {
          $unwind: '$scores'
        },
        {
          $match: {
            createdAt: {
              $gt: startFrom
            },
            course_id: courseId,
            'status.approved': true
          }
        },
        {
          $group: {
            _id: '$student_id'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'student_id',
            as: 'student_doc'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$student_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $project: {
            student_doc: 0
          }
        }
      ])

      console.log(unfiltered)

      for (let student of unfiltered) {
        let total = 0
        const scores = await grading.student(student.student_id, result._id)
        scores.map(score => {
          total += score.point
        })
        buffer.push({
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          points: total
        })
      }

      const sorted = _.sortBy(buffer, ['points']).reverse()

      res.status(200).json({
        success: true,
        data: {
          student_list: sorted
        },
        timestamp: Date.now()
      })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async participant(req, res, next) {
    try {
      const courseId = Number(req.params.id)
      const checkBatch = await Batches.findOne({
        course_id: courseId,
        is_open: true
      })

      if (!checkBatch) {
        res.status(200).json({
          success: false,
          message: 'Please create new batch to continue..'
        })
      }
      const startFrom = checkBatch.createdAt

      const data = await Records.aggregate([
        {
          $unwind: '$scores'
        },
        {
          $match: {
            createdAt: {
              $gt: startFrom
            },
            course_id: courseId,
            'status.approved': true
          }
        },
        {
          $group: {
            _id: '$student_id'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'student_id',
            as: 'student_doc'
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  $arrayElemAt: ['$student_doc', 0]
                },
                '$$ROOT'
              ]
            }
          }
        },
        {
          $sort: {
            student_id: 1
          }
        },
        {
          $project: {
            student_doc: 0
          }
        }
      ])

      res.status(200).json({ success: true, data, timestamp: Date.now() })
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  },
  async unity(req, res, next) {
    const courseId = Number(req.params.id)
    const checkBatch = await Batches.findOne({
      course_id: courseId,
      is_open: true
    })

    if (!checkBatch) {
      res.status(200).json({
        success: false,
        message: 'Please create new batch to continue..'
      })
    }
    const startFrom = new Date(checkBatch.createdAt).getTime()

    const data = await Activities.find({
      createdAt: {
        $gte: startFrom
      },
      unity: true
    })

    res.status(200).json(data)
  },
  async selectUnity(req, res, next) {
    const courseId = Number(req.params.id)
    const { activity_id } = req.body

    await Batches.findOneAndUpdate(
      {
        course_id: courseId,
        is_open: true
      },
      { unity_id: activity_id }
    )
    res.status(200).json({ success: true, message: 'updated!' })
  },
  async checkout(req, res, next) {
    const courseId = Number(req.params.id)
    const batch = await Batches.findOne({ course_id: courseId, is_open: true })
    const startFrom = batch.createdAt

    let buffer = []
    let counter = 0
    // Fetch scoreboard
    const unfiltered = await Records.aggregate([
      {
        $unwind: '$scores'
      },
      {
        $match: {
          createdAt: {
            $gt: startFrom
          },
          course_id: courseId,
          'status.approved': true
        }
      },
      {
        $group: {
          _id: '$student_id'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'student_id',
          as: 'student_doc'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ['$student_doc', 0]
              },
              '$$ROOT'
            ]
          }
        }
      },
      {
        $project: {
          student_doc: 0
        }
      }
    ])

    for (let student of unfiltered) {
      const scores = await grading.student(student._id, batch._id)

      buffer.push({
        student_id: student._id,
        first_name: student.first_name,
        last_name: student.last_name,
        scores
      })

      // Update each student's tracking course
      await Users.findOneAndUpdate(
        {
          student_id: student._id
        },
        {
          tracking: 0,
          $push: {
            history: {
              course_id: courseId,
              batch_id: batch._id,
              scores
            }
          }
        }
      )
      counter++
    }

    const sorted = _.sortBy(buffer, ['student_id'])

    // save batch detail
    await Batches.findOneAndUpdate(
      {
        _id: ObjectId(batch._id)
      },
      {
        is_open: false,
        checkoutAt: Date.now(),
        student_list: sorted,
        participant: counter
      }
    )

    res.status(200).json({ success: true, message: 'updated!', id: batch._id })
  },
  async exportData(req, res, next) {
    const batchId = req.params.batch

    const batchDetail = await Batches.findOne({ _id: ObjectId(batchId) })
    const { structure } = await Criteria.findOne({ batch_id: batchId })

    let rowHeader = ['Course']

    for (let score of structure) {
      rowHeader.push(score.title)
    }

    rowHeader = [...rowHeader]

    // Create the excel report.
    const report = excel.buildExport([
      {
        name: 'Scoreboard',
        heading: sheets.scoreboard.heading(batchDetail),
        merges: sheets.scoreboard.merges(),
        specification: sheets.scoreboard.spec(),
        data: sheets.scoreboard.data(batchDetail.student_list)
      },
      {
        name: 'Detail',
        heading: sheets.detail.heading(batchDetail),
        merges: sheets.detail.merges(),
        specification: sheets.detail.spec(rowHeader),
        data: sheets.detail.data(
          batchDetail.student_list,
          structure,
          batchDetail.course_id
        )
      }
    ])

    const filename = `${batchDetail.course_id}_${batchId}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats')
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    res.end(report, 'binary')
  }
}
