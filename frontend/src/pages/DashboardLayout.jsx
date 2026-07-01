import { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/authSlice';
import { LayoutDashboard, Users, BookOpen, User, DollarSign, Settings, Bell, MessageSquare, ChevronDown, GraduationCap, Award, Box, Briefcase, FileBarChart, Bot, Building2, LogOut, Search, CreditCard, ChevronRight } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, hidden }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  if (hidden) return null;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-primary/20 text-primary-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
};

const ExpandableMenu = ({ title, icon: Icon, menuKey, children, hidden, expandedMenus, toggleMenu }) => {
  if (hidden) return null;
  const isOpen = expandedMenus[menuKey];
  return (
    <div>
      <button 
        type="button"
        onClick={() => toggleMenu(menuKey)}
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg font-medium transition-colors text-slate-300 hover:bg-slate-800 hover:text-white`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          {title}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="pl-11 pr-4 py-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

const SubNavItem = ({ to, label, hidden }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  if (hidden) return null;
  return (
    <Link 
      to={to} 
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/20 text-primary-400 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      {label}
    </Link>
  );
};

function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const mainContentRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  
  const [expandedMenus, setExpandedMenus] = useState({
    academic: false,
    students: false,
    faculty: false,
    examinations: false,
    finance: false,
    resources: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Reset scroll position of main content on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Determine Branding & Settings
  const institutionName = user.institution?.name || 'School ERP';
  const shortForm = user.institution?.shortForm || 'School';
  const academicYear = user.settings?.academicYear || '2026-27';
  const semester = user.settings?.semester || 'Monsoon';

  const formatRole = (role) => {
    if (role === 'super_admin') return 'Super Administrator';
    if (role === 'admin') return 'Administrator';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const hasRole = (...roles) => roles.includes(user?.role);



  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shrink-0 text-slate-300">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary-400" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight leading-none">
            {shortForm} ERP<br/>
            <span className="text-xs font-medium text-slate-400">Portal</span>
          </span>
        </div>
        
        <nav className="p-4 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {/* Super Admin Menu */}
          <NavItem to="/dashboard/institutions" icon={Building2} label="Institutions" hidden={!hasRole('super_admin')} />
          <NavItem to="/dashboard/subscriptions" icon={CreditCard} label="Subscriptions" hidden={!hasRole('super_admin')} />

          {/* Admin / Academic Menus */}
          <ExpandableMenu title="Academic" icon={BookOpen} menuKey="academic" hidden={!hasRole('admin')} expandedMenus={expandedMenus} toggleMenu={toggleMenu}>
            <SubNavItem to="/dashboard/departments" label="Departments" />
            <SubNavItem to="/dashboard/programs" label="Programs" />
            <SubNavItem to="/dashboard/semester" label="Semesters" />
            <SubNavItem to="/dashboard/courses" label="Courses" />
          </ExpandableMenu>

          <ExpandableMenu title="Students" icon={Users} menuKey="students" hidden={!hasRole('admin', 'teacher', 'student')} expandedMenus={expandedMenus} toggleMenu={toggleMenu}>
            <SubNavItem to="/dashboard/students" label="Student Directory" hidden={hasRole('student')} />

            <SubNavItem to="/dashboard/hostel" label="Hostel Management" hidden={!hasRole('admin')} />
            <SubNavItem to="/dashboard/student-hostel" label="My Hostel" hidden={!hasRole('student')} />
            <SubNavItem to="/dashboard/scholarships" label="Scholarships" hidden={!hasRole('admin')} />
          </ExpandableMenu>

          <ExpandableMenu title="Faculty" icon={User} menuKey="faculty" hidden={!hasRole('admin', 'teacher')} expandedMenus={expandedMenus} toggleMenu={toggleMenu}>
            <SubNavItem to="/dashboard/teachers" label="Faculty Directory" />
            <SubNavItem to="/dashboard/faculty-leave" label="Leave Management" />
            <SubNavItem to="/dashboard/workload" label="Workload" />
          </ExpandableMenu>

          <ExpandableMenu title="Examinations" icon={Award} menuKey="examinations" hidden={hasRole('super_admin')} expandedMenus={expandedMenus} toggleMenu={toggleMenu}>
            <SubNavItem to="/dashboard/attendance" label="Attendance" />
            <SubNavItem to="/dashboard/timetable" label="Timetable" />
            <SubNavItem to="/dashboard/assignments" label="Assignments" />
            <SubNavItem to="/dashboard/marks" label="Marks & Results" />
          </ExpandableMenu>

          <ExpandableMenu title="Finance" icon={DollarSign} menuKey="finance" hidden={!hasRole('admin', 'student')} expandedMenus={expandedMenus} toggleMenu={toggleMenu}>
            <SubNavItem to="/dashboard/fees" label="Fee Management" />
            <SubNavItem to="/dashboard/payroll" label="Payroll" hidden={!hasRole('admin')} />
          </ExpandableMenu>

          <ExpandableMenu title="Resources" icon={Box} menuKey="resources" hidden={hasRole('super_admin')} expandedMenus={expandedMenus} toggleMenu={toggleMenu}>
            <SubNavItem to="/dashboard/library" label="Library" />
            <SubNavItem to="/dashboard/inventory" label="Inventory" hidden={!hasRole('admin', 'teacher')} />
          </ExpandableMenu>

          <NavItem to="/dashboard/placement" icon={Briefcase} label="Placement" hidden={!hasRole('admin', 'student')} />
          <NavItem to="/dashboard/reports" icon={FileBarChart} label="Reports" hidden={!hasRole('admin')} />
          <NavItem to="/dashboard/profile" icon={User} label="My Profile" hidden={!hasRole('student', 'teacher')} />
          <NavItem to="/dashboard/my-courses" icon={BookOpen} label="My Courses" hidden={!hasRole('student')} />
          <NavItem to="/dashboard/settings" icon={Settings} label="Settings" />

          {/* AI Assistant - Everyone */}
          <div className="pt-4 mt-2 border-t border-slate-800">
            <Link 
              to="/dashboard/ai" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard/ai') ? 'bg-primary/20 text-primary-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Bot className="w-5 h-5" />
              ERP AI Assistant
            </Link>
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800">Welcome, {user.name}</h1>
            <p className="text-sm text-slate-500 font-medium">
              {formatRole(user.role)} <span className="mx-2 text-slate-300">•</span> {institutionName}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Academic Session Tags (hidden on super admin) */}
            {user.role !== 'super_admin' && (
              <div className="hidden lg:flex items-center gap-3 mr-4">
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                  AY: {academicYear}
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">
                  {semester} Sem
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 border border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-700 placeholder-slate-400" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{user.name.split(' ')[0]}</p>
                <ChevronDown className="w-3 h-3 text-slate-400 mt-0.5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div ref={mainContentRef} className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
