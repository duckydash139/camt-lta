import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'

const schema = new mongoose.Schema({
  activity_id: String,
  activity_title: String,
  record_id: String,
  student_id: {
    type: Number,
    require: true,
    minlength: 9
  },
  is_approve: Boolean,
  is_read: Boolean
}, {
  timestamps: true
})

schema.plugin(paginate)
const Notifications = mongoose.model('Notifications', schema)

export default Notifications
