import mongoose from 'mongoose'

const ObjectId = mongoose.Schema.Types.ObjectId

const schema = new mongoose.Schema({
  course_id: Number,
  batch_id: ObjectId,
  structure: [
    {
      _id: false,
      id: Number,
      title: String,
      max: Number,
      color: String,
      formula: String,
      report: Boolean
    }
  ]
})

const Criteria = mongoose.model('Criteria', schema)

export default Criteria
