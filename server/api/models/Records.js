import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'
import aggregatePaginate from 'mongoose-aggregate-paginate'

const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
  course_id: {
    type: Number,
    require: true
  },
  activity_id: {
    type: ObjectId,
    require: true
  },
  student_id: {
    type: Number,
    require: true,
    minlength: 9
  },
  batch_id: {
    type: ObjectId,
    require: true
  },
  description: String,
  scores: {
    type: [{
      _id: false,
      id: Number,
      point: Number,
      count: Boolean
    }]
  },
  picture: String,
  status: {
    _id: false,
    approved: Boolean,
    approvedWithCondition: Boolean,
    approvedBy: String,
    comment: String
  }
}, {
  timestamps: true
})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Record = mongoose.model('Records', schema)

export default Record
