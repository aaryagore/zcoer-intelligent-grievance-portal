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
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.GMAIL_USER || "zealcollegeit@gmail.com",
    pass: process.env.GMAIL_PASS || "wtye psji kjtg osbi" 
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 10000 // 10 seconds
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
  const { to, subject, message, details } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields: to, subject, message" });
  }

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
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #334155;">${message.replace(/\n/g, '<br>')}</p>
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

    const info = await transporter.sendMail({
      from: `"ZCOER Grievance Cell" <${process.env.GMAIL_USER || "zealcollegeit@gmail.com"}>`,
      to,
      subject: `[ZCOER] ${subject}`,
      text: message,
      html: htmlContent
    });

    console.log(`[MAIL SENT] To: ${to} | Subject: ${subject} | MessageId: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId, to });
  } catch (error) {
    console.error(`[MAIL ERROR] To: ${to} | Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Test email endpoint
app.get("/api/test-email", async (req, res) => {
  try {
    await transporter.verify();
    res.json({ success: true, message: "Gmail connection is working perfectly!" });
  } catch (error) {
    console.error("[Mail Test Error]", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      tip: "If you see 'Invalid login', make sure GMAIL_USER and GMAIL_PASS are set correctly in Render environment variables."
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║   ZCOER Intelligent Grievance - Backend App      ║`);
  console.log(`║   Running on http://localhost:${PORT}               ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
