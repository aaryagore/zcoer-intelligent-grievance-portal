/**
 * Seed Script - Run once to populate MongoDB with student and staff data
 * Usage: node seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Staff = require('./models/Staff');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zcoer-grievance";

const students = [
  { zprn: 'zcoer2310', name: 'Aarya Gore', email: 'aaryagore7@gmail.com', password: 'aarya@123' },
  { zprn: 'zcoer2311', name: 'Rahul Patil', email: 'rahul2311@zcoer.edu.in', password: 'rahul@123' },
  { zprn: 'zcoer2312', name: 'Sneha Kulkarni', email: 'sneha2312@zcoer.edu.in', password: 'sneha@123' },
  { zprn: 'zcoer2215', name: 'Om Deshmukh', email: 'om2215@zcoer.edu.in', password: 'om@123' },
  { zprn: 'zcoer2401', name: 'Priya Joshi', email: 'priya2401@zcoer.edu.in', password: 'priya@123' },
  { zprn: 'zcoer2402', name: 'Rohit More', email: 'rohit2402@zcoer.edu.in', password: 'rohit@123' },
  { zprn: 'zcoer2403', name: 'Neha Shinde', email: 'neha2403@zcoer.edu.in', password: 'neha@123' },
  { zprn: 'zcoer2404', name: 'Aditya Pawar', email: 'aditya2404@zcoer.edu.in', password: 'aditya@123' },
  { zprn: 'zcoer2405', name: 'Kavya Kulkarni', email: 'kavya2405@zcoer.edu.in', password: 'kavya@123' },
  { zprn: 'zcoer2409', name: 'Uday Jain', email: 'udayjain3104@gmail.com', password: 'uday@123' },
  { zprn: 'zcoer2509', name: 'Vedashri Karekar', email: 'kvedashri15@gmail.com', password: 'vedashri@123' },
  { zprn: 'zcoer2501', name: 'Gauri Lavand', email: 'gaurilavand8@gmail.com', password: 'gauri@123' },
];

const staffMembers = [
  { staffId: 'DEAN001', username: 'super_dean', name: 'Dr. V. M. Wadhai', password: 'password123', role: 'Dean', assignedCategory: 'ALL' },
  { staffId: 'STF001', username: 'transport_officer', name: 'Mr. Sanjay Rathore', password: 'password123', role: 'Staff', assignedCategory: 'Transport' },
  { staffId: 'STF002', username: 'student_welfare', name: 'Prof. Megha Shinde', password: 'password123', role: 'Staff', assignedCategory: 'Student Issue' },
  { staffId: 'STF003', username: 'security_head', name: 'Major (Retd.) Vijay Pawar', password: 'password123', role: 'Staff', assignedCategory: 'Security' },
  { staffId: 'STF004', username: 'campus_mgr', name: 'Mr. Nitin Gadkari', password: 'password123', role: 'Staff', assignedCategory: 'Campus' },
  { staffId: 'STF005', username: 'academic_head', name: 'Dr. Sunita Deshmukh', password: 'password123', role: 'Staff', assignedCategory: 'Academics' },
  { staffId: 'STF006', username: 'hostel_warden', name: 'Mr. Ramesh Tawde', password: 'password123', role: 'Staff', assignedCategory: 'Hostel' },
  { staffId: 'STF007', username: 'it_admin', name: 'Mr. Amit Patil', password: 'password123', role: 'Staff', assignedCategory: 'IT' },
  { staffId: 'STF008', username: 'electrical_head', name: 'Mr. Kishor More', password: 'password123', role: 'Staff', assignedCategory: 'Electricity' },
  { staffId: 'STF009', username: 'admin_officer', name: 'Mrs. Pallavi Joshi', password: 'password123', role: 'Staff', assignedCategory: 'Administration' },
  { staffId: 'STF010', username: 'mess_admin', name: 'Prof. Rajesh Kulkarni', password: 'password123', role: 'Staff', assignedCategory: 'Mess' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Staff.deleteMany({});
    console.log('[Seed] Cleared existing student and staff data');

    // Insert students
    await Student.insertMany(students);
    console.log(`[Seed] ✅ Inserted ${students.length} students`);

    // Insert staff
    await Staff.insertMany(staffMembers);
    console.log(`[Seed] ✅ Inserted ${staffMembers.length} staff members`);

    console.log('\n[Seed] 🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] ❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
