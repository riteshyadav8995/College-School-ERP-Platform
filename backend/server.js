require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/teacher-leaves', require('./routes/teacherLeaveRoutes'));
app.use('/api/teacher-attendance', require('./routes/teacherAttendanceRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/course-mapping', require('./routes/courseMappingRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/book-issues', require('./routes/bookIssueRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/marks', require('./routes/markRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// New Modules

app.use('/api/hostel', require('./routes/hostelRoutes'));
app.use('/api/scholarships', require('./routes/scholarshipRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/placement', require('./routes/placementRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));

// Academic Modules
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/semesters', require('./routes/semesterRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
