import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectIsAuthenticated } from "../store/slices/authSlice";
import {
  Home,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Building2,
  Star,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

const features = [
  {
    icon: Building2,
    title: "Property Management",
    description: "Add, edit, and manage multiple PG properties with room details, photos, and amenities.",
    color: "text-primary-400",
    bg: "bg-primary-500/10",
  },
  {
    icon: CreditCard,
    title: "Rent Collection",
    description: "Automated rent reminders, online payments, and downloadable PDF receipts.",
    color: "text-secondary-400",
    bg: "bg-secondary-500/10",
  },
  {
    icon: MessageSquare,
    title: "Complaint Tracking",
    description: "Students raise complaints, owners assign staff, and everyone tracks status in real time.",
    color: "text-warning-400",
    bg: "bg-warning-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize occupancy rates, revenue trends, and complaint resolution metrics.",
    color: "text-success-400",
    bg: "bg-success-500/10",
  },
  {
    icon: Shield,
    title: "Secure & Verified",
    description: "JWT authentication, document verification, and role-based access control.",
    color: "text-primary-300",
    bg: "bg-primary-500/10",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Get notified on booking approvals, rent due dates, and complaint updates.",
    color: "text-secondary-300",
    bg: "bg-secondary-500/10",
  },
];

const stats = [
  { value: "10K+", label: "Students Managed", icon: Users },
  { value: "500+", label: "Properties Listed", icon: Building2 },
  { value: "98%", label: "Satisfaction Rate", icon: Star },
  { value: "₹2Cr+", label: "Rent Collected", icon: TrendingUp },
];

const howItWorks = [
  {
    step: "01",
    title: "Owner Lists Property",
    description: "Property owners add their PG/hostel with rooms, photos, pricing, and amenities.",
    icon: Building2,
  },
  {
    step: "02",
    title: "Student Discovers & Books",
    description: "Students search by location, budget, and preferences, then submit booking requests.",
    icon: Users,
  },
  {
    step: "03",
    title: "Owner Approves & Manages",
    description: "Owners approve bookings, collect rent online, and handle maintenance seamlessly.",
    icon: CheckCircle,
  },
];

const Landing = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/student/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-x-hidden">
      <Navbar />

     
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background mesh */}
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{animationDelay: "1.5s"}} />

        <div className="section-container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">


            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up text-balance">
              Manage Your{" "}
              <span className="text-primary-600">PG & Hostel</span>
              <br />
              Like Never Before
            </h1>

            {/* Subtext */}
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
              SmartStay digitizes everything — room bookings, rent collection, 
              complaints, maintenance, and analytics — all in one powerful platform.
            </p>

       
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 group w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3.5 flex items-center justify-center border border-surface-300 shadow-sm bg-white hover:bg-surface-50 text-surface-900 font-semibold rounded-xl transition-all w-full sm:w-auto">
                Sign In
              </Link>
            </div>


          </div>

          {/* Hero card mockup */}
          <div className="mt-20 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-white rounded-3xl border border-surface-200 p-6 md:p-8 shadow-xl shadow-primary-500/5">
              
              <div className="flex flex-col items-center justify-center text-center mb-10 relative">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Good morning,</p>
                  <h3 className="text-surface-900 font-bold text-2xl">Welcome to SmartStay 🏠</h3>
                </div>
                <div className="absolute top-0 right-0 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger-500" />
                  <div className="w-3 h-3 rounded-full bg-warning-500" />
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                </div>
              </div>
          
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Occupied Rooms", value: "24/30", color: "text-primary-500" },
                  { label: "Revenue (Month)", value: "₹1.2L", color: "text-surface-900" },
                  { label: "Pending Complaints", value: "3", color: "text-surface-900" },
                  { label: "Rent Collected", value: "87%", color: "text-primary-500" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-surface-200 shadow-sm text-left">
                    <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                    <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


     
      <section id="features" className="py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4 inline-block">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-surface-900 mb-4">
              Everything You Need to
              <span className="text-primary-600"> Run a Modern PG</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              Say goodbye to WhatsApp groups, Excel sheets, and notebook registers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-surface-900 font-semibold text-lg mb-2">{title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="how-it-works" className="py-24 bg-surface-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <span className="badge-secondary mb-4 inline-block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-surface-900 mb-4">
              Up and Running in{" "}
              <span className="text-primary-600-teal">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 to-secondary-200" />

            {howItWorks.map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="text-center relative z-10">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-primary-100 rounded-2xl opacity-50 animate-pulse-slow" />
                  <div className="relative w-20 h-20 bg-white border-2 border-primary-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <Icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {step}
                  </span>
                </div>
                <h3 className="text-surface-900 font-semibold text-xl mb-3">{title}</h3>
                <p className="text-surface-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-24">
        <div className="section-container">
          <div className="relative rounded-3xl overflow-hidden glass border border-primary-100 p-12 text-center bg-white shadow-xl shadow-primary-500/5">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-surface-900 mb-4">
                Ready to Modernize Your PG?
              </h2>
              <p className="text-surface-500 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of property owners who have already ditched Excel sheets for SmartStay.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register?role=owner" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 group">
                  List Your Property
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/register?role=student" className="btn-secondary text-base px-8 py-3.5 border border-surface-300">
                  Find a Room
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      <footer id="contact" className="py-12 border-t border-border">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                <Home className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold">
                <span className="text-primary-600">Smart</span>
                <span className="text-surface-900">Stay</span>
              </span>
            </div>
            <p className="text-surface-500 text-sm">
              © {new Date().getFullYear()} SmartStay. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-surface-500">
              <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
