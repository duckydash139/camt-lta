import { Router } from 'express'
import { admin, student, activity, course } from './controllers'
import { auth } from '../authenticate'

const router = Router()

router.get('/admin', auth.admin)
router.post('/admin/account/signin', admin.signin)
router.post('/admin/account/signup', auth.admin, admin.signup)
router.get('/admin/account/list', auth.admin, admin.list)
router.post('/admin/account/permission', auth.admin, admin.permission)
router.post('/admin/account/status', auth.admin, admin.status)

/**
 * Activity section
 **/
router.get('/admin/activity/all', activity.all)
router.put('/admin/activity/add', auth.admin, activity.add)
router.get('/admin/activity/pending', auth.admin, activity.pending)
router.get('/admin/activity/approved', auth.admin, activity.approved)
router.get('/admin/activity/canceled', auth.admin, activity.canceled)
router.get('/admin/activity/:id', auth.admin, activity.viewById)
router.post('/admin/activity/:id', auth.admin, activity.action)
router.get('/admin/activity/:id/check', auth.admin, activity.isApproved)
/**
 * Course section
 **/
router.post('/admin/course/:id/create', auth.admin, course.newBatch)
router.post('/admin/course/:id/checkout', course.checkout)
router.get('/admin/course/:id/check', auth.admin, course.checkBatch)
router.get('/admin/course/:id/scoreboard', auth.admin, course.scoreboard)
router.get('/admin/course/:id/participants', auth.admin, course.participant)
router.get('/admin/course/:id/unity', auth.admin, course.unity)
router.put('/admin/course/:id/unity', auth.admin, course.selectUnity)
router.get('/admin/course/:id/history', auth.admin, course.batch)
router.get('/admin/course/:id/history/:batch', auth.admin, course.batchById)
router.get('/admin/course/:id/history/:batch/export', auth.admin, course.exportData)
/**
 * Student section
 **/
router.get('/admin/student/all', auth.admin, student.all)
router.get('/admin/student/:id', auth.admin, student.byId)
router.get('/admin/student/:id/clear', auth.admin, student.clearTracking)
router.get('/admin/student/:id/:course/score', auth.admin, student.checkScore)
router.get('/admin/student/:id/history/all', auth.admin, student.history)
router.get('/admin/student/:id/history/:eventId', auth.admin, student.historyById)

export default router
