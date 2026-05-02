import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import mongoose from 'mongoose';
import Complaint from './models/Complaint.js';
import Student from './models/Student.js';
import Staff from './models/Staff.js';

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log(`[DB] Connected to MongoDB`))
  .catch(err => console.error(`[DB] Connection error:`, err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Root message
app.get('/', (req, res) => {
  res.send("ZCOER Intelligent Grievance API is Live on Vercel!");
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: "Vercel API Running", dbStatus: mongoose.connection.readyState });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({ 
    hasMongoUri: !!process.env.MONGO_URI,
    mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) + "..." : "MISSING",
    hasGmailUser: !!process.env.GMAIL_USER,
    hasGmailPass: !!process.env.GMAIL_PASS,
    nodeVersion: process.version
  });
});

// --- Auth Endpoints ---
app.post("/auth/student-login", async (req, res) => {
  try {
    const { zprn, password } = req.body;
    const student = await Student.findOne({ zprn: zprn.toLowerCase() });
    if (!student || student.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ zprn: student.zprn, name: student.name, email: student.email });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/auth/staff-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.findOne({ username: username.toLowerCase() });
    if (!staff || staff.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ id: staff.staffId, username: staff.username, name: staff.name, assignedCategory: staff.assignedCategory, role: staff.role });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- Complaint Endpoints ---
app.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

app.post("/complaints", async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to create complaint" });
  }
});

app.put("/complaints/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateData = { status };
    if (status === 'Resolved') updateData.resolvedAt = Date.now();
    const updated = await Complaint.findOneAndUpdate({ id }, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// --- Mail Endpoint ---
app.post("/send-mail", async (req, res) => {
  const { to, subject, message } = req.body;
  try {
    await transporter.sendMail({
      from: `"ZCOER Grievance Cell" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: message,
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">${message}</div>`
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
