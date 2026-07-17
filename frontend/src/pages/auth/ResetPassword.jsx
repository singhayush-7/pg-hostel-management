import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock, Home, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { resetPassword, clearError, clearSuccess, selectAuthLoading, selectAuthError, selectSuccessMessage } from "../../store/slices/authSlice";
import Loader from "../../components/ui/Loader";

const passwordRules = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
];

const ResetPassword = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectSuccessMessage);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    await dispatch(resetPassword({ token, ...formData }));
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl">
              <span className="gradient-text">Smart</span>
              <span className="text-white">Stay</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Set new password</h1>
          <p className="text-slate-400 mt-2">Choose a strong new password</p>
        </div>

        <div className="glass rounded-2xl border border-dark-600 p-8">
          {successMessage ? (
            <div className="text-center animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-500/10 border border-success-500/30 mb-6">
                <CheckCircle className="w-8 h-8 text-success-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Password reset!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link to="/login" className="btn-primary w-full py-3 flex items-center justify-center gap-2 group">
                Sign In Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <>
              {(error || localError) && (
                <div className="flex items-center gap-3 bg-danger-500/10 border border-danger-500/30 rounded-xl p-3.5 mb-6">
                  <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
                  <p className="text-danger-300 text-sm">{error || localError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reset-password" className="input-label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="reset-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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

                <div>
                  <label htmlFor="reset-confirm-password" className="input-label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="reset-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input pl-10"
                      required
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="input-error-msg mt-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group mt-2"
                >
                  {isLoading ? <Loader size="sm" /> : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
