const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, default: null },
  studentName: { type: String, default: null },
  studentEmail: { type: String, default: null },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  createdAt: { type: Number, required: true },
  resolvedAt: { type: Number, default: null },
  mlScore: { type: mongoose.Schema.Types.Mixed, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
