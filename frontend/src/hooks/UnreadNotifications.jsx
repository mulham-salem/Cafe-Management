import { useEffect, useState } from "react";
import axios from "axios";

function getCurrentToken() {
  const role = sessionStorage.getItem("currentRole");
  if (!role) return null;
  return (
    sessionStorage.getItem(`${role}Token`) ||
    localStorage.getItem(`${role}Token`)
  );
}

export default function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getCurrentToken();
    if (!token) {
      setLoadingCount(false);
      setError("No token found");
      return;
    }

    const axiosInstance = axios.create({
      baseURL: "http://localhost:8000/api",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const fetchUnreadCount = async () => {
      try {
        const res = await axiosInstance.get("/user/notifications/unread-count");
        setUnreadCount(res.data.count); // لازم الـ API ترجع { count: X }
      } catch (err) {
        console.error("Error fetching unread count:", err);
        setError("Failed to load unread notifications");
      } finally {
        setLoadingCount(false);
      }
    };

    fetchUnreadCount();
  }, []); // ✅ مصفوفة فاضية → مرة وحدة بكل تركيب

  return { unreadCount, loadingCount, error };
}