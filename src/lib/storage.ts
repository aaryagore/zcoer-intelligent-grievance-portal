import type { Complaint, Statistics, AdminUser, StudentUser } from '../types';
import { ADMIN_SESSION_KEY, STUDENT_SESSION_KEY } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const storage = {
  getComplaints: async (): Promise<Complaint[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  saveComplaint: async (complaint: Complaint): Promise<Complaint | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint)
      });
      if (!response.ok) throw new Error('Failed to save complaint');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  updateComplaintStatus: async (id: string, status: Complaint['status']): Promise<Complaint | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update complaint status');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getComplaintById: async (id: string): Promise<Complaint | null> => {
    try {
      const complaints = await storage.getComplaints();
      return complaints.find(c => c.id === id) || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  getStats: async (): Promise<Statistics> => {
    const complaints = await storage.getComplaints();
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      critical: complaints.filter(c => c.priority === 'Critical').length,
      high: complaints.filter(c => c.priority === 'High').length,
    };
  },

  // Admin Session Management
  loginAdmin: (admin: AdminUser) => {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
  },

  logoutAdmin: () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  getCurrentAdmin: (): AdminUser | null => {
    const data = localStorage.getItem(ADMIN_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Student Session Management
  loginStudent: (student: StudentUser) => {
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(student));
  },

  logoutStudent: () => {
    localStorage.removeItem(STUDENT_SESSION_KEY);
  },

  getCurrentStudent: (): StudentUser | null => {
    const data = localStorage.getItem(STUDENT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
};
