import type { StudentUser, Complaint } from '../types';
import { STUDENT_DATABASE } from '../constants';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

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
      const subject = `Complaint Registered: ${complaint.id}`;
      const message = `
Dear ${student.name},

Your grievance has been successfully registered in the ZCOER Intelligent Grievance Redressal Portal. 

Our AI engine has analyzed your complaint and routed it to the concerned department. You will receive another notification once the matter is resolved.

Thank you for your patience.

With regards,
ZCOER Grievance Redressal Cell
Zeal College of Engineering and Research
S.No. 39, Narhe, Pune - 411041
Email: zeal.grievance@zealeducation.com

This is an automated notification. Please do not reply to this email.
      `.trim();

      const response = await fetch(`${BACKEND_URL}/api/send-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: student.email, 
          subject, 
          message,
          details: {
            id: complaint.id,
            category: complaint.category,
            priority: complaint.priority
          }
        })
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
      const subject = `Complaint Resolved: ${complaint.id}`;
      
      const message = `
Dear ${recipientName},

We are pleased to inform you that your grievance (Ref: ${complaint.id}) has been successfully resolved.

The concerned department at ZCOER has reviewed and processed your grievance according to institutional policy. If you are not satisfied with the resolution, you may escalate the matter to the Dean's office.

Thank you for using the ZCOER Intelligent Grievance Portal.
      `.trim();

      const response = await fetch(`${BACKEND_URL}/api/send-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: recipientEmail, 
          subject, 
          message,
          details: {
            id: complaint.id,
            category: complaint.category,
            priority: complaint.priority
          }
        })
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
