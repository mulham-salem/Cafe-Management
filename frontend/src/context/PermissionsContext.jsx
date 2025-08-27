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

  useEffect(() => {
    async function fetchPermissions() {
      try {
        //const res = await axios.get("/api/user/permissions", {withCredentials: true,});
        //setRole(res.data.role);
        //setPermissions(res.data.permissions);
        setRole(mockRole);
        if (mockRole === "manager") {
          setPermissions(["Default"]);
        } else {
          setPermissions(mockPermissions);
        }
      } catch (err) {
        console.error("Error fetching permissions", err);
        toast.error("Error fetching permissions");
      } finally {
        setLoading(false);
      }
    }
    fetchPermissions();
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, role, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
