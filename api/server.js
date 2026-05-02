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

// Database Connection Singleton
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  console.log('[DB] Connecting to MongoDB...');
  cachedDb = await mongoose.connect(process.env.MONGO_URI);
  return cachedDb;
}

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('[DB Error]', error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Root message
app.get('/api', (req, res) => {
  res.send("ZCOER Intelligent Grievance API is Live on Vercel!");
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "Vercel API Running", dbStatus: mongoose.connection.readyState });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({ 
    hasMongoUri: !!process.env.MONGO_URI,
    mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) + "..." : "MISSING",
    hasGmailUser: !!process.env.GMAIL_USER,
    hasGmailPass: !!process.env.GMAIL_PASS,
    nodeVersion: process.version
  });
});

// --- Auth Endpoints ---
app.post("/api/auth/student-login", async (req, res) => {
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

app.post("/api/auth/staff-login", async (req, res) => {
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
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

app.post("/api/complaints", async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to create complaint" });
  }
});

app.put("/api/complaints/:id/status", async (req, res) => {
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
app.post("/api/send-mail", async (req, res) => {
  const { to, subject, message, details } = req.body;
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #1e1b4b; padding: 30px; text-align: center;">
          <h1 style="color: #fbbf24; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">ZCOER Grievance Cell</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.8; font-size: 14px;">Intelligent Redressal System</p>
        </div>
        
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #1e1b4b; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Notification: ${subject}</h2>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #fbbf24;">
            <p style="margin: 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Message Body</p>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #334155;">${message}</p>
          </div>

          ${details ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Reference ID</th>
              <td style="padding: 12px; font-family: monospace; font-weight: bold; color: #1e1b4b; border-bottom: 1px solid #e2e8f0;">${details.id}</td>
            </tr>
            <tr>
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Category</th>
              <td style="padding: 12px; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${details.category}</td>
            </tr>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">AI Priority</th>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                <span style="background-color: ${details.priority === 'Critical' ? '#fee2e2' : '#fef3c7'}; color: ${details.priority === 'Critical' ? '#991b1b' : '#92400e'}; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${details.priority}
                </span>
              </td>
            </tr>
          </table>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message from the AI-Powered Redressal Portal.</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 5px 0;">© 2026 Zeal College of Engineering & Research</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"ZCOER Grievance Cell" <${process.env.GMAIL_USER}>`,
      to,
      subject: `[ZCOER] ${subject}`,
      text: message,
      html: htmlContent
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
