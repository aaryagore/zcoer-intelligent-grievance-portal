import type { Category, AdminUser, StudentUser } from './types';

export const CATEGORIES: Category[] = [
  'Transport',
  'Student Issue',
  'Security',
  'Campus',
  'Academics',
  'Hostel',
  'IT',
  'Electricity',
  'Administration',
  'Mess'
];

export const STATUS_COLORS = {
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-200'
};

export const PRIORITY_COLORS = {
  'Critical': 'bg-rose-100 text-rose-700 border-rose-200',
  'High': 'bg-orange-100 text-orange-700 border-orange-200',
  'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
  'Low': 'bg-slate-100 text-slate-600 border-slate-200'
};

export const STORAGE_KEY = 'intelligent_grievance_complaints';
export const ADMIN_SESSION_KEY = 'zcoer_admin_session_v2';
export const STUDENT_SESSION_KEY = 'zcoer_student_session_v2';

// ZCOER Brand Colors
export const BRAND = {
  primary: '#064F93',     // Zeal Blue
  primaryDark: '#0b2d51',
  gold: '#FFD700',
  goldLight: '#FFFBE6',
  dark: '#0f172a',
};

/**
 * STUDENT DATABASE
 */
export const STUDENT_DATABASE: Record<string, StudentUser & { password: string }> = {
  'zcoer2310': { zprn: 'zcoer2310', name: 'Aarya Gore', email: 'aaryagore7@gmail.com', password: 'aarya@123' },
  'zcoer2311': { zprn: 'zcoer2311', name: 'Rahul Patil', email: 'rahul2311@zcoer.edu.in', password: 'rahul@123' },
  'zcoer2312': { zprn: 'zcoer2312', name: 'Sneha Kulkarni', email: 'sneha2312@zcoer.edu.in', password: 'sneha@123' },
  'zcoer2215': { zprn: 'zcoer2215', name: 'Om Deshmukh', email: 'om2215@zcoer.edu.in', password: 'om@123' },
  'zcoer2401': { zprn: 'zcoer2401', name: 'Priya Joshi', email: 'priya2401@zcoer.edu.in', password: 'priya@123' },
  'zcoer2402': { zprn: 'zcoer2402', name: 'Rohit More', email: 'rohit2402@zcoer.edu.in', password: 'rohit@123' },
  'zcoer2403': { zprn: 'zcoer2403', name: 'Neha Shinde', email: 'neha2403@zcoer.edu.in', password: 'neha@123' },
  'zcoer2404': { zprn: 'zcoer2404', name: 'Aditya Pawar', email: 'aditya2404@zcoer.edu.in', password: 'aditya@123' },
  'zcoer2405': { zprn: 'zcoer2405', name: 'Kavya Kulkarni', email: 'kavya2405@zcoer.edu.in', password: 'kavya@123' },
  'zcoer2409': { zprn: 'zcoer2409', name: 'Uday Jain', email: 'udayjain3104@gmail.com', password: 'uday@123' },
  'zcoer2509': { zprn: 'zcoer2509', name: 'Vedashri Karekar', email: 'kvedashri15@gmail.com', password: 'vedashri@123' },
  'zcoer2501': { zprn: 'zcoer2501', name: 'Gauri Lavand', email: 'gaurilavand8@gmail.com', password: 'gauri@123' },
};

/**
 * STAFF ACCOUNTS
 */
export const STAFF_ACCOUNTS: Record<string, AdminUser & { password: string }> = {
  'super_dean': { id: 'DEAN001', username: 'super_dean', password: 'password123', name: 'Dr. V. M. Wadhai', assignedCategory: 'ALL', role: 'Dean' },
  'transport_officer': { id: 'STF001', username: 'transport_officer', password: 'password123', name: 'Mr. Sanjay Rathore', assignedCategory: 'Transport', role: 'Staff' },
  'student_welfare': { id: 'STF002', username: 'student_welfare', password: 'password123', name: 'Prof. Megha Shinde', assignedCategory: 'Student Issue', role: 'Staff' },
  'security_head': { id: 'STF003', username: 'security_head', password: 'password123', name: 'Major (Retd.) Vijay Pawar', assignedCategory: 'Security', role: 'Staff' },
  'campus_mgr': { id: 'STF004', username: 'campus_mgr', password: 'password123', name: 'Mr. Nitin Gadkari', assignedCategory: 'Campus', role: 'Staff' },
  'academic_head': { id: 'STF005', username: 'academic_head', password: 'password123', name: 'Dr. Sunita Deshmukh', assignedCategory: 'Academics', role: 'Staff' },
  'hostel_warden': { id: 'STF006', username: 'hostel_warden', password: 'password123', name: 'Mr. Ramesh Tawde', assignedCategory: 'Hostel', role: 'Staff' },
  'it_admin': { id: 'STF007', username: 'it_admin', password: 'password123', name: 'Mr. Amit Patil', assignedCategory: 'IT', role: 'Staff' },
  'electrical_head': { id: 'STF008', username: 'electrical_head', password: 'password123', name: 'Mr. Kishor More', assignedCategory: 'Electricity', role: 'Staff' },
  'admin_officer': { id: 'STF009', username: 'admin_officer', password: 'password123', name: 'Mrs. Pallavi Joshi', assignedCategory: 'Administration', role: 'Staff' },
  'mess_admin': { id: 'STF010', username: 'mess_admin', password: 'password123', name: 'Prof. Rajesh Kulkarni', assignedCategory: 'Mess', role: 'Staff' }
};
