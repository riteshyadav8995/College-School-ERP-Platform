import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', shortForm: '', institutionType: 'School', logo: '', address: '', state: '', country: '', 
    contactEmail: '', phone: '', website: '', principalDirector: '', subscriptionPlan: '', 
    adminName: '', adminEmail: '', adminPassword: ''
  });

  const resetForm = () => {
    setFormData({ 
      name: '', shortForm: '', institutionType: 'School', logo: '', address: '', state: '', country: '', 
      contactEmail: '', phone: '', website: '', principalDirector: '', subscriptionPlan: '', 
      adminName: '', adminEmail: '', adminPassword: '' 
    });
    setIsEditMode(false);
    setEditId(null);
  };

  useEffect(() => {
    fetchInstitutions();
    fetchPlans();
  }, []);

  const getToken = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr).token : null;
  };

  const fetchInstitutions = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/institutions`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setInstitutions(data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/institutions/${editId}`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/institutions`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }
      fetchInstitutions();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} institution: ` + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (inst) => {
    setFormData({
      name: inst.name,
      shortForm: inst.shortForm,
      institutionType: inst.institutionType || 'School',
      contactEmail: inst.contactEmail || '',
      phone: inst.phone || '',
      state: inst.state || '',
      country: inst.country || '',
      subscriptionPlan: inst.subscriptionPlan?._id || '',
      adminName: '', adminEmail: '', adminPassword: ''
    });
    setEditId(inst._id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if(window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/institutions/${id}`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        fetchInstitutions();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deleteInst = async (id) => {
    if(window.confirm('Are you sure you want to permanently delete this institution?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/institutions/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        fetchInstitutions();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institutions Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage tenant schools and colleges across the platform.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-all font-medium shadow-sm shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add Institution
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map(inst => (
          <div key={inst._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-lg">
                {inst.shortForm}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(inst._id, inst.status)} className={`p-2 rounded-lg transition-colors ${inst.status === 'Active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                  {inst.status === 'Active' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEdit(inst)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteInst(inst._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg text-slate-800 line-clamp-1">{inst.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{inst.institutionType} • {inst.state || 'Unknown State'}</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium px-2 py-0.5 rounded-md ${inst.status === 'Active' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>{inst.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{inst.subscriptionPlan?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Contact</span>
                <span className="font-medium text-slate-700 truncate max-w-[150px]">{inst.contactEmail || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Institution' : 'Register Institution'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <h3 className="font-semibold text-slate-800 mb-2">Institution Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Indian Institute of Technology Patna" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Short Form</label>
                  <input type="text" required value={formData.shortForm} onChange={e => setFormData({...formData, shortForm: e.target.value.toUpperCase()})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. IITP" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution Type</label>
                  <select value={formData.institutionType} onChange={e => setFormData({...formData, institutionType: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input type="email" required value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 mt-6 mb-2 border-t border-slate-100 pt-4">Subscription & Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Plan</label>
                  <select required value={formData.subscriptionPlan} onChange={e => setFormData({...formData, subscriptionPlan: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="">Select a Plan</option>
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (₹{p.price}/mo)</option>
                    ))}
                  </select>
                </div>
              </div>
              {!isEditMode && (
                <>
                  <h3 className="font-semibold text-slate-800 mt-6 mb-2 border-t border-slate-100 pt-4">Admin Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Admin Name</label>
                      <input type="text" required={!isEditMode} value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                      <input type="email" required={!isEditMode} value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
                      <input type="password" required={!isEditMode} value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-sm shadow-primary/20 transition-all">{isEditMode ? 'Update Institution' : 'Create Institution'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutions;

