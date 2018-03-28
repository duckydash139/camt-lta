import { Router } from 'express'
import { score } from './controllers'

const router = Router()

router.get('/criteria/:id', score.index)

export default router
