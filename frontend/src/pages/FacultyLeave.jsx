import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Clock, Plus, Loader2, Check, X, Calendar } from 'lucide-react';

function FacultyLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
  
  const { user } = useSelector((state) => state.auth);
  const API_URL = `${import.meta.env.VITE_API_URL}/api/teacher-leaves`;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(API_URL, config);
      setLeaves(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(API_URL, formData, config);
      fetchLeaves();
      setFormData({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
      alert('Leave application submitted successfully!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessLeave = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/${id}`, { status }, config);
      fetchLeaves();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
            <p className="text-sm text-slate-500">Manage faculty leave requests and approvals.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user.role === 'teacher' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 col-span-1 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Leave Type</label>
                <select name="leaveType" required value={formData.leaveType} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                  <option value="Casual">Casual Leave</option>
                  <option value="Medical">Medical Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason</label>
                <textarea name="reason" required value={formData.reason} onChange={handleInputChange} rows="3" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"></textarea>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all flex justify-center items-center">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            </form>
          </div>
        )}

        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden ${user.role === 'teacher' ? 'col-span-1 lg:col-span-2' : 'col-span-1 lg:col-span-3'}`}>
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              {user.role === 'teacher' ? 'My Leave History' : 'All Leave Requests'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  {user.role === 'admin' && <th className="p-4 font-semibold">Teacher</th>}
                  <th className="p-4 font-semibold">Leave Type</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold">Reason</th>
                  <th className="p-4 font-semibold">Status</th>
                  {user.role === 'admin' && <th className="p-4 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50">
                      {user.role === 'admin' && (
                        <td className="p-4 text-slate-700 font-medium">
                          {leave.teacher?.user?.name || 'Unknown'}
                        </td>
                      )}
                      <td className="p-4 text-slate-700 font-medium">{leave.leaveType}</td>
                      <td className="p-4 text-slate-600 text-sm">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      {user.role === 'admin' && (
                        <td className="p-4">
                          {leave.status === 'Pending' ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleProcessLeave(leave._id, 'Approved')} className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleProcessLeave(leave._id, 'Rejected')} className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No leave requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyLeave;
