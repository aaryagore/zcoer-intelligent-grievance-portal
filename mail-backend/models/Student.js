const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  zprn: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);
