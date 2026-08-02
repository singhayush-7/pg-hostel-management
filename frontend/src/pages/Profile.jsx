import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Phone, Mail, Lock, Shield, Bell, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfile, selectUser, selectAuthLoading, clearError, clearSuccess, selectAuthError, selectSuccessMessage, setAvatarPreview as dispatchAvatarPreview } from "../store/slices/authSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);
  const successMsg = useSelector(selectSuccessMessage);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || null);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  
  useEffect(() => {
    if (successMsg) {
      toast.success(successMsg);
      dispatch(clearSuccess());
    }
    if (apiError) {
      toast.error(apiError);
      dispatch(clearError());
    }
  }, [successMsg, apiError, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max 2MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      dispatch(dispatchAvatarPreview(url)); // Sync with navbar globally
      toast.success("Avatar updated locally! (Upload pending backend integration)");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    // Only dispatch if something changed
    if (formData.name !== user.name || formData.phone !== (user.phone || "")) {
      await dispatch(updateProfile({ name: formData.name, phone: formData.phone }));
    } else {
      toast("No changes to save", { icon: "ℹ️" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Profile</h1>
        <p className="text-surface-500 text-sm mt-0.5">Manage your account profile details</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="card p-6 bg-white border border-border">
            <h3 className="text-lg font-bold text-surface-900 mb-6">Personal Information</h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {/* Avatar section */}
              <div className="flex items-center gap-4 mb-6">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl border border-primary-200">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    Change Avatar
                  </button>
                  <p className="text-xs text-surface-500 mt-1.5">JPG, PNG or WEBP. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="input-label text-sm font-semibold text-surface-700">Full Name</label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label text-sm font-semibold text-surface-700">Phone Number</label>
                  <div className="relative mt-1">
                    <Phone className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="input pl-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label text-sm font-semibold text-surface-700">Email Address (Read-only)</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input pl-9 bg-surface-50 text-surface-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-surface-500 mt-1">Contact support to change your email address.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {isLoading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          {/* Account Type info */}
          <div className="card p-6 border border-primary-200 bg-primary-50">
            <div className="flex gap-4">
              <Shield className="w-6 h-6 text-primary-500 shrink-0" />
              <div>
                <h4 className="font-bold text-surface-900">Account Type: {user?.role === 'owner' ? 'Property Owner' : 'Student / Tenant'}</h4>
                <p className="text-sm text-surface-600 mt-1">
                  Your account role dictates what you can see and manage on SmartStay. This cannot be changed directly.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
  );
}
