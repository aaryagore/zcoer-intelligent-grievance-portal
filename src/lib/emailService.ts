import type { StudentUser, Complaint } from '../types';
import { STUDENT_DATABASE } from '../constants';

const BACKEND_URL = '/api';

/**
 * ZCOER AI-Powered Email Gateway
 * Sends emails via the Node.js/Nodemailer backend on port 5001
 */
export const emailService = {
  senderEmail: 'zcoerzeal@gmail.com',

  /**
   * Sends complaint receipt confirmation email
   */
  sendComplaintRaisedEmail: async (student: StudentUser, complaint: Complaint): Promise<boolean> => {
    try {
      const subject = `[ZCOER] Complaint Registered: ${complaint.id} | ${complaint.category}`;
      const message = `
Dear ${student.name},

Your grievance has been successfully registered in the ZCOER Intelligent Grievance Redressal Portal.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLAINT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Case ID       : ${complaint.id}
Category      : ${complaint.category}
Subject       : ${complaint.subject}
Priority      : ${complaint.priority}
Status        : ${complaint.status}
Filed On      : ${new Date(complaint.createdAt).toLocaleString('en-IN')}

ML Priority Score : ${complaint.mlScore?.finalScore?.toFixed(1) || 'N/A'}/100
Urgency Level     : ${complaint.mlScore?.reasoning || 'Under Analysis'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your complaint has been intelligently routed to the concerned department
based on our ML prioritization engine. You will receive an email notification
once the complaint is resolved.

Expected Response Time:
  • Critical Priority : Within 24 hours
  • High Priority     : Within 48 hours
  • Medium Priority   : Within 72 hours
  • Low Priority      : Within 96 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Track your complaint status at: http://localhost:5173/#/view

For urgent matters, contact the campus security desk at +91 20 6720 6100.

With regards,
ZCOER Grievance Redressal Cell
Zeal College of Engineering and Research
S.No. 39, Narhe, Pune - 411041
Email: zeal.grievance@zealeducation.com

This is an automated notification. Please do not reply to this email.
      `.trim();

      const response = await fetch(`${BACKEND_URL}/send-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: student.email, subject, message })
      });

      if (!response.ok) throw new Error('Mail server error');
      
      // Dispatch UI notification
      window.dispatchEvent(new CustomEvent('zcoer-mail-sent', {
        detail: { type: 'receipt', to: student.email, subject: complaint.subject, id: complaint.id }
      }));

      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send complaint receipt:', error);
      // Still dispatch notification for UI feedback
      window.dispatchEvent(new CustomEvent('zcoer-mail-sent', {
        detail: { type: 'receipt', to: student.email, subject: complaint.subject, id: complaint.id, error: true }
      }));
      return false;
    }
  },

  /**
   * Sends resolution confirmation email
   */
  sendComplaintResolvedEmail: async (complaint: Complaint): Promise<boolean> => {
    const studentId = complaint.studentId?.toLowerCase();
    const studentEmail = complaint.studentEmail;
    const student = studentId ? STUDENT_DATABASE[studentId] : null;

    const recipientEmail = studentEmail || student?.email;
    const recipientName = complaint.studentName || student?.name || 'Student';

    if (!recipientEmail) {
      console.warn('[EmailService] No email found for complaint', complaint.id);
      return false;
    }

    try {
      const subject = `[ZCOER] Complaint Resolved: ${complaint.id} | ${complaint.category}`;
      const resolutionTime = complaint.resolvedAt 
        ? Math.round((complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60))
        : 0;
      
      const message = `
Dear ${recipientName},

We are pleased to inform you that your grievance has been successfully resolved.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESOLUTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Case ID         : ${complaint.id}
Category        : ${complaint.category}
Subject         : ${complaint.subject}
Filed On        : ${new Date(complaint.createdAt).toLocaleString('en-IN')}
Resolved On     : ${new Date(complaint.resolvedAt || Date.now()).toLocaleString('en-IN')}
Resolution Time : ${resolutionTime} hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The concerned department at Zeal College of Engineering and Research has
reviewed and processed your grievance. The matter has been officially closed
in our intelligent grievance management system.

If you are not satisfied with the resolution, you may escalate your grievance
to the Dean's office within 7 working days by submitting a new complaint
referencing Case ID: ${complaint.id}.

We value your feedback and are committed to continuous improvement of our
academic and administrative services.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for using the ZCOER Intelligent Grievance Portal.

With regards,
ZCOER Grievance Redressal Cell
Zeal College of Engineering and Research
S.No. 39, Narhe, Pune - 411041
Email: zeal.grievance@zealeducation.com

This is an automated notification. Please do not reply to this email.
      `.trim();

      const response = await fetch(`${BACKEND_URL}/send-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipientEmail, subject, message })
      });

      if (!response.ok) throw new Error('Mail server error');

      // Dispatch UI notification
      window.dispatchEvent(new CustomEvent('zcoer-mail-sent', {
        detail: { type: 'resolution', to: recipientEmail, subject: complaint.subject, id: complaint.id }
      }));

      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send resolution email:', error);
      window.dispatchEvent(new CustomEvent('zcoer-mail-sent', {
        detail: { type: 'resolution', to: recipientEmail, subject: complaint.subject, id: complaint.id, error: true }
      }));
      return false;
    }
  }
};
