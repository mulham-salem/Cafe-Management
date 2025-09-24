import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    
  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if (!role) return null;
    return (
      sessionStorage.getItem(`${role}Token`) ||
      localStorage.getItem(`${role}Token`)
    );
  }

  const token = getCurrentToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
