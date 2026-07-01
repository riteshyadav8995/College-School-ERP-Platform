import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CreditCard, Plus, Loader2, Edit, Trash2, CheckCircle2 } from 'lucide-react';

function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', maxStudents: '', maxTeachers: '', storageLimit: '',
    aiFeatures: false, smsCredits: '', whatsappCredits: '', apiAccess: false
  });
  
  const { user } = useSelector((state) => state.auth);
  const API_URL = `${import.meta.env.VITE_API_URL}/api/subscriptions`;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(API_URL, config);
      setPlans(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(API_URL, formData, config);
      fetchPlans();
      setFormData({
        name: '', price: '', maxStudents: '', maxTeachers: '', storageLimit: '',
        aiFeatures: false, smsCredits: '', whatsappCredits: '', apiAccess: false
      });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      fetchPlans();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (user?.role !== 'super_admin') return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Subscription Management</h1>
            <p className="text-sm text-slate-500">Manage SaaS plans, pricing, and limits.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 col-span-1 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Add New Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plan Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Enterprise" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹/mo)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Storage (GB)</label>
                <input type="number" name="storageLimit" required value={formData.storageLimit} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Students</label>
                <input type="number" name="maxStudents" required value={formData.maxStudents} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Teachers</label>
                <input type="number" name="maxTeachers" required value={formData.maxTeachers} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">SMS Credits</label>
                <input type="number" name="smsCredits" value={formData.smsCredits} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp Credits</label>
                <input type="number" name="whatsappCredits" value={formData.whatsappCredits} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" name="aiFeatures" checked={formData.aiFeatures} onChange={handleInputChange} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                AI Features
              </label>

            </div>

            <button type="submit" disabled={submitting} className="w-full py-2.5 mt-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all flex justify-center items-center">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Plan'}
            </button>
          </form>
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div key={plan._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <button onClick={() => handleDelete(plan._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <div className="mt-2 mb-6">
                    <span className="text-3xl font-extrabold text-slate-900">₹{plan.price}</span>
                    <span className="text-slate-500 font-medium">/month</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-slate-800">{plan.maxStudents}</span> Students
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-slate-800">{plan.maxTeachers}</span> Teachers
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-slate-800">{plan.storageLimit} GB</span> Storage
                    </div>
                    {(plan.smsCredits > 0 || plan.whatsappCredits > 0) && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {plan.smsCredits} SMS / {plan.whatsappCredits} WhatsApp
                      </div>
                    )}
                    {plan.aiFeatures && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        Advanced AI Features Included
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
              No subscription plans found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subscriptions;

