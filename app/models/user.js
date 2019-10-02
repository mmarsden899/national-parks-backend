const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  list: [{
    type: String
  }]
}, {
  timestamps: true,
  toObject: {
    // remove `hashedPassword` field when we call `.toObject`
    transform: (_doc, user) => {
      return user
    }
  }
})

module.exports = mongoose.model('User', userSchema)
