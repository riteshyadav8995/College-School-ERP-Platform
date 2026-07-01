import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Briefcase, Plus, Loader2, Edit, Trash2 } from 'lucide-react';

function Placement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ company: '', role: '', package: '', date: '', studentsPlaced: '' });
  
  const { user } = useSelector((state) => state.auth);
  const API_URL = `${import.meta.env.VITE_API_URL}/api/placement`;

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ company: '', role: '', package: '', date: '', studentsPlaced: '' });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      company: item.company,
      role: item.role,
      package: item.package,
      date: item.date,
      studentsPlaced: item.studentsPlaced || 0
    });
    setEditId(item._id);
    setIsEditMode(true);
    // scroll to top of form if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (isEditMode) {
        await axios.put(`${API_URL}/${editId}`, formData, config);
      } else {
        await axios.post(API_URL, formData, config);
      }
      fetchData();
      resetForm();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Placement Cell</h1>
            <p className="text-sm text-slate-500">Manage campus recruitment drives.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user.role !== 'student' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 col-span-1 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {isEditMode ? <Edit className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-primary" />} 
              {isEditMode ? 'Edit Record' : 'Add New Record'}
            </h2>
            {isEditMode && <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors">Cancel</button>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">company</label>
              <input type="text" name="company" required value={formData.company} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">role</label>
              <input type="text" name="role" required value={formData.role} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">package</label>
              <input type="text" name="package" required value={formData.package} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">date</label>
              <input type="text" name="date" required value={formData.date} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 capitalize">Students Placed</label>
              <input type="number" name="studentsPlaced" min="0" required value={formData.studentsPlaced} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="0" />
            </div>
            <button type="submit" disabled={submitting} className={`w-full py-2.5 text-white font-semibold rounded-xl transition-all flex justify-center items-center ${isEditMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary-600'}`}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode ? 'Update Record' : 'Save Record')}
            </button>
          </form>
          </div>
        )}

        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden ${user.role === 'student' ? 'col-span-1 lg:col-span-3' : 'col-span-1 lg:col-span-2'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold capitalize">company</th><th className="p-4 font-semibold capitalize">role</th><th className="p-4 font-semibold capitalize">package</th><th className="p-4 font-semibold capitalize">date</th><th className="p-4 font-semibold capitalize">Placed</th>
                  {user.role !== 'student' && <th className="p-4 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-700 font-medium">{item.company}</td><td className="p-4 text-slate-700 font-medium">{item.role}</td><td className="p-4 text-slate-700 font-medium">{item.package}</td><td className="p-4 text-slate-700 font-medium">{item.date}</td>
                      <td className="p-4 text-slate-700 font-medium">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">{item.studentsPlaced || 0}</span>
                      </td>
                      {user.role !== 'student' && (
                        <td className="p-4">
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors mr-2"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Placement;
