import { Router } from 'express'

import users from './users/routes'
import admin from './admin/routes'
import activity from './activity/routes'
import criteria from './criteria/routes'
// import oauth from './oauth'
// import uploader from './upload'

const router = Router()

// Add USERS Routes
router.use(users)
router.use(admin)
router.use(activity)
router.use(criteria)
// router.use(oauth)
// router.use(uploader)

export default router
