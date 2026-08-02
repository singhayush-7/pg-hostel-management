import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// Pages
import Landing from "./pages/Landing";
import PropertySearch from "./pages/public/PropertySearch";
import PropertyDetails from "./pages/public/PropertyDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import StudentDashboard from "./pages/student/Dashboard";
import StudentPayments from "./pages/student/Payments";
import StudentComplaints from "./pages/student/Complaints";
import StudentRequests from "./pages/student/Requests";
import StudentRoom from "./pages/student/Room";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerRequests from "./pages/owner/Requests";
import OwnerCheckouts from "./pages/owner/Checkouts";
import Properties from "./pages/owner/Properties";
import PropertyForm from "./pages/owner/PropertyForm";
import Rooms from "./pages/owner/Rooms";
import RoomForm from "./pages/owner/RoomForm";
import OwnerBookings from "./pages/owner/Bookings";
import OwnerTenants from "./pages/owner/Tenants";
import OwnerPayments from "./pages/owner/Payments";
import OwnerComplaints from "./pages/owner/Complaints";
import OwnerMaintenance from "./pages/owner/Maintenance";
import AdminDashboard from "./pages/admin/Dashboard";
import Profile from "./pages/Profile";

// Layout & Guards
import Layout from "./components/layout/Layout";
import { ProtectedRoute, RoleGuard, PublicRoute } from "./components/auth/RouteGuards";

// Store
import { getMe, selectIsAuthenticated } from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dispatch(getMe()).finally(() => {
      setIsInitializing(false);
    });
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          },
          success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
        }}
      />

      <Routes>
        {/* ─── Public Routes ──────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        
        <Route path="/properties" element={<ProtectedRoute><PropertySearch /></ProtectedRoute>} />
        <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        
        
        {/* Student Routes */}
        <Route element={<RoleGuard allowedRoles={["student"]}><Layout /></RoleGuard>}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/requests" element={<StudentRequests />} />
          <Route path="/student/room" element={<StudentRoom />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/student/complaints" element={<StudentComplaints />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>

        {/* Owner Routes */}
        <Route element={<RoleGuard allowedRoles={["owner"]}><Layout /></RoleGuard>}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/requests" element={<OwnerRequests />} />
          <Route path="/owner/checkouts" element={<OwnerCheckouts />} />
          <Route path="/owner/properties" element={<Properties />} />
          <Route path="/owner/properties/new" element={<PropertyForm />} />
          <Route path="/owner/properties/:id/edit" element={<PropertyForm />} />
          <Route path="/owner/properties/:propertyId/rooms" element={<Rooms />} />
          <Route path="/owner/properties/:propertyId/rooms/new" element={<RoomForm />} />
          <Route path="/owner/properties/:propertyId/rooms/:roomId/edit" element={<RoomForm />} />
          <Route path="/owner/bookings" element={<OwnerBookings />} />
          <Route path="/owner/tenants" element={<OwnerTenants />} />
          <Route path="/owner/payments" element={<OwnerPayments />} />
          <Route path="/owner/complaints" element={<OwnerComplaints />} />
          <Route path="/owner/maintenance" element={<OwnerMaintenance />} />
          <Route path="/owner/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleGuard allowedRoles={["admin"]}><Layout /></RoleGuard>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
 
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
              <div className="text-center animate-scale-in">
                <p className="text-8xl font-bold text-primary-500 mb-4">404</p>
                <h2 className="text-2xl font-semibold text-surface-900 mb-2">Page Not Found</h2>
                <p className="text-surface-500 mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
