import mongoose from 'mongoose'
import paginate from 'mongoose-paginate'

const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    require: true
  },
  citizen_id: {
    type: String,
    unique: true,
    require: true,
    minlength: 13
  },
  student_id: {
    type: Number,
    unique: true,
    require: true,
    minlength: 9
  },
  first_name: String,
  last_name: String,
  organization: Number,
  tracking: Number,
  tracking_id: ObjectId,
  history: Array
}, {
  timestamps: true
})

schema.plugin(paginate)
const User = mongoose.model('Users', schema)

schema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(error)
  }
})

export default User
