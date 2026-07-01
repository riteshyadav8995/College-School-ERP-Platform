import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { User, MapPin, Phone, Upload, Loader2 } from 'lucide-react';

function TeacherProfile() {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/teachers/profile`;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.get(API_URL, config);
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">Failed to load profile.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-indigo-500/10"></div>
        <div className="relative z-10 w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-5xl font-bold text-slate-300">
           {profile.user?.name?.charAt(0) || 'T'}
        </div>
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{profile.user?.name}</h1>
          <p className="text-slate-500 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
             {profile.designation} • {profile.department?.name || 'No Department'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800">ID:</span> {profile.employeeId}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <User className="w-4 h-4 text-slate-400" />
              {profile.user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Professional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">Qualification</label>
              <div className="text-slate-800 font-medium">{profile.qualification || 'Not provided'}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">Joining Date</label>
              <div className="text-slate-800 font-medium">{new Date(profile.joiningDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" /> Contact Details
          </h2>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">Contact Number</label>
              <div className="text-slate-800 font-medium">{profile.contactNumber || 'Not provided'}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1">Address</label>
              <div className="text-slate-800 font-medium flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{profile.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfile;
