const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  grade: {
    type: String,
    required: true
  },
  enrolled: {
    type: Boolean,
    default: true
  }
});
module.exports = mongoose.model('Student', studentSchema);