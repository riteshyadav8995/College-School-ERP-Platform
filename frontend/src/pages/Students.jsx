import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Users, Plus, Loader2, X, MoreVertical, GraduationCap, ArrowRightLeft, UserCheck, UserMinus, ShieldAlert } from 'lucide-react';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('Active'); // 'Active', 'Alumni', 'Transferred'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', password: '', rollNumber: '', department: '', program: '', year: '', gender: 'Male', hostel: '', room: '' });
  const [editFormData, setEditFormData] = useState({
    name: '', studentId: '', rollNumber: '', className: '', section: '', department: '', program: '', year: '', gender: '', hostel: '', room: ''
  });
  const [promoteData, setPromoteData] = useState({ className: '', section: '' });

  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const { user } = useSelector((state) => state.auth);
  
  const API_URL = `${import.meta.env.VITE_API_URL}/api/students`;
  const REGISTER_API_URL = `${import.meta.env.VITE_API_URL}/api/auth/register`;
  const DEPARTMENTS_API_URL = `${import.meta.env.VITE_API_URL}/api/departments`;

  useEffect(() => {
    fetchStudents();
    if (user.role === 'admin' || user.role === 'super_admin') {
      fetchDepartments();
      fetchPrograms();
    }
  }, []);

  const fetchPrograms = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/programs`, config);
      setPrograms(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(DEPARTMENTS_API_URL, config);
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(API_URL, config);
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.program) {
      fetchHostels(formData.program);
    } else {
      setHostels([]);
      setFormData(prev => ({ ...prev, hostel: '', room: '' }));
    }
  }, [formData.program]);

  useEffect(() => {
    if (formData.hostel) {
      fetchRooms(formData.hostel);
    } else {
      setRooms([]);
      setFormData(prev => ({ ...prev, room: '' }));
    }
  }, [formData.hostel]);

  const fetchHostels = async (programId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hostel/program/${programId}`, config);
      setHostels(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hostel/${hostelId}/rooms/available`, config);
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getYearOptions = (programId) => {
    const program = programs.find(p => p._id === programId);
    const duration = program?.durationYears || 1;
    const suffix = ["st", "nd", "rd"];
    const options = [];
    for (let i = 1; i <= duration; i++) {
      const v = i % 100;
      const s = suffix[(v - 1) % 10] || "th";
      options.push(`${i}${v === 11 || v === 12 || v === 13 ? "th" : s} Year`);
    }
    return options;
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditInputChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  const handlePromoteInputChange = (e) => setPromoteData({ ...promoteData, [e.target.name]: e.target.value });

  const instShort = user?.institution?.shortForm?.toLowerCase() || 'school';
  const domain = `${instShort}.ac.in`;
  const generatedEmail = formData.rollNumber && formData.name 
    ? `${formData.rollNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}_${formData.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@${domain}`
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const institutionId = user.institution?._id || user.institution;
      await axios.post(REGISTER_API_URL, { ...formData, email: generatedEmail, role: 'student', institution: institutionId });
      fetchStudents();
      setIsModalOpen(false);
      setFormData({ name: '', password: '', rollNumber: '', department: '', program: '', year: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { ...editFormData };
      if (!payload.endCourseDate) payload.endCourseDate = null;
      if (!payload.department) payload.department = null;
      if (!payload.program) payload.program = null;
      
      // Do not send hostel/room in edit payload since they are not in the form
      delete payload.hostel;
      delete payload.room;
      
      await axios.put(`${API_URL}/${selectedStudent._id}`, payload, config);
      fetchStudents();
      setIsEditModalOpen(false);
    } catch (error) {
      alert('Error updating student: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/${selectedStudent._id}`, promoteData, config);
      fetchStudents();
      setIsPromoteModalOpen(false);
    } catch (error) {
      alert('Error promoting student: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStudentStatus = async (student, status) => {
    if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/${student._id}`, { status }, config);
      fetchStudents();
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    }
  };

  const openProfile = (student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      name: student.user?.name || '',
      studentId: student.studentId || '',
      rollNumber: student.rollNumber || '',
      className: student.className || '',
      section: student.section || '',
      department: student.department?._id || student.department || '',
      program: student.program?._id || student.program || '',
      year: student.year || '',
      gender: student.gender || 'Male',
      endCourseDate: (() => {
        try {
          return student.endCourseDate ? new Date(student.endCourseDate).toISOString().split('T')[0] : '';
        } catch (e) {
          return '';
        }
      })()
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const openPromote = (student) => {
    setSelectedStudent(student);
    setPromoteData({ className: student.className || '', section: student.section || '' });
    setIsPromoteModalOpen(true);
    setActiveDropdown(null);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const filteredStudents = students.filter(s => {
    let status = s.status || 'Active';
    if (s.endCourseDate && new Date(s.endCourseDate) < new Date() && status === 'Active') {
      status = 'Alumni';
    }
    return status === activeTab;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
          <h2 className="text-xl font-bold text-slate-800">Student Lifecycle</h2>
        </div>
        {(user.role === 'super_admin' || user.role === 'admin') && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Enroll Student
          </button>
        )}
      </div>

      <div className="bg-white border-b border-slate-200 px-6 py-3 flex gap-2 overflow-x-auto">
        {['Active', 'Alumni', 'Transferred'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setActiveDropdown(null); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {tab === 'Active' && <UserCheck className="w-4 h-4" />}
            {tab === 'Alumni' && <GraduationCap className="w-4 h-4" />}
            {tab === 'Transferred' && <ArrowRightLeft className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="p-0 overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Class</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => {
              const isLastItems = index >= filteredStudents.length - 2 && filteredStudents.length >= 2;
              return (
              <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{student.studentId}</td>
                <td className="px-6 py-4 text-slate-600">{student.user?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-600">{student.className || '-'} {student.section || ''}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3 items-center relative">
                  <button onClick={() => openProfile(student)} className="text-primary hover:underline text-sm font-medium">View Profile</button>
                  
                  {(user.role === 'super_admin' || user.role === 'admin') && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === student._id ? null : student._id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === student._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                          <div className={`absolute right-0 ${isLastItems ? 'bottom-8 mb-1' : 'top-8 mt-1'} w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden text-left py-1 animate-in fade-in ${isLastItems ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} duration-200`}>
                            <button onClick={() => openEdit(student)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                              Edit Details
                            </button>
                            
                            {activeTab === 'Active' && (
                              <>
                                <button onClick={() => openPromote(student)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-emerald-500" /> Promote
                                </button>
                                <button onClick={() => updateStudentStatus(student, 'Transferred')} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Transfer Out
                                </button>
                                <button onClick={() => updateStudentStatus(student, 'Alumni')} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4 text-indigo-500" /> Mark Alumni
                                </button>
                              </>
                            )}

                            {activeTab !== 'Active' && (
                              <button onClick={() => updateStudentStatus(student, 'Active')} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-emerald-500" /> Restore to Active
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
              );
            })}
            {filteredStudents.length === 0 && <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No {activeTab.toLowerCase()} students found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* View Profile Modal */}
      {isProfileModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Student Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {selectedStudent.user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedStudent.user?.name || 'N/A'}</h4>
                  <p className="text-sm text-slate-500">Student ID: {selectedStudent.studentId}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold ${selectedStudent.status === 'Alumni' ? 'bg-indigo-100 text-indigo-700' : selectedStudent.status === 'Transferred' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</h5>
                    <p className="text-slate-800 font-medium">{selectedStudent.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Roll Number</h5>
                    <p className="text-slate-800 font-medium">{selectedStudent.rollNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</h5>
                    <p className="text-slate-800 font-medium">{selectedStudent.gender || 'Male'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Program</h5>
                    <p className="text-slate-800 font-medium">{selectedStudent.program?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</h5>
                    <p className="text-slate-800 font-medium">{selectedStudent.year || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">End Course Date</h5>
                    <p className="text-slate-800 font-medium">{selectedStudent.endCourseDate ? new Date(selectedStudent.endCourseDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsProfileModalOpen(false)} className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Enroll New Student</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Generated Email Address</label>
                <input readOnly type="email" value={generatedEmail} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 focus:outline-none cursor-not-allowed" placeholder="Auto-generated from Name and Roll No" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="For initial login" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <input required type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select required name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select required name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                  <select required name="program" value={formData.program} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <select required name="year" value={formData.year} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" disabled={!formData.program}>
                    <option value="">Select Year</option>
                    {getYearOptions(formData.program).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hostel (Optional)</label>
                  <select name="hostel" value={formData.hostel} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" disabled={!formData.program || hostels.length === 0}>
                    <option value="">Select Hostel</option>
                    {hostels.map(h => (
                      <option key={h._id} value={h._id}>{h.name} ({h.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room (Optional)</label>
                  <select name="room" value={formData.room} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" disabled={!formData.hostel || rooms.length === 0}>
                    <option value="">Select Room</option>
                    {rooms.map(r => (
                      <option key={r._id} value={r._id}>{r.roomNumber} ({r.capacity - r.occupied} beds available)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Edit Student Info</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                  <input required type="text" name="studentId" value={editFormData.studentId} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <input required type="text" name="rollNumber" value={editFormData.rollNumber} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select name="department" value={editFormData.department} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="">Select Department (Optional)</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select required name="gender" value={editFormData.gender} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                  <select name="program" value={editFormData.program} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                    <option value="">Select Program (Optional)</option>
                    {programs.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <select name="year" value={editFormData.year} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" disabled={!editFormData.program}>
                    <option value="">Select Year (Optional)</option>
                    {getYearOptions(editFormData.program).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Course Date (Optional)</label>
                <input type="date" name="endCourseDate" value={editFormData.endCourseDate} onChange={handleEditInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote Student Modal */}
      {isPromoteModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-500" /> Promote Student</h3>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePromoteSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 text-center">
                <p className="text-slate-500 text-sm">Promoting</p>
                <p className="font-bold text-slate-800 text-lg">{selectedStudent.user?.name}</p>
                <p className="text-slate-500 text-sm mt-1">From: <span className="font-semibold text-slate-700">{selectedStudent.className || 'N/A'} {selectedStudent.section || ''}</span></p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Class</label>
                <input required type="text" name="className" value={promoteData.className} onChange={handlePromoteInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="e.g. 11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Section</label>
                <input type="text" name="section" value={promoteData.section} onChange={handlePromoteInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="e.g. A" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsPromoteModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
