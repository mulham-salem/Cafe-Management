import { useState, useEffect } from "react";
import { usePermissions } from "../context/PermissionsContext";
import { Outlet } from "react-router-dom";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)", // overlay شفاف
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const boxStyle = {
  backgroundColor: "#fff",
  padding: "2rem 3rem",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
  minWidth: "300px",
};

const textStyle = {
  margin: 0,
  fontSize: "1.2rem",
  color: "#333",
};

export default function PermissionGuard({
  requiredPermissions,
  permissionMode = "AND",
  requiredRoles = [],
}) {

  const { permissions, role, loading } = usePermissions();
  const [showLoading, setShowLoading] = useState(true);
  
  useEffect (() => {
    if (!loading) {
        const timer = setTimeout(() => setShowLoading(false), 200);
        return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || showLoading) {
    return (
      <div style={{...modalStyle, opacity: (loading || showLoading) ? 1 : 0, transition: "opacity 0.4s ease-in-out"}}>
        <div style={boxStyle}>
          <p style={textStyle}>
           {loading ? "⏳ Loading..." : "⏳ Loading permission..."}  
          </p>
        </div>
      </div>
    );
  }

  if (role === "manager") {
    return <Outlet />;
  }

  
  if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    return (
      <div style={modalStyle}>
        <div style={boxStyle}>
          <p style={textStyle}>🚫 Access Denied</p>
          <small style={{ color: "#666" }}>
            You do not have the required role.
          </small>
        </div>
      </div>
    );
  }

  let hasPermission = true;

  if (permissionMode === "OR") {
    hasPermission = requiredPermissions.some((p) => permissions.includes(p));
  } else {
    hasPermission = requiredPermissions.every((p) => permissions.includes(p));
  }


  if (!hasPermission) {
    return (
      <div style={modalStyle}>
        <div style={boxStyle}>
          <p style={textStyle}>🚫 Access Denied</p>
          <small style={{ color: "#666" }}>
            You do not have the required permissions.
          </small>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
