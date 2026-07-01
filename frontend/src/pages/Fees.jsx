import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CreditCard, Loader2, Plus, X } from 'lucide-react';

function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    student: '', amount: '', description: '', dueDate: ''
  });

  const { user } = useSelector((state) => state.auth);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/fees`;
  const STUDENTS_API_URL = `${import.meta.env.VITE_API_URL}/api/students`;

  useEffect(() => {
    fetchFees();
    if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'accountant') {
      fetchStudents();
    }
  }, []);

  const fetchFees = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(API_URL, config);
      setFees(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(STUDENTS_API_URL, config);
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(API_URL, formData, config);
      
      // Re-fetch fees to get populated student data
      fetchFees();
      
      setIsModalOpen(false);
      setFormData({ student: '', amount: '', description: '', dueDate: '' });
      alert('Fee added successfully!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (feeId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/${feeId}/verify`, { 
        paymentId: `demo_pay_${Date.now()}`,
        signature: 'demo_sig'
      }, config);
      alert("Payment successful!");
      fetchFees();
    } catch (error) {
      console.error(error);
      alert("Payment failed: " + (error.response?.data?.message || error.message));
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
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Fee Management</h2>
        </div>
        {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'accountant') && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Fee
          </button>
        )}
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount (INR)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Due Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{fee.student?.user?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-slate-600">{fee.description}</td>
                <td className="px-6 py-4 text-slate-600 font-semibold">₹{fee.amount}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' : ''}
                    ${fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${fee.status === 'Overdue' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {fee.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {fee.status !== 'Paid' && (
                    <button 
                      onClick={() => handlePayment(fee._id)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  {fee.status === 'Paid' && (
                    <span className="text-slate-400 text-sm font-medium">Completed</span>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No fee records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Add New Fee</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                <select required name="student" value={formData.student} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white">
                  <option value="" disabled>Select a student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.user?.name || s.studentId} ({s.className} {s.section})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input required type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Term 1 Tuition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (INR)</label>
                  <input required type="number" min="0" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fees;
