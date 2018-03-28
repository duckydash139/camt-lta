import { Criteria } from '../models'

export const score = {
  async index (req, res, next) {
    try {
      const data = await Criteria.findOne({'batch_id': req.params.id})
      res.status(200).json(data)
    } catch (e) {
      res.status(409).json({ success: false, message: e })
    }
  }
}
