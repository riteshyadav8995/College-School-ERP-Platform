import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { User, MapPin, Phone, Upload, CheckCircle, FileText, Loader2, Camera, Download, BookOpen } from 'lucide-react';

function StudentProfile() {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [issuedBooks, setIssuedBooks] = useState([]);

  const [formData, setFormData] = useState({
    address: '',
    fatherName: '',
    motherName: '',
    contactNumber: ''
  });

  const [files, setFiles] = useState({
    marksheet10: null,
    marksheet12: null,
    aadharCard: null,
    photo: null
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/students/profile`;
  const BASE_URL = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [response, libRes] = await Promise.all([
        axios.get(API_URL, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/book-issues`, config).catch(() => ({ data: [] }))
      ]);
      const data = response.data;
      setProfile(data);
      setIssuedBooks(libRes.data);
      setFormData({
        address: data.address || '',
        fatherName: data.parentDetails?.fatherName || '',
        motherName: data.parentDetails?.motherName || '',
        contactNumber: data.parentDetails?.contactNumber || ''
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      const submitData = new FormData();
      submitData.append('address', formData.address);
      submitData.append('fatherName', formData.fatherName);
      submitData.append('motherName', formData.motherName);
      submitData.append('contactNumber', formData.contactNumber);

      if (files.marksheet10) submitData.append('marksheet10', files.marksheet10);
      if (files.marksheet12) submitData.append('marksheet12', files.marksheet12);
      if (files.aadharCard) submitData.append('aadharCard', files.aadharCard);
      if (files.photo) submitData.append('photo', files.photo);

      const response = await axios.put(API_URL, submitData, config);
      setProfile(response.data);
      setSuccessMsg('Profile updated successfully!');
      
      // Clear file inputs state
      setFiles({ marksheet10: null, marksheet12: null, aadharCard: null, photo: null });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">Failed to load profile data.</div>;
  }

  const FileUploadBox = ({ title, name, currentFileUrl }) => (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          {title}
        </h4>
        {currentFileUrl && (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Uploaded
          </span>
        )}
      </div>
      
      {currentFileUrl && (
        <a 
          href={`${BASE_URL}${currentFileUrl}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 mb-3"
        >
          <Download className="w-3 h-3" /> View Current File
        </a>
      )}

      <div className="mt-2 flex justify-center px-4 py-4 border-2 border-slate-300 border-dashed rounded-lg bg-white relative">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-6 w-6 text-slate-400" />
          <div className="flex text-sm text-slate-600 justify-center">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
              <span>{files[name] ? files[name].name : 'Choose a file'}</span>
              <input type="file" name={name} className="sr-only" onChange={handleFileChange} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary/5 p-8 border-b border-slate-200 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              {profile.documents?.photo ? (
                <img src={`${BASE_URL}${profile.documents.photo}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-300" />
              )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-800">{profile.user?.name}</h1>
            <p className="text-slate-500 font-medium">{profile.studentId}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                Class: {profile.className} {profile.section}
              </span>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                Roll: {profile.rollNumber}
              </span>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
                Dept: {profile.department?.name || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">{successMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Personal & Parent Details */}
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" /> Contact Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    rows="3"
                    placeholder="Enter your full address"
                  ></textarea>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" /> Parent/Guardian Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label>
                    <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Number</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Documents */}
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-slate-400" /> Documents Upload
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUploadBox 
                    title="Profile Photo" 
                    name="photo" 
                    currentFileUrl={profile.documents?.photo} 
                  />
                  <FileUploadBox 
                    title="Aadhar Card" 
                    name="aadharCard" 
                    currentFileUrl={profile.documents?.aadharCard} 
                  />
                  <FileUploadBox 
                    title="10th Marksheet" 
                    name="marksheet10" 
                    currentFileUrl={profile.documents?.marksheet10} 
                  />
                  <FileUploadBox 
                    title="12th Marksheet" 
                    name="marksheet12" 
                    currentFileUrl={profile.documents?.marksheet12} 
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>

        {/* Issued Books Section */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Library - Issued Books
          </h3>
          {issuedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issuedBooks.map(issue => (
                <div key={issue._id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{issue.book?.bookId || 'Book'}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 leading-tight">{issue.book?.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{issue.book?.author}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${issue.status === 'Returned' ? 'bg-emerald-50 text-emerald-700' : (new Date(issue.dueDate) < new Date() ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700')}`}>
                      {issue.status} {issue.fine > 0 && `(₹${issue.fine})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No books currently issued.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
