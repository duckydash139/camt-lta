import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  is_active: Boolean,
  is_root: Boolean
}, {timestamps: true})

schema.pre('save', function (next) {
  const account = this
  bcrypt.hash(account.password, 10, (err, hash) => {
    if (err) {
      return next(err)
    }
    // Store hash in DB.
    account.password = hash
    next()
  })
})

schema.post('save', (error, doc, next) => {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(error.code)
  }
})

const Account = mongoose.model('Accounts', schema)

export default Account
