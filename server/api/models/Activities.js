import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'

const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  startAt: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  },
  location: String,
  description: {
    type: String,
    required: true
  },
  unity: Boolean,
  createdBy: {
    user: ObjectId,
    admin: ObjectId
  }
}, {
  timestamps: true
})
schema.plugin(paginate)
const Activity = mongoose.model('Activities', schema)

export default Activity
