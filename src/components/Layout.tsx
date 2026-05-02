import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, FileText, ListTodo, 
  Menu, X, GraduationCap, Lock, LogOut, User as UserIcon,
  Brain
} from 'lucide-react';
import { storage } from '../lib/storage';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentAdmin = storage.getCurrentAdmin();
  const currentStudent = storage.getCurrentStudent();

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'New Complaint', path: '/submit', icon: FileText },
    { name: 'Track Status', path: '/view', icon: ListTodo },
  ];

  const handleStudentLogout = () => {
    storage.logoutStudent();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Branding Bar */}
      <div className="bg-indigo-900 text-white py-2 px-4 text-[10px] md:text-xs font-medium tracking-wide flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-black text-zeal-gold">ZES PUNE</span>
          <span className="hidden md:inline text-indigo-400">|</span>
          <span className="hidden md:inline">DTE CODE: EN6298</span>
          <span className="hidden md:inline text-indigo-400">|</span>
          <span className="hidden md:inline text-emerald-400">🤖 ML-Powered Priority Engine v2.0</span>
        </div>
        <div className="flex items-center space-x-4">
          {currentStudent ? (
            <div className="flex items-center space-x-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <UserIcon className="w-3 h-3" />
                <span>{currentStudent.name}</span>
              </span>
              <button 
                onClick={handleStudentLogout}
                className="text-white/60 hover:text-rose-400 transition-colors font-black uppercase flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-1 hover:text-zeal-gold transition-colors font-bold uppercase tracking-wider">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Student Login</span>
            </Link>
          )}
          
          <span className="text-indigo-700">|</span>

          {currentAdmin ? (
            <Link to="/admin/dashboard" className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 font-bold transition-colors">
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN: {currentAdmin.username}</span>
            </Link>
          ) : (
            <Link to="/admin/login" className="flex items-center space-x-1 hover:text-zeal-gold transition-colors font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Staff</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 md:h-20 py-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-indigo-900 leading-none">ZCOER</span>
                <span className="text-[10px] md:text-xs font-bold text-slate-500 tracking-tighter uppercase">Intelligent Grievance Portal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 text-sm font-semibold transition-all py-2 border-b-2 ${
                      isActive ? 'text-indigo-600 border-indigo-600' : 'text-slate-600 border-transparent hover:text-indigo-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to="/submit"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2"
              >
                <span>Lodge Grievance</span>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-indigo-600 focus:outline-none p-2"
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-xl text-base font-bold ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white p-1.5 rounded-lg">
                  <Shield className="w-6 h-6 text-indigo-900" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">ZCOER INTELLIGENT PORTAL</span>
              </div>
              <p className="text-indigo-100/70 text-sm leading-relaxed max-w-md">
                Powered by adaptive machine learning prioritization. ZCOER is committed to transparent, fair, and efficient grievance redressal with AI-driven complaint classification, stakeholder fairness analysis, and automated email notifications.
              </p>
              <div className="flex items-center space-x-2 mt-4 bg-indigo-800 rounded-xl px-4 py-2 w-fit">
                <Brain className="w-4 h-4 text-zeal-gold" />
                <span className="text-xs font-bold text-zeal-gold uppercase tracking-widest">ML Priority Engine Active</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-zeal-gold text-sm font-black uppercase tracking-widest mb-6">Contact Us</h3>
              <ul className="space-y-4 text-sm text-indigo-100/80">
                <li>S.No. 39, Narhe, Pune-411041,<br/>Maharashtra, India</li>
                <li>Email: zeal.grievance@zealeducation.com</li>
                <li>Emergency: +91 20 6720 6100</li>
              </ul>
            </div>

            <div>
              <h3 className="text-zeal-gold text-sm font-black uppercase tracking-widest mb-6">Access</h3>
              <ul className="space-y-3">
                <li><Link to="/login" className="text-indigo-100/80 hover:text-white text-sm transition-colors">Student Login</Link></li>
                <li><Link to="/admin/login" className="text-indigo-100/80 hover:text-white text-sm transition-colors">Staff Login</Link></li>
                <li><Link to="/view" className="text-indigo-100/80 hover:text-white text-sm transition-colors">Check Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-indigo-800 mt-12 pt-6 text-center text-xs text-indigo-400 font-medium">
            © 2025 ZCOER Intelligent Grievance Portal. Powered by Adaptive ML Prioritization Engine.
          </div>
        </div>
      </footer>
    </div>
  );
};
