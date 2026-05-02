const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Dean', 'Staff'], required: true },
  assignedCategory: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', StaffSchema);
