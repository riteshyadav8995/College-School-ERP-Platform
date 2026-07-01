import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Departments from './pages/Departments';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Fees from './pages/Fees';
import Library from './pages/Library';
import AIAssistant from './pages/AIAssistant';
import Marks from './pages/Marks';
import ProfileWrapper from './pages/ProfileWrapper';
import StudentCourses from './pages/StudentCourses';

import Institutions from './pages/Institutions';


import Hostel from './pages/Hostel';
import StudentHostel from './pages/StudentHostel';
import Scholarships from './pages/Scholarships';
import Payroll from './pages/Payroll';
import Inventory from './pages/Inventory';
import Placement from './pages/Placement';
import Settings from './pages/Settings';
import FacultyLeave from './pages/FacultyLeave';
import Workload from './pages/Workload';
import Reports from './pages/Reports';
import Subscriptions from './pages/Subscriptions';

import Programs from './pages/Programs';
import Courses from './pages/Courses';
import Semester from './pages/Semester';

// Global Axios Interceptor to handle 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data.message === 'User no longer exists' || error.response.data.message === 'Not authorized') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="profile" element={<ProfileWrapper />} />
            <Route path="my-courses" element={<StudentCourses />} />
            <Route path="departments" element={<Departments />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="marks" element={<Marks />} />
            <Route path="fees" element={<Fees />} />
            <Route path="library" element={<Library />} />
            <Route path="ai" element={<AIAssistant />} />
            

            <Route path="hostel" element={<Hostel />} />
            <Route path="student-hostel" element={<StudentHostel />} />
            <Route path="scholarships" element={<Scholarships />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="placement" element={<Placement />} />
            <Route path="faculty-leave" element={<FacultyLeave />} />
            <Route path="workload" element={<Workload />} />
            <Route path="reports" element={<Reports />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="settings" element={<Settings />} />

            <Route path="programs" element={<Programs />} />
            <Route path="courses" element={<Courses />} />
            <Route path="semester" element={<Semester />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
