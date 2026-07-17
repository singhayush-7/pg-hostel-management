import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import { Users, Building2, AlertTriangle, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const AdminDashboard = () => {
  const user = useSelector(selectUser);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-16">
        <div className="section-container py-8">
         
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-warning-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Platform overview and control center.</p>
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Users", value: "0", icon: Users, color: "text-primary-400", bg: "bg-primary-500/10" },
              { label: "Owners", value: "0", icon: Building2, color: "text-secondary-400", bg: "bg-secondary-500/10" },
              { label: "Active Properties", value: "0", icon: BarChart3, color: "text-success-400", bg: "bg-success-500/10" },
              { label: "Open Complaints", value: "0", icon: AlertTriangle, color: "text-warning-400", bg: "bg-warning-500/10" },
              { label: "Platform Revenue", value: "₹0", icon: TrendingUp, color: "text-primary-300", bg: "bg-primary-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5 animate-slide-up">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-slate-500 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>

        
          <div className="card p-8 border-warning-500/30 bg-warning-500/5 text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning-500/10 mb-4">
              <ShieldCheck className="w-8 h-8 text-warning-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Admin Control Panel</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Full analytics, user management, property verification, and platform monitoring will be available in Phase 5.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
