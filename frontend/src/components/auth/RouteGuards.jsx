import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../../store/slices/authSlice";
import Loader from "../ui/Loader";


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

 
const RoleGuard = ({ children, allowedRoles }) => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    
    const dashboardMap = {
      student: "/student/dashboard",
      owner: "/owner/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={dashboardMap[user?.role] || "/"} replace />;
  }

  return children;
};

 
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (isAuthenticated && user) {
    const dashboardMap = {
      student: "/student/dashboard",
      owner: "/owner/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/"} replace />;
  }

  return children;
};

export { ProtectedRoute, RoleGuard, PublicRoute };
