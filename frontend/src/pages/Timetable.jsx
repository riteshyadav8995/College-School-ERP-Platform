import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Calendar as CalendarIcon, Plus, Loader2, X } from 'lucide-react';

function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(daysOfWeek.includes(todayName) ? todayName : 'Monday');

  const getDateForDay = (dayName) => {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday
    const targetDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName);
    const diff = targetDayIndex - currentDayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const [formData, setFormData] = useState({
    dayOfWeek: selectedDay, startTime: '', endTime: '', subject: '', course: '', className: '', section: '', teacher: '', room: ''
  });

  const { user } = useSelector((state) => state.auth);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/timetable`;
  const TEACHERS_API_URL = `${import.meta.env.VITE_API_URL}/api/teachers`;

  useEffect(() => {
    fetchTimetable();
    if (user.role === 'admin' || user.role === 'super_admin') {
      fetchTeachers();
      fetchDepartments();
      fetchCourses();
    }
  }, []);

  const fetchTimetable = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(API_URL, config);
      setTimetable(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(TEACHERS_API_URL, config);
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/departments`, config);
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, config);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  // Filter courses based on selected department
  const filteredCourses = selectedDeptId
    ? courses.filter(c => c.semesterId?.programId?.departmentId?._id === selectedDeptId || c.semesterId?.programId?.departmentId === selectedDeptId)
    : [];

  const handleDeptChange = (e) => {
    setSelectedDeptId(e.target.value);
    setSelectedCourseId('');
    setFormData({ ...formData, subject: '', teacher: '' });
  };

  const handleCourseChange = (e) => {
    const cId = e.target.value;
    setSelectedCourseId(cId);
    const courseObj = courses.find(c => c._id === cId);
    
    // Auto-select the mapped teacher and subject name
    const teacherId = courseObj?.teacherId?._id || courseObj?.teacherId || '';
    
    const semesterNum = courseObj?.semesterId?.semesterNumber || '';
    const programName = courseObj?.semesterId?.programId?.name || '';
    const classNameStr = semesterNum ? `Semester ${semesterNum} - ${programName}`.trim() : '';

    setFormData({ 
      ...formData, 
      subject: courseObj?.courseName || '', 
      course: courseObj?._id || '',
      teacher: teacherId,
      className: classNameStr,
      section: ''
    });
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(API_URL, formData, config);
      setTimetable([...timetable, response.data]);
      setIsModalOpen(false);
      setFormData({ dayOfWeek: 'Monday', startTime: '', endTime: '', subject: '', course: '', className: '', section: '', teacher: '', room: '' });
      setSelectedDeptId('');
      setSelectedCourseId('');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg"><CalendarIcon className="w-5 h-5 text-primary" /></div>
          <h2 className="text-xl font-bold text-slate-800">Class Timetable</h2>
        </div>
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Schedule Class
          </button>
        )}
      </div>

      <div className="bg-white border-b border-slate-200 px-6 py-3 flex gap-2 overflow-x-auto">
        {daysOfWeek.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${selectedDay === day ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex flex-col items-center">
              <span>{day}</span>
              <span className={`text-xs ${selectedDay === day ? 'text-primary-100' : 'text-slate-400'}`}>{getDateForDay(day)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Time</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Subject</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Class</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Teacher</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Room</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = timetable.filter(entry => entry.dayOfWeek === selectedDay);
              
              if (filtered.length === 0) {
                return <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No classes scheduled for {selectedDay}.</td></tr>;
              }

              // Sort by start time
              filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

              let upcoming = [];
              let past = [];

              const targetDayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(selectedDay);
              const currentDayIndex = new Date().getDay();
              const diff = targetDayIndex - currentDayIndex;

              if (diff < 0) {
                past = filtered;
              } else if (diff > 0) {
                upcoming = filtered;
              } else {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                filtered.forEach(entry => {
                  const [endHour, endMin] = entry.endTime.split(':').map(Number);
                  const endTotal = endHour * 60 + endMin;
                  
                  if (endTotal >= currentMinutes) {
                    upcoming.push(entry);
                  } else {
                    past.push(entry);
                  }
                });
              }

              const renderRow = (entry, isPast) => (
                <tr key={entry._id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${isPast ? 'bg-slate-50/50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 text-slate-600 font-medium">{entry.startTime} - {entry.endTime}</td>
                  <td className="px-6 py-4 text-slate-800 font-bold">{entry.subject}</td>
                  <td className="px-6 py-4 text-slate-600">{entry.className}</td>
                  <td className="px-6 py-4 text-slate-600">{entry.teacher?.user?.name || 'Assigned Teacher'}</td>
                  <td className="px-6 py-4 text-slate-600">{entry.room || 'TBA'}</td>
                  <td className="px-6 py-4">
                    {isPast ? (
                      <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">Past Class</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Upcoming</span>
                    )}
                  </td>
                </tr>
              );

              return (
                <>
                  {upcoming.map(entry => renderRow(entry, false))}
                  {past.map(entry => renderRow(entry, true))}
                </>
              );
            })()}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Schedule New Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select required value={selectedDeptId} onChange={handleDeptChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="" disabled>Select Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course (Subject)</label>
                  <select required value={selectedCourseId} onChange={handleCourseChange} disabled={!selectedDeptId} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400">
                    <option value="" disabled>Select Course</option>
                    {filteredCourses.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.courseName} (Sem {c.semesterId?.semesterNumber || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                  <select required name="teacher" value={formData.teacher} onChange={handleInputChange} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none bg-slate-50 text-slate-500 cursor-not-allowed">
                    <option value="" disabled>Mapped to course</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.user?.name || t.employeeId}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Teacher is automatically assigned based on the selected course.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class / Semester</label>
                  <input required type="text" name="className" value={formData.className} onChange={handleInputChange} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none bg-slate-50 text-slate-500 cursor-not-allowed" placeholder="Auto-filled based on course" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                  <select required name="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input required type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input required type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                  <input type="text" name="room" value={formData.room} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. 101" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Timetable;
