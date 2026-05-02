export type Category = 
  | 'Transport' 
  | 'Student Issue' 
  | 'Security' 
  | 'Campus' 
  | 'Academics' 
  | 'Hostel' 
  | 'IT' 
  | 'Electricity' 
  | 'Administration' 
  | 'Mess';

export type Status = 'Pending' | 'In Progress' | 'Resolved' | 'Closed';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface MLPriorityScore {
  urgencyScore: number;       // 0-100
  frequencyScore: number;     // 0-100 (how often similar complaints come)
  impactScore: number;        // 0-100 (number of students affected)
  sentimentScore: number;     // 0-100 (emotional intensity)
  finalScore: number;         // weighted composite
  reasoning: string;
  fairnessFlag: boolean;      // flags if priority conflicts with historical patterns
}

export interface Complaint {
  id: string;
  category: Category;
  subject: string;
  description: string;
  isAnonymous: boolean;
  policyViolation?: boolean;
  studentName?: string;
  studentId?: string;
  studentEmail?: string;
  createdAt: number;
  status: Status;
  priority: Priority;
  mlScore?: MLPriorityScore;
  assignedStaff?: string;
  resolvedAt?: number;
  emailSent?: boolean;
  resolutionEmailSent?: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  assignedCategory: Category | 'ALL';
  role: 'Staff' | 'Dean' | 'Admin';
}

export interface StudentUser {
  zprn: string;
  name: string;
  email: string;
}

export interface Statistics {
  total: number;
  pending: number;
  resolved: number;
  inProgress: number;
  critical: number;
  high: number;
}
