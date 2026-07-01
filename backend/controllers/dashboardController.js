const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Book = require('../models/Book');
const Fee = require('../models/Fee');
const Timetable = require('../models/Timetable');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    let stats = {};

    if (role === 'super_admin') {
      const Institution = require('../models/Institution');
      const Billing = require('../models/Billing');
      const Student = require('../models/Student');
      const Teacher = require('../models/Teacher');
      const User = require('../models/User');
      const SupportTicket = require('../models/SupportTicket');
      const mongoose = require('mongoose');
      
      const totalInstitutions = await Institution.countDocuments();
      const activeInstitutions = await Institution.countDocuments({ status: 'Active' });
      const inactiveInstitutions = await Institution.countDocuments({ status: 'Inactive' });
      const suspendedInstitutions = await Institution.countDocuments({ status: 'Suspended' });
      
      const totalStudents = await Student.countDocuments();
      const totalTeachers = await Teacher.countDocuments();
      
      const billings = await Billing.find({ status: 'Paid' });
      const totalRevenue = billings.reduce((acc, b) => acc + b.amount, 0);
      
      // Calculate monthly revenue (this month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = billings.filter(b => b.paymentDate >= startOfMonth).reduce((acc, b) => acc + b.amount, 0);

      // Pending Support Tickets
      const pendingSupportTickets = await SupportTicket.countDocuments({ status: 'Pending' });

      // Storage Used (DB size proxy)
      const dbStats = await mongoose.connection.db.stats();
      const storageUsed = Math.round(dbStats.dataSize / (1024 * 1024)) + ' MB';

      // Active Users Today
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const activeUsersToday = await User.countDocuments({ lastLogin: { $gte: startOfDay } });

      // Expiring Subscriptions (next 30 days)
      const thirtyDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
      const expiringSubscriptions = await Institution.countDocuments({
        subscriptionEndDate: { $gte: now, $lte: thirtyDaysFromNow }
      });

      // Revenue Trend Data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueTrendData = months.map(m => ({ name: m, revenue: 0 }));
      const currentYear = now.getFullYear();
      
      billings.forEach(b => {
        if (b.paymentDate.getFullYear() === currentYear) {
          const m = b.paymentDate.getMonth();
          revenueTrendData[m].revenue += b.amount;
        }
      });

      // Platform Growth Data (Institutions)
      const institutions = await Institution.find().select('createdAt');
      const growthMap = {};
      institutions.forEach(inst => {
        const y = inst.createdAt.getFullYear();
        growthMap[y] = (growthMap[y] || 0) + 1;
      });
      const platformGrowthData = Object.keys(growthMap).sort().map(y => ({
        name: y,
        students: growthMap[y] // Reusing the key name from UI chart to keep UI intact
      }));

      stats = {
        totalInstitutions,
        activeInstitutions,
        inactiveInstitutions,
        suspendedInstitutions,
        totalStudents,
        totalTeachers,
        totalRevenue,
        monthlyRevenue,
        pendingSupportTickets,
        storageUsed,
        activeUsersToday,
        expiringSubscriptions,
        revenueTrendData,
        platformGrowthData,
        role: 'super_admin'
      };
    } else if (role === 'admin' || role === 'accountant') {
      // Must scope to institution!
      const institutionId = req.user.institution;
      const Department = require('../models/Department');
      const Course = require('../models/Course');
      const TeacherLeave = require('../models/TeacherLeave');
      const BookIssue = require('../models/BookIssue');
      
      const totalStudents = await Student.countDocuments({ institution: institutionId });
      const totalTeachers = await Teacher.countDocuments({ institution: institutionId });
      const totalBooks = await Book.countDocuments({ institution: institutionId });
      
      const fees = await Fee.find({ institution: institutionId });
      const totalCollected = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
      const totalPending = fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);

      const totalDepartments = await Department.countDocuments({ institution: institutionId });
      const totalCourses = await Course.countDocuments({ institution: institutionId });
      const pendingLeave = await TeacherLeave.countDocuments({ institution: institutionId, status: 'Pending' });
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      const todayClassesCount = await Timetable.countDocuments({ institution: institutionId, dayOfWeek: today });
      
      const booksIssued = await BookIssue.countDocuments({ institution: institutionId, status: 'Issued' });

      // Student Growth Data
      const students = await Student.find({ institution: institutionId }).select('createdAt');
      const studentGrowthMap = {};
      students.forEach(s => {
        if (s.createdAt) {
          const y = s.createdAt.getFullYear();
          studentGrowthMap[y] = (studentGrowthMap[y] || 0) + 1;
        }
      });
      const studentGrowthData = Object.keys(studentGrowthMap).sort().map(y => ({
        name: y,
        students: studentGrowthMap[y]
      }));

      // Attendance Trend Data (Last 5 Days)
      const attendanceTrendData = [];
      const now = new Date();
      for (let i = 4; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayStr = days[d.getDay()].substring(0, 3); // 'Mon', 'Tue'
        
        // Count attendance for this day
        const dayStart = new Date(d.setHours(0,0,0,0));
        const dayEnd = new Date(d.setHours(23,59,59,999));
        
        const attRecords = await Attendance.find({
          institution: institutionId,
          date: { $gte: dayStart, $lte: dayEnd }
        });
        
        let totalPresent = 0;
        let totalRecords = 0;
        attRecords.forEach(att => {
          att.records.forEach(r => {
            totalRecords++;
            if (r.status === 'Present') totalPresent++;
          });
        });
        
        const attPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
        attendanceTrendData.push({ name: dayStr, attendance: attPercentage });
      }

      // Recent Activities
      // Fetch 5 recent students
      const recentStudents = await Student.find({ institution: institutionId })
        .sort('-createdAt').limit(2).populate('user', 'name');
      const recentLeaves = await TeacherLeave.find({ institution: institutionId })
        .sort('-createdAt').limit(2).populate('teacher');
      const recentIssues = await BookIssue.find({ institution: institutionId })
        .sort('-issueDate').limit(2).populate('book');
        
      let recentActivities = [];
      recentStudents.forEach(s => {
        recentActivities.push({
          type: 'admission',
          text: `New admission: ${s.user?.name || 'Student'} enrolled.`,
          date: s.createdAt,
          time: new Date(s.createdAt).toLocaleTimeString()
        });
      });
      recentLeaves.forEach(l => {
        recentActivities.push({
          type: 'leave',
          text: `Faculty leave request: from ${l.teacher?.user?.name || 'Teacher'}.`,
          date: l.createdAt,
          time: new Date(l.createdAt).toLocaleTimeString()
        });
      });
      recentIssues.forEach(b => {
        recentActivities.push({
          type: 'library',
          text: `Library transaction: ${b.book?.title || 'A book'} issued.`,
          date: b.issueDate,
          time: new Date(b.issueDate).toLocaleTimeString()
        });
      });
      recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      recentActivities = recentActivities.slice(0, 5);

      stats = {
        totalStudents,
        totalTeachers,
        totalBooks,
        fees: { totalCollected, totalPending },
        totalDepartments,
        totalCourses,
        pendingLeave,
        todayClassesCount,
        booksIssued,
        studentGrowthData,
        attendanceTrendData,
        recentActivities,
        role: 'admin'
      };
    } else if (role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ user: req.user.id });
      if (!teacherProfile) return res.status(404).json({ message: 'Teacher profile not found' });

      // Today's classes
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      const todayClasses = await Timetable.find({ teacher: teacherProfile._id, dayOfWeek: today }).sort('startTime');
      
      const totalAssignments = await Assignment.countDocuments({ teacher: teacherProfile._id });

      stats = {
        todayClassesCount: todayClasses.length,
        todayClasses,
        totalAssignments,
        nextClass: todayClasses.length > 0 ? todayClasses[0] : null,
        role: 'teacher'
      };
    } else if (role === 'student') {
      let studentProfile = await Student.findOne({ user: req.user.id });
      if (!studentProfile) {
        studentProfile = await Student.create({
          user: req.user.id,
          studentId: `SID${Date.now().toString().slice(-5)}`,
          rollNumber: `STU${Date.now().toString().slice(-5)}`,
          className: '10',
          section: 'A'
        });
      }

      // Fees
      const fees = await Fee.find({ student: studentProfile._id });
      const pendingFeesAmount = fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);

      // Today's classes
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      const todayClasses = await Timetable.find({ className: studentProfile.className, section: studentProfile.section, dayOfWeek: today }).sort('startTime');

      // Unsubmitted assignments
      // First find all assignments for this student's courses
      let courseIds = [];
      if (studentProfile.program && studentProfile.year) {
        const Semester = require('../models/Semester');
        const Course = require('../models/Course');
        
        let semesterNumbers = [];
        if(studentProfile.year === '1st Year') semesterNumbers = [1,2];
        else if(studentProfile.year === '2nd Year') semesterNumbers = [3,4];
        else if(studentProfile.year === '3rd Year') semesterNumbers = [5,6];
        else if(studentProfile.year === '4th Year') semesterNumbers = [7,8];
        else if(studentProfile.year === '5th Year') semesterNumbers = [9,10];
        
        const semesters = await Semester.find({ programId: studentProfile.program, semesterNumber: { $in: semesterNumbers } });
        const courses = await Course.find({ semesterId: { $in: semesters.map(s => s._id) } });
        courseIds = courses.map(c => c._id);
      }
      
      const classAssignments = await Assignment.find({ course: { $in: courseIds } });
      // Then find submissions by this student
      const submissions = await Submission.find({ student: studentProfile._id });
      const submittedAssignmentIds = submissions.map(s => s.assignment.toString());
      
      let unsubmittedCount = 0;
      classAssignments.forEach(a => {
        if (!submittedAssignmentIds.includes(a._id.toString())) {
          unsubmittedCount++;
        }
      });

      // Attendance percentage for current month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      
      const attendanceRecords = await Attendance.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
        studentId: studentProfile._id
      });

      let presentCount = 0;
      let totalDays = attendanceRecords.length;
      
      attendanceRecords.forEach(record => {
        if (record.status === 'Present') {
          presentCount++;
        }
      });
      
      const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

      stats = {
        pendingFeesAmount,
        todayClassesCount: todayClasses.length,
        unsubmittedCount,
        attendancePercentage,
        nextClass: todayClasses.length > 0 ? todayClasses[0] : null,
        role: 'student'
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
