import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Home,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  Bell,
} from "lucide-react";
import { logoutUser } from "../../store/slices/authSlice";
import { selectUser, selectIsAuthenticated } from "../../store/slices/authSlice";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

   
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const getDashboardLink = () => {
    const map = {
      student: "/student/dashboard",
      owner: "/owner/dashboard",
      admin: "/admin/dashboard",
    };
    return map[user?.role] || "/";
  };

  const getRoleBadgeColor = () => {
    const map = {
      student: "badge-primary",
      owner: "badge-secondary",
      admin: "badge-warning",
    };
    return map[user?.role] || "badge-primary";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-surface-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
           
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary group-hover:shadow-glow-primary transition-shadow">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-surface-900">
              <span className="text-primary-600">Smart</span>Stay
            </span>
          </Link>

         
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated && (
              <>
                <Link to="/properties" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Properties</Link>
                <a href="/#features" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Features</a>
                <a href="/#how-it-works" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">How It Works</a>
                <a href="/#contact" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Contact</a>
              </>
            )}
          </div>

       
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">


             
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-700 transition-colors text-slate-300 hover:text-white text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

           
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-dark-600 hover:border-primary-500/50 bg-dark-800 hover:bg-dark-700 transition-all text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-slate-300 max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-dark rounded-xl border border-dark-600 shadow-card-hover animate-slide-down py-1 z-50">
                      <div className="px-3 py-2 border-b border-dark-600">
                        <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                        <span className={`${getRoleBadgeColor()} mt-1`}>
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-dark-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>

         
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

  
      {isMobileOpen && (
        <div className="md:hidden glass-dark border-t border-dark-600 animate-slide-down">
          <div className="section-container py-4 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/properties" className="px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 transition-colors">
                  Properties
                </Link>
                <a href="/#features" className="px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 transition-colors">
                  Features
                </a>
                <a href="/#how-it-works" className="px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 transition-colors">
                  How It Works
                </a>
                <div className="border-t border-dark-600 pt-2 mt-1 flex flex-col gap-2">
                  <Link to="/login" className="btn-ghost text-sm text-center">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm text-center">Get Started</Link>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-dark-600 mb-1">
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                </div>
                <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-700 transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
