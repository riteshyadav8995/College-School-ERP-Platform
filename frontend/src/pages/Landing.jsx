import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register as registerUser, reset } from '../features/authSlice';
import { BookOpen, Loader2, GraduationCap, Users, Building2, CheckCircle2 } from 'lucide-react';

function Landing() {
  
  // Login State
  const [loginData, setLoginData] = useState({
    loginEmail: '',
    loginPassword: '',
  });
  const { loginEmail, loginPassword } = loginData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isSuccess, navigate, dispatch]);

  const onLoginChange = (e) => {
    setLoginData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email: loginEmail, password: loginPassword }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Left Column: Hero/Marketing */}
      <div className="hidden md:flex md:w-1/2 bg-primary p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EduNexus</span>
          </div>
          
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            The Complete <br/>
            <span className="text-primary-foreground">Education Management</span> <br/>
            Platform.
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-md leading-relaxed">
            Streamline your institution's operations, engage students, and empower educators all from one central dashboard.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><Users className="w-5 h-5" /></div>
              <p className="font-medium text-lg">Student & Faculty Portals</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><Building2 className="w-5 h-5" /></div>
              <p className="font-medium text-lg">Department & Asset Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              <p className="font-medium text-lg">Automated Fee & Attendance Tracking</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} EduNexus ERP. All rights reserved.
        </div>
      </div>

      {/* Right Column: Auth Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-white">
        
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">EduNexus</span>
        </div>

        <div className="w-full max-w-md mt-16 md:mt-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome</h2>
            <p className="text-slate-500">Sign in to continue</p>
          </div>

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 text-center shadow-sm">
              {message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onLoginSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
                  name="loginEmail"
                  value={loginEmail}
                  placeholder="name@school.edu"
                  onChange={onLoginChange}
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
                  name="loginPassword"
                  value={loginPassword}
                  placeholder="••••••••"
                  onChange={onLoginChange}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center mt-6"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </button>
            </form>

        </div>
      </div>
    </div>
  );
}

export default Landing;
