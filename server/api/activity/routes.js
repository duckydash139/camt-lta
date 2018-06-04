import { Router } from 'express'
import { user } from './controllers'
import { uploader } from '../upload'
import { auth } from '../authenticate'

const router = Router()

router.get('/event', user.get)
router.get('/event/:id', user.search)
router.post('/event/:id/add', auth.user, uploader.image, uploader.resize, user.submit)
router.post('/event/:id/addReport', auth.user, uploader.pdf, user.report)
router.post('/event/:id/edit', auth.user, user.edit)
router.post('/event/:id/delete', auth.user, user.delete)
router.get('/event/:id/delete/check', user.checkActivity)
router.post('/event/:id/cancel', auth.user, user.cancel)
router.post('/event/:id/interest', auth.user, user.interest)
router.post('/event/:id/check', auth.user, user.checkInterest)
router.post('/event/add', auth.user, user.add)

export default router
