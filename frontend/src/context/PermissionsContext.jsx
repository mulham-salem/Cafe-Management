import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PermissionsContext = createContext();

const mockPermissions = [
  "User Management",
  "Menu Management",
  "Inventory Management",
  "Supply Management",
  "Promotion Management",
  "Report Dashboard",
];

const mockRole = "manager";

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if ( !role ) return null;
    return sessionStorage.getItem(`${role}Token`) || localStorage.getItem(`${role}Token`);
  }
  const token = getCurrentToken();

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  useEffect(() => {
    if ( !token ) return;
    async function fetchPermissions() {
      try {
        const res = await axiosInstance.get("/user/me", {
          withCredentials: true,
        });
        setRole(res.data.role);
        if (role === "manager") {
          setPermissions(["Default"]);
        } else {
          setPermissions(res.data.permissions);
        }
      } catch (err) {
        console.error("Error fetching permissions", err);
        toast.error("Error fetching permissions, mockData will be applied");
        setRole(mockRole);
        if (mockRole === "manager") {
          setPermissions(["Default"]);
        } else {
          setPermissions(mockPermissions);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPermissions();
  }, [token]);

  return (
    <PermissionsContext.Provider value={{ permissions, role, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
