import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Home, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { loginUser, clearError, selectAuthLoading, selectAuthError } from "../../store/slices/authSlice";
import Loader from "../../components/ui/Loader";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const dashboardMap = {
        student: "/student/dashboard",
        owner: "/owner/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(from || dashboardMap[role] || "/");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden p-4">
      
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-secondary-500/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
       
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl">
              <span className="gradient-text">Smart</span>
              <span className="text-surface-900">Stay</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-500 mt-2">Sign in to your SmartStay account</p>
        </div>

        
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          
          {error && (
            <div className="flex items-center gap-3 bg-danger-500/10 border border-danger-500/30 rounded-xl p-3.5 mb-6 animate-slide-down">
              <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
              <p className="text-danger-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label htmlFor="login-email" className="input-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

         
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="input-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

             
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group mt-2"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-surface-500">New to SmartStay?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          
          <Link
            to="/register"
            className="btn-ghost w-full py-3 text-sm text-center flex items-center justify-center gap-2"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
