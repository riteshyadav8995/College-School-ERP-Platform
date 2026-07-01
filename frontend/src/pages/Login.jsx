import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../features/authSlice';
import { BookOpen, Loader2 } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

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

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Side: About Platform */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="max-w-lg z-10">
          <div className="bg-white/10 p-4 rounded-2xl inline-block mb-8 border border-white/10 shadow-xl backdrop-blur-sm">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Manage your institution seamlessly.
          </h1>
          <p className="text-primary-100 text-lg mb-12 leading-relaxed">
            The complete School ERP platform. Streamline admissions, track attendance, manage faculty operations, and empower your students—all from one powerful dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-1 text-white">Smart Scheduling</h3>
              <p className="text-primary-200 text-sm">Automated timetables without resource conflicts.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-1 text-white">Real-time Insights</h3>
              <p className="text-primary-200 text-sm">Track performance, attendance, and leave easily.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 lg:p-10 border border-slate-100 relative">
          
          <div className="lg:hidden flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8 font-medium">Sign in to your account to continue</p>

          {isError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium text-center">
              {message}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-slate-700"
                id="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-slate-700"
                id="password"
                name="password"
                value={password}
                placeholder="Enter password"
                onChange={onChange}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-600 shadow-lg shadow-primary/30 transition-all flex items-center justify-center mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Registration link is intentionally removed because students/teachers cannot self-register */}
        </div>
      </div>
    </div>
  );
}

export default Login;
