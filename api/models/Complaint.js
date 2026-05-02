const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentZprn: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved"], 
    default: "Pending" 
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High"], 
    default: "Medium" 
  },
  aiAnalysis: {
    sentiment: String,
    category: String,
    urgency: String,
    summary: String,
    suggestedAction: String
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
