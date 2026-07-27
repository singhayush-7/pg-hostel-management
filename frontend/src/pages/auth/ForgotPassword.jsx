import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Home, ArrowLeft, Send, AlertCircle, CheckCircle } from "lucide-react";
import { forgotPassword, clearError, clearSuccess, selectAuthLoading, selectAuthError, selectSuccessMessage } from "../../store/slices/authSlice";
import Loader from "../../components/ui/Loader";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectSuccessMessage);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
         
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl">
              <span className="gradient-text">Smart</span>
              <span className="text-surface-900">Stay</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-surface-900">Forgot password?</h1>
          <p className="text-surface-600 mt-2">No worries, we'll send you a reset link</p>
        </div>

        <div className="card p-8">
          {successMessage ? (
             
            <div className="text-center animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-500/10 border border-success-500/30 mb-6">
                <CheckCircle className="w-8 h-8 text-success-400" />
              </div>
              <h2 className="text-xl font-semibold text-surface-900 mb-3">Check your email</h2>
              <p className="text-surface-600 text-sm mb-6 leading-relaxed">{successMessage}</p>
              <p className="text-xs text-surface-500 mb-6">
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { dispatch(clearSuccess()); }}
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  try again
                </button>
              </p>
              <Link to="/login" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                Back to Sign In
              </Link>
            </div>
          ) : (
            
            <>
              {error && (
                <div className="flex items-center gap-3 bg-danger-500/10 border border-danger-500/30 rounded-xl p-3.5 mb-6">
                  <AlertCircle className="w-5 h-5 text-danger-400 shrink-0" />
                  <p className="text-danger-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="input-label">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-10"
                      required
                    />
                  </div>
                  <p className="input-hint">We'll send a reset link to this email.</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
