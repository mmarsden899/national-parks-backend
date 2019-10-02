const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  list: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'Park'
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
