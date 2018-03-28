import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'

const schema = new mongoose.Schema({
  activity_id: {
    type: String,
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
const Interest = mongoose.model('Interests', schema)

export default Interest
