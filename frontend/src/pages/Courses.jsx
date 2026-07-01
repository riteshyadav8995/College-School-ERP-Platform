import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Book, Plus, Loader2, Edit, Trash2, Users, UserPlus } from 'lucide-react';

function Courses() {
  const [data, setData] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    departmentId: '', 
    programId: '', 
    semesterId: '', 
    academicYear: '2026-27',
    courseCode: '', 
    courseName: '', 
    credits: '', 
    teacherId: '' 
  });
  
  // Modals
  const [isAssignFacultyOpen, setIsAssignFacultyOpen] = useState(false);
  const [isRegisterStudentOpen, setIsRegisterStudentOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [mappingData, setMappingData] = useState({ academicYear: '2026-27', semester: '', entityId: '', studentIds: [] });

  const { user } = useSelector((state) => state.auth);
  const API_URL = `${import.meta.env.VITE_API_URL}/api/courses`;
  const MAP_API = `${import.meta.env.VITE_API_URL}/api/course-mapping`;

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(API_URL, config);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [semRes, teachRes, deptRes, stuRes, progRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/semesters`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/teachers`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/departments`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/students`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/programs`, config)
      ]);
      setSemesters(semRes.data);
      setTeachers(teachRes.data);
      setDepartments(deptRes.data);
      setStudents(stuRes.data);
      setPrograms(progRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleMappingChange = (e) => setMappingData({ ...mappingData, [e.target.name]: e.target.value });
  
  const handleMultiSelectChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected && options[i].value !== '') {
        selectedValues.push(options[i].value);
      }
    }
    setMappingData({ ...mappingData, studentIds: selectedValues });
  };

  const filteredTeachers = selectedDept ? teachers.filter(t => t.department?._id === selectedDept) : teachers;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(API_URL, formData, config);
      
      // Auto-assign faculty if selected
      if (formData.teacherId) {
        await axios.post(`${MAP_API}/faculty`, {
          facultyId: formData.teacherId,
          courseId: res.data._id,
          academicYear: '2026-27',
          semester: 1
        }, config);
      }
      
      fetchData();
      setFormData({ departmentId: '', programId: '', semesterId: '', academicYear: '2026-27', courseCode: '', courseName: '', credits: '', teacherId: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const courseSemesterNum = selectedCourse.semesterId?.semesterNumber || semesters.find(s => s._id === (selectedCourse.semesterId?._id || selectedCourse.semesterId))?.semesterNumber || 1;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${MAP_API}/faculty`, {
        facultyId: mappingData.entityId,
        courseId: selectedCourse._id,
        academicYear: mappingData.academicYear,
        semester: courseSemesterNum
      }, config);
      alert('Faculty Assigned Successfully');
      setIsAssignFacultyOpen(false);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!mappingData.studentIds || mappingData.studentIds.length === 0) {
        return alert("Please select at least one student");
    }
    setSubmitting(true);
    try {
      const courseSemesterNum = selectedCourse.semesterId?.semesterNumber || semesters.find(s => s._id === (selectedCourse.semesterId?._id || selectedCourse.semesterId))?.semesterNumber || 1;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(`${MAP_API}/student`, {
        studentIds: mappingData.studentIds,
        courseId: selectedCourse._id,
        academicYear: mappingData.academicYear,
        semester: courseSemesterNum
      }, config);
      alert(response.data.message || 'Students Registered Successfully');
      setIsRegisterStudentOpen(false);
      setMappingData({...mappingData, studentIds: []});
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      fetchData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Book className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Courses & Mapping</h1>
            <p className="text-sm text-slate-500">Manage courses and assign faculty or students.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 col-span-1 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Add New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Department</label>
              <select name="departmentId" required value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value, programId: '', semesterId: '', teacherId: ''})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Program</label>
              <select name="programId" required value={formData.programId} disabled={!formData.departmentId} onChange={(e) => setFormData({...formData, programId: e.target.value, semesterId: ''})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">Select Program</option>
                {programs.filter(p => p.departmentId?._id === formData.departmentId || p.departmentId === formData.departmentId).map(prog => (
                  <option key={prog._id} value={prog._id}>{prog.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Semester</label>
              <select name="semesterId" required value={formData.semesterId} disabled={!formData.programId} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">Select Semester</option>
                {semesters.filter(s => s.programId?._id === formData.programId || s.programId === formData.programId).map(sem => (
                  <option key={sem._id} value={sem._id}>Semester {sem.semesterNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Teacher (Optional)</label>
              <select name="teacherId" value={formData.teacherId} disabled={!formData.departmentId} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">Select Teacher</option>
                {teachers.filter(t => t.department?._id === formData.departmentId || t.department === formData.departmentId).map(t => (
                  <option key={t._id} value={t._id}>{t.user?.name} ({t.employeeId})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Course Code</label>
                <input type="text" name="courseCode" required value={formData.courseCode} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Credits</label>
                <input type="number" name="credits" required value={formData.credits} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Course Name</label>
              <input type="text" name="courseName" required value={formData.courseName} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Academic Year</label>
              <input type="text" name="academicYear" required value={formData.academicYear} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. 2026-27" />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all flex justify-center items-center">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Course'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-0 col-span-1 lg:col-span-2 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold capitalize">Code</th>
                  <th className="p-4 font-semibold capitalize">Name</th>
                  <th className="p-4 font-semibold capitalize">Dept.</th>
                  <th className="p-4 font-semibold capitalize">Sem/Year</th>
                  <th className="p-4 font-semibold capitalize">Teacher</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-700 font-medium">{item.courseCode}</td>
                      <td className="p-4 text-slate-700 font-medium">{item.courseName}</td>
                      <td className="p-4 text-slate-700 font-medium">
                        {item.departmentId?.name || item.semesterId?.programId?.departmentId?.name || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        Sem {item.semesterId?.semesterNumber || semesters.find(s => s._id === (item.semesterId?._id || item.semesterId))?.semesterNumber || 'N/A'} <br/>
                        <span className="text-xs text-slate-400">{item.academicYear || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {item.teacherId?.user?.name || 'Unassigned'}
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                        <button onClick={() => { setSelectedCourse(item); setIsAssignFacultyOpen(true); }} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">Assign Faculty</button>
                        <button onClick={() => { setSelectedCourse(item); setIsRegisterStudentOpen(true); }} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors">Register Student</button>
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Faculty Modal */}
      {isAssignFacultyOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Assign Faculty</h3>
              <button onClick={() => setIsAssignFacultyOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAssignFaculty} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-4">Assigning teacher to <span className="font-bold text-slate-800">{selectedCourse.courseName}</span></p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Teacher</label>
                <select name="entityId" required value={mappingData.entityId} onChange={handleMappingChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="">Choose...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.user?.name} ({t.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Academic Year</label>
                  <input type="text" name="academicYear" required value={mappingData.academicYear} onChange={handleMappingChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all">
                {submitting ? 'Assigning...' : 'Assign Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      {isRegisterStudentOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Register Student</h3>
              <button onClick={() => setIsRegisterStudentOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleRegisterStudent} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-4">Registering student for <span className="font-bold text-slate-800">{selectedCourse.courseName}</span></p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Student(s)</label>
                <select multiple name="studentIds" required value={mappingData.studentIds} onChange={handleMultiSelectChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all min-h-[150px] custom-scrollbar">
                  {students.map(s => <option key={s._id} value={s._id} className="p-2 hover:bg-slate-100 rounded cursor-pointer">{s.user?.name} ({s.rollNumber || s.studentId})</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple students.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Academic Year</label>
                  <input type="text" name="academicYear" required value={mappingData.academicYear} onChange={handleMappingChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all">
                {submitting ? 'Registering...' : 'Register Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
