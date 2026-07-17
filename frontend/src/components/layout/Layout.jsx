import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { selectUser, logoutUser } from "../../store/slices/authSlice";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  Users,
  CreditCard,
  MessageSquareWarning,
  Wrench,
  Settings,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
} from "lucide-react";
 
const Sidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const ownerLinks = [
    { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/owner/properties", icon: Building2 },
    { name: "Bookings", href: "/owner/bookings", icon: CalendarDays },
    { name: "Tenants", href: "/owner/tenants", icon: Users },
    { name: "Requests", href: "/owner/requests", icon: ClipboardList },
    { name: "Check-outs", href: "/owner/checkouts", icon: ClipboardList },
    { name: "Payments", href: "/owner/payments", icon: CreditCard },
    { name: "Complaints", href: "/owner/complaints", icon: MessageSquareWarning },
    { name: "Maintenance", href: "/owner/maintenance", icon: Wrench },
    { name: "Settings", href: "/owner/settings", icon: Settings },
  ];

  const tenantLinks = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "My Room", href: "/student/room", icon: BedDouble },
    { name: "Requests", href: "/student/requests", icon: ClipboardList },
    { name: "Payments", href: "/student/payments", icon: CreditCard },
    { name: "Complaints", href: "/student/complaints", icon: MessageSquareWarning },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  const links = user?.role === "owner" ? ownerLinks : tenantLinks;

  return (
    <>
      
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
 
      <aside
        className={clsx(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-border transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-surface-900 whitespace-nowrap">
                SmartStay
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1 rounded-md hover:bg-surface-100 text-surface-500 shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

       
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors duration-200 group relative",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                )}
                title={isCollapsed ? link.name : ""}
              >
                <link.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-primary-500" : "text-surface-400 group-hover:text-surface-600")} />
                {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
              </Link>
            );
          })}
        </div>

      
        <div className="p-4 border-t border-border shrink-0">
          <div className={clsx("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-primary-600 font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">{user?.name}</p>
                <p className="text-xs text-surface-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
            {!isCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
          {isCollapsed && (
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex justify-center p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
 
const TopNavbar = ({ setMobileOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (!searchTerm.trim()) return;
      navigate(`/properties?name=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-surface-500 hover:bg-surface-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        

      </div>

      <div className="flex items-center gap-2 sm:gap-3">

        
        <Link 
          to={`/${user?.role || 'student'}/settings`}
          className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm hover:ring-2 hover:ring-primary-500/50 hover:bg-primary-200 transition-all ml-1 sm:ml-2"
          title="My Profile"
        >
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0) || "U"
          )}
        </Link>
      </div>
    </header>
  );
};
 
const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
