import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye, EyeOff, Home, Mail, Lock, User, Phone, 
  GraduationCap, Building2, AlertCircle, CheckCircle, ArrowRight,
} from "lucide-react";
import { registerUser, clearError, selectAuthLoading, selectAuthError } from "../../store/slices/authSlice";
import Loader from "../../components/ui/Loader";

const passwordRules = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: searchParams.get("role") || "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Password must contain an uppercase letter";
    if (!/[0-9]/.test(formData.password))
      newErrors.password = "Password must contain a number";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    const result = await dispatch(registerUser(submitData));
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const dashboardMap = {
        student: "/student/dashboard",
        owner: "/owner/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(dashboardMap[role] || "/");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden p-4 py-12">
      
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-secondary-500/8 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-md">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl">
              <span className="text-primary-600">Smart</span>
              <span className="text-surface-900">Stay</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-surface-900">Create your account</h1>
          <p className="text-surface-500 mt-2">Join SmartStay for free</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* API Error */}
          {apiError && (
            <div className="flex items-center gap-3 bg-danger-500/10 border border-danger-500/30 rounded-xl p-3.5 mb-6 animate-slide-down">
              <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
              <p className="text-danger-300 text-sm">{apiError}</p>
            </div>
          )}

          
          <div className="mb-6">
            <p className="input-label mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "student", label: "Student / Tenant", icon: GraduationCap, desc: "Looking for a PG room" },
                { value: "owner", label: "Property Owner", icon: Building2, desc: "Manage my properties" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    formData.role === value
                      ? "border-primary-500 bg-primary-500/10 text-primary-600"
                      : "border-border hover:border-surface-300 text-surface-500 hover:text-surface-900 bg-surface-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    formData.role === value ? "bg-primary-500/20" : "bg-surface-100"
                  }`}>
                    <Icon className={`w-5 h-5 ${formData.role === value ? "text-primary-600" : "text-surface-400"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

         
          <form onSubmit={handleSubmit} className="space-y-4">
       
            <div>
              <label htmlFor="reg-name" className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Arjun Singh"
                  className={`input pl-10 ${errors.name ? "input-error" : ""}`}
                />
              </div>
              {errors.name && <p className="input-error-msg"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="input-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? "input-error" : ""}`}
                />
              </div>
              {errors.email && <p className="input-error-msg"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="input-label">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`input pl-10 ${errors.phone ? "input-error" : ""}`}
                />
              </div>
              {errors.phone && <p className="input-error-msg"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="input-error-msg"><AlertCircle className="w-3 h-3" />{errors.password}</p>}

              {/* Password strength indicators */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map(({ label, test }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={`w-3 h-3 ${test(formData.password) ? "text-success-500" : "text-slate-600"}`} />
                      <span className={test(formData.password) ? "text-success-400" : "text-slate-600"}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input pl-10 ${errors.confirmPassword ? "input-error" : ""}`}
                />
              </div>
              {errors.confirmPassword && <p className="input-error-msg"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group mt-2"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
