import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  policyViolation: { type: Boolean, default: false },
  studentName: { type: String, default: 'Anonymous' },
  studentId: { type: String, default: 'Anonymous' },
  studentEmail: { type: String, default: 'Anonymous' },
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved", "Closed"], 
    default: "Pending" 
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Critical"], 
    default: "Medium" 
  },
  mlScore: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Number, default: Date.now },
  resolvedAt: Number,
  emailSent: { type: Boolean, default: false },
  resolutionEmailSent: { type: Boolean, default: false }
});

export default mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
