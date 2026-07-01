import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BookOpen, CheckCircle, PlusCircle, Loader2 } from 'lucide-react';

export default function StudentCourses() {
  const { user } = useSelector((state) => state.auth);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null); // courseId

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Fetch available courses
      const availRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/available`, config);
      
      // Fetch my courses
      const myRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-mapping/student/me`, config);

      setAvailableCourses(availRes.data);
      setMyCourses(myRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (course) => {
    setEnrolling(course._id);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/course-mapping/enroll`, {
        courseId: course._id,
        academicYear: course.academicYear || '2026-27'
      }, config);
      
      // Refresh
      fetchData();
      alert('Successfully enrolled in ' + course.courseName);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  // Filter out available courses that the user is already enrolled in
  const myCourseIds = myCourses.map(c => c._id);
  const unenrollAvailable = availableCourses.filter(c => !myCourseIds.includes(c._id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
        <p className="text-slate-500">Browse and enroll in available courses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Available Courses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Available Courses</h3>
          </div>

          <div className="space-y-4">
            {unenrollAvailable.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No new courses available to enroll.</p>
            ) : (
              unenrollAvailable.map(course => (
                <div key={course._id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{course.courseCode}</span>
                      <span className="text-xs font-medium text-slate-500">{course.academicYear || '2026-27'}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800">{course.courseName}</h4>
                    <p className="text-sm text-slate-500 mt-1">Credits: {course.credits} • Teacher: {course.teacherId?.user?.name || 'Unassigned'}</p>
                  </div>
                  <button 
                    onClick={() => handleEnroll(course)}
                    disabled={enrolling === course._id}
                    className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {enrolling === course._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enroll Now'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Enrolled Courses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Enrolled Courses</h3>
          </div>

          <div className="space-y-4">
            {myCourses.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">You have not enrolled in any courses yet.</p>
            ) : (
              myCourses.map(course => (
                <div key={course._id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{course.courseCode}</span>
                      <span className="text-xs font-medium text-slate-500">{course.academicYear || '2026-27'}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800">{course.courseName}</h4>
                    <p className="text-sm text-slate-500 mt-1">Credits: {course.credits} • Teacher: {course.teacherId?.user?.name || 'Unassigned'}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-medium">Enrolled</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
