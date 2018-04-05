import { Router } from 'express'
import { oauth, index } from './controllers'
import { auth } from '../authenticate'

const router = Router()

router.get('/oauth', oauth.connectToApi)
router.get('/users', auth.user, index.get)
router.get('/users/:id', auth.user, index.search)
router.put('/users/:id/course/', auth.user, index.setCourse)
router.get('/users/:id/:course/score', auth.user, index.checkScore)
router.get('/users/:id/:course/export', index.exportHistory)
router.get('/users/:id/history/all', auth.user, index.history)
router.get('/users/:id/notification', auth.user, index.fetchNotify)
router.put('/users/:id/notification', index.markAllAs)
router.put('/users/:id/notification/:notifyId', auth.user, index.updateNotify)
router.get('/history/:record', auth.user, index.historyById)
// router.get('/users/:id/history/:course', index.search)

export default router
