import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'
import aggregatePaginate from 'mongoose-aggregate-paginate'

const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
  activity_id: {
    type: ObjectId,
    require: true
  },
  student_id: {
    type: Number,
    require: true,
    minlength: 9
  }
}, {
  timestamps: true
})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Interest = mongoose.model('Interests', schema)

export default Interest
