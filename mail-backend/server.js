require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const Student = require("./models/Student");
const Staff = require("./models/Staff");

const app = express();
app.use(cors());
app.use(express.json());

// ══════════════════════════════════════════════════════════════
// ZCOER Intelligent Grievance Portal - Backend (Port 5001)
// ══════════════════════════════════════════════════════════════

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zcoer-grievance";
mongoose.connect(MONGO_URI)
  .then(() => console.log(`[DB] Successfully connected to MongoDB`))
  .catch(err => console.error(`[DB] MongoDB connection error:`, err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "zealcollegeit@gmail.com",
    pass: process.env.GMAIL_PASS || "wtye psji kjtg osbi" 
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("<h1>ZCOER Intelligent Grievance Portal - Backend is Live!</h1><p>Use /health for status check.</p>");
});

app.get("/health", (req, res) => {
  res.json({ status: "ZCOER Backend Running", port: 5001, dbStatus: mongoose.connection.readyState });
});

// --- Authentication Endpoints ---

// Student Login
app.post("/api/auth/student-login", async (req, res) => {
  try {
    const { zprn, password } = req.body;
    const student = await Student.findOne({ zprn: zprn.toLowerCase() });

    if (!student) {
      return res.status(401).json({ error: "ZPRN not found in the student registry." });
    }
    if (student.password !== password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    res.json({ zprn: student.zprn, name: student.name, email: student.email });
  } catch (error) {
    console.error("[API Error] Student login failed:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Staff Login
app.post("/api/auth/staff-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.findOne({ username: username.toLowerCase() });

    if (!staff) {
      return res.status(401).json({ error: "Username not found in the staff registry." });
    }
    if (staff.password !== password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    res.json({ id: staff.staffId, username: staff.username, name: staff.name, assignedCategory: staff.assignedCategory, role: staff.role });
  } catch (error) {
    console.error("[API Error] Staff login failed:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});
// --- Database API Endpoints ---

// Get all complaints
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("[API Error] Failed to fetch complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Create a complaint
app.post("/api/complaints", async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("[API Error] Failed to create complaint:", error);
    res.status(500).json({ error: "Failed to create complaint" });
  }
});

// Update complaint status
app.put("/api/complaints/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    let updateData = { status };
    if (status === 'Resolved') {
      updateData.resolvedAt = Date.now();
    }

    const updatedComplaint = await Complaint.findOneAndUpdate(
      { id }, 
      updateData, 
      { new: true }
    );
    
    if (!updatedComplaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json(updatedComplaint);
  } catch (error) {
    console.error("[API Error] Failed to update complaint status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});


// --- Mail Endpoints ---
app.post("/api/send-mail", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields: to, subject, message" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"ZCOER Grievance Cell" <${process.env.GMAIL_USER || "zealcollegeit@gmail.com"}>`,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: #064F93; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h2 style="color: #FFD700; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">ZCOER</h2>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Intelligent Grievance Portal</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
            <pre style="font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-wrap; word-wrap: break-word;">${message}</pre>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <div style="text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">Zeal College of Engineering and Research | S.No. 39, Narhe, Pune-411041</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0;">This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </div>
      `
    });

    console.log(`[MAIL SENT] To: ${to} | Subject: ${subject} | MessageId: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId, to });
  } catch (error) {
    console.error(`[MAIL ERROR] To: ${to} | Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║   ZCOER Intelligent Grievance - Backend App      ║`);
  console.log(`║   Running on http://localhost:${PORT}               ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
