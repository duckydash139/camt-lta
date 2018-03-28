import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'

const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
  course_id: {
    type: Number,
    required: true
  },
  unity_setting: {
    type: Number,
    required: true
  },
  is_open: Boolean,
  unity_id: ObjectId,
  student_list: Array,
  participant: Number,
  checkoutAt: Date,
  checkoutBy: String
}, {
  timestamps: true
})
schema.plugin(paginate)
const Batches = mongoose.model('Batches', schema)

export default Batches
