import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { KeyRound, CheckCircle, Loader2 } from 'lucide-react';

function Settings() {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/auth/change-password`;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.put(API_URL, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, config);
      
      setMessage({ type: 'success', text: response.data.message });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Account Settings</h1>
        <p className="text-slate-500 text-sm">Update your account security settings here.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
            <input 
              type="password" 
              name="oldPassword" 
              required 
              value={formData.oldPassword} 
              onChange={handleInputChange} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" 
              placeholder="Enter current password" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              required 
              value={formData.newPassword} 
              onChange={handleInputChange} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" 
              placeholder="Enter new password" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              required 
              value={formData.confirmPassword} 
              onChange={handleInputChange} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" 
              placeholder="Confirm new password" 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
