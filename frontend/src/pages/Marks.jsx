import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Award, Plus, Loader2, X } from 'lucide-react';

function Marks() {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    marksObtained: '',
    totalMarks: ''
  });

  const { user } = useSelector((state) => state.auth);
  const API_URL = `${import.meta.env.VITE_API_URL}/api/marks`;
  const STUDENTS_URL = `${import.meta.env.VITE_API_URL}/api/students`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [marksRes, stdRes] = await Promise.all([
        axios.get(API_URL, config),
        axios.get(STUDENTS_URL, config)
      ]);
      setMarks(marksRes.data);
      setStudents(stdRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(API_URL, formData, config);
      setMarks([response.data, ...marks]);
      setIsModalOpen(false);
      setFormData({ student: '', subject: '', marksObtained: '', totalMarks: '' });
    } catch (error) {
      console.error(error);
      alert('Error uploading marks: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Student Marks</h2>
        </div>
        {(user.role === 'teacher' || user.role === 'admin' || user.role === 'super_admin') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Upload Marks
          </button>
        )}
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Subject</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Score</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((mark) => {
              const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(1);
              return (
                <tr key={mark._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{mark.student?.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-600">{mark.subject}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{mark.marksObtained} <span className="text-slate-400 font-normal">/ {mark.totalMarks}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${percentage >= 80 ? 'bg-green-100 text-green-700' : ''}
                      ${percentage >= 50 && percentage < 80 ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${percentage < 50 ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {marks.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No marks uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Marks Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Upload Marks</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                <select required name="student" value={formData.student} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.user?.name} (Roll: {s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Science" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marks Obtained</label>
                  <input required type="number" name="marksObtained" value={formData.marksObtained} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Marks</label>
                  <input required type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" min="1" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marks;
