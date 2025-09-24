import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import echo from "../../echo";

const useChattingNotification = () => {
  /* -------------------------
   Axios client
  ------------------------- */
  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if (!role) return null;
    return (
      sessionStorage.getItem(`${role}Token`) ||
      localStorage.getItem(`${role}Token`)
    );
  }

  const token = getCurrentToken();

  const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  async function fetchCurrentUser() {
    try {
      const res = await apiClient.get("/user/current-user");
      return res.data.id;
    } catch (err) {
      console.error("Error fetching current user:", err);
      toast.error("Error fetching current user");
      return null;
    }
  }

  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user ID once token is available
  useEffect(() => {
    if (!token) return;
    fetchCurrentUser().then((userId) => {
      if (userId) setCurrentUserId(userId);
    });
  }, [token]);

  // Subscribe to private/public channel once currentUserId is known
  useEffect(() => {
    if (!currentUserId) return;

    try {
      const channelName = `messages.${currentUserId}`;
      const channel = echo.channel(channelName);

      const handler = (e) => {
        console.log("Received notification via WebSocket:", e);
        const senderName = e.message.sender_name ?? "Unknown";

        setTimeout(() => {
          toast.info(`📩 New message from ${senderName}`, {
            theme: "dark",
            autoClose: 4000,
          });
        }, 2000);
      };

      channel.listen(".message.sent", handler);

      // cleanup
      return () => {
        echo.leaveChannel(channelName);
      };
    } catch (error) {
      console.error("Failed to set up WebSocket:", error);
      toast.error("Real-time notifications unavailable");
    }
  }, [currentUserId]);
};

export default useChattingNotification;
