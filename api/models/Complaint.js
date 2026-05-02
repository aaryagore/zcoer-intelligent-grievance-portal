import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  studentName: String,
  studentId: String,
  studentEmail: String,
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
  aiAnalysis: {
    sentiment: String,
    category: String,
    urgency: String,
    summary: String,
    suggestedAction: String
  },
  createdAt: { type: Number, default: Date.now },
  resolvedAt: Number,
  emailSent: { type: Boolean, default: false },
  resolutionEmailSent: { type: Boolean, default: false }
});

export default mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
