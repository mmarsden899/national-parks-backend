const mongoose = require('mongoose')

const parkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  established: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  rec_visitors: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Park', parkSchema)
