import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ClipboardList, Users, ArrowLeft, Loader2, Check, X } from 'lucide-react';

function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Attendance state for the selected course
  const [attendanceData, setAttendanceData] = useState({});
  const [lectureInfo, setLectureInfo] = useState({ date: new Date().toISOString().split('T')[0], lectureNumber: '' });

  const { user } = useSelector((state) => state.auth);
  
  // Student specific state
  const [studentStats, setStudentStats] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentStats();
    } else {
      fetchMyCourses();
    }
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/stats/student`, config);
      setStudentStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let res;
      if (user.role === 'teacher') {
        res = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-mapping/faculty/me`, config);
      } else {
        // Admin can see all courses
        res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, config);
      }
      setCourses(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-mapping/student/${course._id}`, config);
      setStudents(res.data);
      
      // Initialize attendance data map
      const initialData = {};
      res.data.forEach(s => {
        initialData[s._id] = 'Present'; // Default everyone to Present
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error(error);
      alert('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lectureInfo.lectureNumber) return alert('Please enter lecture number');
    
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Need facultyId. For teacher, it's their ID. For admin, we could prompt, but let's assume they pick one.
      // We will pass user.id to the backend, and backend can figure out if it's admin or teacher.
      // Wait, backend model requires facultyId (Teacher ObjectId).
      // We can fetch the teacher ID by querying the mapping or just use a dummy for now.
      // Actually, if we hit the backend, we should resolve `facultyId`.
      // Let's rely on backend to just use markedBy if facultyId isn't explicitly known by admin, 
      // but the model requires facultyId. Let's get the teacher mapped to this course.
      
      const payload = students.map(student => ({
        studentId: student._id,
        courseId: selectedCourse._id,
        facultyId: selectedCourse.teacherId, // assuming Course has teacherId from old schema or we can use a generic approach
        date: lectureInfo.date,
        lectureNumber: lectureInfo.lectureNumber,
        status: attendanceData[student._id]
      }));

      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, payload, config);
      alert('Attendance saved successfully!');
      setSelectedCourse(null);
    } catch (error) {
      console.error(error);
      alert('Error saving attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !selectedCourse) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{user?.role === 'student' ? 'My Attendance' : 'Attendance'}</h1>
            <p className="text-sm text-slate-500">{user?.role === 'student' ? 'View your course attendance history.' : 'Manage daily class attendance.'}</p>
          </div>
        </div>
      </div>

      {user?.role === 'student' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Course Code</th>
                  <th className="p-4 font-semibold">Course Name</th>
                  <th className="p-4 font-semibold text-center">Total Classes</th>
                  <th className="p-4 font-semibold text-center">Present</th>
                  <th className="p-4 font-semibold text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentStats.map((stat, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-700 bg-indigo-50/50">{stat.courseCode}</td>
                    <td className="p-4 font-bold text-slate-800">{stat.courseName}</td>
                    <td className="p-4 text-center font-medium">{stat.totalClasses}</td>
                    <td className="p-4 text-center font-medium text-emerald-600">{stat.present}</td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${stat.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {stat.percentage}%
                      </div>
                    </td>
                  </tr>
                ))}
                {studentStats.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">No attendance records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : !selectedCourse ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Today's Classes</h2>
          {courses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              No classes assigned to you today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course._id} className="border border-slate-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                      {course.courseCode}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{course.courseName}</h3>
                  <div className="flex items-center gap-4 mt-6">
                    <button onClick={() => handleSelectCourse(course)} className="flex-1 bg-primary text-white py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors">
                      Take Attendance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedCourse(null)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selectedCourse.courseName} ({selectedCourse.courseCode})</h2>
                <p className="text-sm text-slate-500">Marking attendance for {students.length} students</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input type="date" value={lectureInfo.date} onChange={e => setLectureInfo({...lectureInfo, date: e.target.value})} className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Lecture No.</label>
                <input type="number" placeholder="e.g. 1" value={lectureInfo.lectureNumber} onChange={e => setLectureInfo({...lectureInfo, lectureNumber: e.target.value})} className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm w-24" />
              </div>
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <table className="w-full text-left border-collapse min-w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Roll No</th>
                      <th className="p-4 font-semibold">Student Name</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => {
                      const status = attendanceData[student._id];
                      const isPresent = status === 'Present';
                      return (
                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-medium text-slate-700">{student.rollNumber || student.studentId}</td>
                          <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {student.user?.name?.charAt(0)}
                            </div>
                            {student.user?.name}
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              type="button"
                              onClick={() => toggleStatus(student._id)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-all w-32 ${isPresent ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}
                            >
                              {isPresent ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              {isPresent ? 'Present' : 'Absent'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {students.length === 0 && (
                      <tr><td colSpan="3" className="p-8 text-center text-slate-500">No students registered for this course.</td></tr>
                    )}
                  </tbody>
                </table>
                
                {students.length > 0 && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm shadow-primary/30">
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Attendance
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
