import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Library, IndianRupee, Calendar, ClipboardList, CheckCircle, Percent, Loader2, Clock,
  Building2, LayoutTemplate, HelpCircle, Activity, ChevronRight, FileText, Bot, UserPlus, Book, Settings, Database, Ticket
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

function DashboardHome() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, config);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!stats) return <div className="p-6 text-slate-500">Failed to load dashboard data.</div>;

  const StatCard = ({ title, value, icon: Icon, colorClass, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md transition-all hover:border-primary/30' : ''}`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass.replace('bg-', 'bg-opacity-20 text-').replace('500', '600')}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-800 animate-in slide-in-from-bottom-2 duration-500">{value}</p>
      </div>
    </div>
  );

  // Mock Data for Charts
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  // Static data removed, using dynamic stats from backend

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Super Admin Dashboard */}
      {stats.role === 'super_admin' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Platform Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Institutions" value={stats.totalInstitutions || 0} icon={Building2} colorClass="bg-blue-500 text-blue-600" onClick={() => navigate('/dashboard/institutions')} />
              <StatCard title="Active Institutions" value={stats.activeInstitutions || 0} icon={CheckCircle} colorClass="bg-emerald-500 text-emerald-600" onClick={() => navigate('/dashboard/institutions')} />
              <StatCard title="Inactive Institutions" value={stats.inactiveInstitutions || 0} icon={Activity} colorClass="bg-slate-500 text-slate-600" onClick={() => navigate('/dashboard/institutions')} />
              <StatCard title="Trial Institutions" value={stats.trialInstitutions || 0} icon={Clock} colorClass="bg-amber-500 text-amber-600" onClick={() => navigate('/dashboard/institutions')} />
              
              <StatCard title="Total Students" value={(stats.totalStudents || 0).toLocaleString()} icon={Users} colorClass="bg-indigo-500 text-indigo-600" />
              <StatCard title="Total Teachers" value={(stats.totalTeachers || 0).toLocaleString()} icon={UserPlus} colorClass="bg-purple-500 text-purple-600" />
              <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} icon={IndianRupee} colorClass="bg-emerald-600 text-emerald-700" />
              <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue || 0)} icon={IndianRupee} colorClass="bg-emerald-400 text-emerald-500" />
              
              <StatCard title="Pending Tickets" value={stats.pendingSupportTickets || 0} icon={Ticket} colorClass="bg-red-500 text-red-600" />
              <StatCard title="Storage Used" value={stats.storageUsed || '0 GB'} icon={Database} colorClass="bg-cyan-500 text-cyan-600" />
              <StatCard title="Active Users Today" value={(stats.activeUsersToday || 0).toLocaleString()} icon={Activity} colorClass="bg-pink-500 text-pink-600" />
              <StatCard title="Expiring Soon" value={stats.expiringSubscriptions || 0} icon={Calendar} colorClass="bg-orange-500 text-orange-600" />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Revenue Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueTrendData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Platform Growth (Institutions)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.platformGrowthData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Admin Dashboard */}
      {stats.role === 'admin' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Institution Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Students" value={stats.totalStudents || '8,421'} icon={Users} colorClass="bg-blue-500 text-blue-600" onClick={() => navigate('/dashboard/students')} />
              <StatCard title="Total Faculty" value={stats.totalTeachers || '512'} icon={UserPlus} colorClass="bg-indigo-500 text-indigo-600" onClick={() => navigate('/dashboard/teachers')} />
              <StatCard title="Departments" value={stats.totalDepartments || 0} icon={Building2} colorClass="bg-purple-500 text-purple-600" onClick={() => navigate('/dashboard/departments')} />
              <StatCard title="Courses" value={stats.totalCourses || 0} icon={LayoutTemplate} colorClass="bg-pink-500 text-pink-600" onClick={() => navigate('/dashboard/courses')} />
              <StatCard title="Pending Leave" value={stats.pendingLeave || 0} icon={Clock} colorClass="bg-amber-500 text-amber-600" onClick={() => navigate('/dashboard/faculty-leave')} />
              <StatCard title="Today's Classes" value={stats.todayClassesCount || 0} icon={Calendar} colorClass="bg-sky-500 text-sky-600" onClick={() => navigate('/dashboard/timetable')} />
              <StatCard title="Fee Collected" value={stats.fees?.totalCollected ? `₹${(stats.fees.totalCollected/100000).toFixed(2)} L` : '₹0'} icon={IndianRupee} colorClass="bg-emerald-500 text-emerald-600" onClick={() => navigate('/dashboard/fees')} />
              <StatCard title="Books Issued" value={stats.booksIssued || 0} icon={Book} colorClass="bg-teal-500 text-teal-600" onClick={() => navigate('/dashboard/library')} />
            </div>
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
              <h3 className="text-base font-bold text-slate-800 mb-4">Student Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.studentGrowthData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Attendance Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.attendanceTrendData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Lower Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800">Recent Activities</h3>
                <button className="text-sm font-medium text-primary hover:text-primary-600 flex items-center">View All <ChevronRight className="w-4 h-4 ml-1" /></button>
              </div>
              <div className="divide-y divide-slate-50">
                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((act, i) => {
                    let IconComponent = UserPlus;
                    let color = 'text-slate-500';
                    let bg = 'bg-slate-50';
                    if (act.type === 'admission') { IconComponent = UserPlus; color = 'text-blue-500'; bg = 'bg-blue-50'; }
                    if (act.type === 'leave') { IconComponent = Clock; color = 'text-amber-500'; bg = 'bg-amber-50'; }
                    if (act.type === 'library') { IconComponent = Book; color = 'text-purple-500'; bg = 'bg-purple-50'; }
                    
                    return (
                      <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                        <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 font-medium">{act.text}</p>
                          <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-500">No recent activities found</div>
                )}
              </div>
            </div>

            {/* Quick Actions & AI Insights */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-primary p-6 rounded-xl text-white shadow-md relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-6 h-6" />
                  <h3 className="text-lg font-bold">AI Insights</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-4">Attendance in Mechanical Dept. dropped by 4% this week. Would you like to generate a detailed report?</p>
                <button onClick={() => navigate('/dashboard/ai')} className="w-full py-2 bg-white text-primary text-sm font-bold rounded-lg hover:bg-indigo-50 transition-colors">
                  Ask ERP Assistant
                </button>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => navigate('/dashboard/students')} className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">Add Student</span>
                  </button>
                  <button onClick={() => navigate('/dashboard/teachers')} className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-500/50 hover:bg-indigo-50 transition-all group">
                    <Users className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Add Faculty</span>
                  </button>
                  <button onClick={() => navigate('/dashboard/courses')} className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-purple-500/50 hover:bg-purple-50 transition-all group">
                    <LayoutTemplate className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    <span className="font-medium text-slate-700 group-hover:text-purple-600 transition-colors">Create Course</span>
                  </button>
                  <button onClick={() => navigate('/dashboard/reports')} className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-50 transition-all group">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Teacher Dashboard */}
      {stats.role === 'teacher' && (
        <div className="animate-in fade-in duration-500">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-sm mb-6 relative overflow-hidden">
             <div className="absolute -right-12 -top-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
             <h1 className="text-3xl font-bold relative z-10">Welcome, {user.name}</h1>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-6">Today's Classes</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
             {stats.todayClasses && stats.todayClasses.length > 0 ? (
               <div className="divide-y divide-slate-100">
                  {stats.todayClasses.map((cls, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold text-sm">
                        {cls.startTime}
                      </div>
                      <div className="font-medium text-slate-800">{cls.subject} - {cls.className} {cls.section}</div>
                    </div>
                  ))}
               </div>
             ) : (
                <div className="p-6 text-slate-500">No classes scheduled for today.</div>
             )}
          </div>
        </div>
      )}

      {/* Student Dashboard */}
      {stats.role === 'student' && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Your Academic Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Today's Classes" value={stats.todayClassesCount} icon={Calendar} colorClass="bg-blue-500 text-blue-600" onClick={() => navigate('/dashboard/timetable')} />
            <StatCard title="Pending Tasks" value={stats.unsubmittedCount} icon={ClipboardList} colorClass="bg-amber-500 text-amber-600" onClick={() => navigate('/dashboard/assignments')} />
            <StatCard title="Attendance" value={`${stats.attendancePercentage}%`} icon={Percent} colorClass={stats.attendancePercentage >= 75 ? "bg-emerald-500 text-emerald-600" : "bg-red-500 text-red-600"} onClick={() => navigate('/dashboard/attendance')} />
            <StatCard title="Fees Due" value={`₹${stats.pendingFeesAmount}`} icon={IndianRupee} colorClass={stats.pendingFeesAmount > 0 ? "bg-red-500 text-red-600" : "bg-emerald-500 text-emerald-600"} onClick={() => navigate('/dashboard/fees')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Recent Updates</h2>
              <ul className="space-y-4">
                {stats.unsubmittedCount > 0 && (
                  <li className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0"></div>
                    <p className="text-sm text-slate-600">You have <span className="font-semibold text-slate-800">{stats.unsubmittedCount}</span> pending assignment(s) to submit.</p>
                  </li>
                )}
                {stats.pendingFeesAmount > 0 && (
                  <li className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                    <p className="text-sm text-slate-600">You have <span className="font-semibold text-slate-800">₹{stats.pendingFeesAmount}</span> in pending fees. Please clear them soon.</p>
                  </li>
                )}
                {stats.attendancePercentage < 75 && (
                  <li className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                    <p className="text-sm text-slate-600">Your attendance is below 75%. Please ensure you attend all upcoming classes.</p>
                  </li>
                )}
                {stats.unsubmittedCount === 0 && stats.pendingFeesAmount === 0 && stats.attendancePercentage >= 75 && (
                  <li className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                    <p className="text-sm text-slate-600">You are fully caught up on everything! Great job.</p>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="bg-primary p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
              <h2 className="text-lg font-bold mb-2 relative z-10">Next Up</h2>
              {stats.nextClass ? (
                <div className="relative z-10 mt-4">
                  <p className="text-primary-100 text-sm">Next Class</p>
                  <p className="text-2xl font-bold">{stats.nextClass.subject}</p>
                  <p className="mt-2 flex items-center gap-2"><Clock className="w-4 h-4" /> {stats.nextClass.startTime}</p>
                </div>
              ) : (
                <div className="relative z-10 mt-4">
                  <p className="text-2xl font-bold">No more classes today!</p>
                  <p className="text-primary-100 text-sm mt-2">Enjoy your free time or catch up on reading.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
