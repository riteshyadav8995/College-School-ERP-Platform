import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BookOpen, Plus, Loader2, X, MoreVertical, Edit, Shield, Briefcase } from 'lucide-react';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Edit Modals
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false);
  const [isHREditOpen, setIsHREditOpen] = useState(false);
  
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
  
  const [adminFormData, setAdminFormData] = useState({ employeeId: '', department: '', assignedSubjects: '', assignedClasses: '' });
  const [hrFormData, setHrFormData] = useState({ salary: '', experience: '', qualification: '', joiningDate: '', pfNumber: '', accountNumber: '', ifscCode: '', bankName: '' });

  const { user } = useSelector((state) => state.auth);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/teachers`;
  const REGISTER_API_URL = `${import.meta.env.VITE_API_URL}/api/auth/register`;
  const DEPARTMENTS_API_URL = `${import.meta.env.VITE_API_URL}/api/departments`;

  useEffect(() => {
    fetchTeachers();
    if (user.role === 'admin' || user.role === 'super_admin') {
      fetchDepartments();
    }
  }, [user.role]);

  const fetchDepartments = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(DEPARTMENTS_API_URL, config);
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(API_URL, config);
      setTeachers(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAdminInputChange = (e) => setAdminFormData({ ...adminFormData, [e.target.name]: e.target.value });
  const handleHrInputChange = (e) => setHrFormData({ ...hrFormData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const institutionId = user.institution?._id || user.institution;
      await axios.post(REGISTER_API_URL, { ...formData, role: 'teacher', institution: institutionId });
      fetchTeachers();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', department: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        employeeId: adminFormData.employeeId,
        department: adminFormData.department,
        assignedSubjects: adminFormData.assignedSubjects.split(',').map(s => s.trim()),
        assignedClasses: adminFormData.assignedClasses.split(',').map(s => s.trim())
      };
      await axios.put(`${API_URL}/${selectedTeacher._id}`, payload, config);
      fetchTeachers();
      setIsAdminEditOpen(false);
    } catch (error) {
      alert('Error updating: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleHrEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        salary: hrFormData.salary,
        experience: hrFormData.experience,
        qualification: hrFormData.qualification,
        joiningDate: hrFormData.joiningDate,
        pfNumber: hrFormData.pfNumber,
        bankDetails: {
          accountNumber: hrFormData.accountNumber,
          ifscCode: hrFormData.ifscCode,
          bankName: hrFormData.bankName
        }
      };
      await axios.put(`${API_URL}/${selectedTeacher._id}`, payload, config);
      fetchTeachers();
      setIsHREditOpen(false);
    } catch (error) {
      alert('Error updating: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setIsProfileModalOpen(true);
    setActiveDropdown(null);
  };

  const openAdminEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setAdminFormData({
      employeeId: teacher.employeeId || '',
      department: teacher.department?._id || teacher.department || '',
      assignedSubjects: teacher.assignedSubjects ? teacher.assignedSubjects.join(', ') : '',
      assignedClasses: teacher.assignedClasses ? teacher.assignedClasses.join(', ') : ''
    });
    setIsAdminEditOpen(true);
    setActiveDropdown(null);
  };

  const openHrEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setHrFormData({
      salary: teacher.salary || '',
      experience: teacher.experience || '',
      qualification: teacher.qualification || '',
      joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : '',
      pfNumber: teacher.pfNumber || '',
      accountNumber: teacher.bankDetails?.accountNumber || '',
      ifscCode: teacher.bankDetails?.ifscCode || '',
      bankName: teacher.bankDetails?.bankName || ''
    });
    setIsHREditOpen(true);
    setActiveDropdown(null);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg"><BookOpen className="w-5 h-5 text-primary" /></div>
          <h2 className="text-xl font-bold text-slate-800">Staff & Teachers</h2>
        </div>
        {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'hr') && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        )}
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Employee ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Department</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{teacher.employeeId}</td>
                <td className="px-6 py-4 text-slate-600">{teacher.user?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-600">{teacher.department?.name || '-'}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3 items-center relative">
                  <button onClick={() => openProfile(teacher)} className="text-primary hover:underline text-sm font-medium">View Profile</button>
                  
                  {(user.role === 'super_admin' || user.role === 'admin' || user.role === 'hr') && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === teacher._id ? null : teacher._id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === teacher._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                          <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden text-left py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {(user.role === 'super_admin' || user.role === 'admin') && (
                              <button onClick={() => openAdminEdit(teacher)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-indigo-500" /> Academic Setup
                              </button>
                            )}

                            {(user.role === 'super_admin' || user.role === 'hr') && (
                              <button onClick={() => openHrEdit(teacher)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-emerald-500" /> Payroll & HR Setup
                              </button>
                            )}

                          </div>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {teachers.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No teachers found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Add New Staff</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select required name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="For initial login" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Academic Edit Modal */}
      {isAdminEditOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> Academic Setup</h3>
              <button onClick={() => setIsAdminEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdminEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                <input required type="text" name="employeeId" value={adminFormData.employeeId} onChange={handleAdminInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select name="department" value={adminFormData.department} onChange={handleAdminInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Subjects (comma separated)</label>
                <input type="text" name="assignedSubjects" value={adminFormData.assignedSubjects} onChange={handleAdminInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Mathematics, Physics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Classes (comma separated)</label>
                <input type="text" name="assignedClasses" value={adminFormData.assignedClasses} onChange={handleAdminInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. 10 A, 11 B" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAdminEditOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Academic Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR Payroll Edit Modal */}
      {isHREditOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-500" /> Payroll & HR Data</h3>
              <button onClick={() => setIsHREditOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleHrEditSubmit} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Employment Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary (₹)</label>
                    <input type="number" name="salary" value={hrFormData.salary} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                    <input type="date" name="joiningDate" value={hrFormData.joiningDate} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
                    <input type="number" name="experience" value={hrFormData.experience} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Qualification</label>
                    <input type="text" name="qualification" value={hrFormData.qualification} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Financial Details</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PF Number</label>
                  <input type="text" name="pfNumber" value={hrFormData.pfNumber} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                    <input type="text" name="bankName" value={hrFormData.bankName} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
                    <input type="text" name="ifscCode" value={hrFormData.ifscCode} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                  <input type="text" name="accountNumber" value={hrFormData.accountNumber} onChange={handleHrInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white pt-4">
                <button type="button" onClick={() => setIsHREditOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save HR Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {isProfileModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Teacher Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {selectedTeacher.user?.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedTeacher.user?.name || 'N/A'}</h4>
                  <p className="text-sm text-slate-500">Employee ID: {selectedTeacher.employeeId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</h5>
                  <p className="text-slate-800 font-medium">{selectedTeacher.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</h5>
                  <p className="text-slate-800 font-medium">{selectedTeacher.department?.name || 'General'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Qualification</h5>
                    <p className="text-slate-800 font-medium">{selectedTeacher.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Experience</h5>
                    <p className="text-slate-800 font-medium">{selectedTeacher.experience ? `${selectedTeacher.experience} Years` : 'N/A'}</p>
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
    </div>
  );
}

export default Teachers;
