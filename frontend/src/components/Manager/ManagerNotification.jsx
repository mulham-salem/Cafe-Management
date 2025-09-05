import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ManagerNotification.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const ManagerNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if (!role) return null;
    return (
      sessionStorage.getItem(`${role}Token`) ||
      localStorage.getItem(`${role}Token`)
    );
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
    document.title = "Cafe Delights - Manager Notifications";

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/admin/notifications");

        setNotifications(response.data.notifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsSeen = async (id) => {
    try {
      await axiosInstance.patch(`/admin/notifications/${id}/seen`);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, seen: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking as seen:", err);
    }
  };

  return (
    <div className="mngNotPageWrapper">
      <h2 className="pageTitle">
        <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />{" "}
        Notifications
      </h2>

      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : error ? (
        <p className={styles.emptyText}>{error}</p>
      ) : notifications.length === 0 ? (
        <p className={styles.emptyText}>No notifications available.</p>
      ) : (
        <div className="list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.card} ${
                notif.seen ? styles.seen : styles.unseen
              }`}
              onClick={() => !notif.seen && markAsSeen(notif.id)}
            >
              <div className={styles.icon}>
                <FontAwesomeIcon icon={notif.seen ? faCheckCircle : faClock} />
              </div>
              <div className={styles.content}>
                <strong className={styles.title}>{notif.purpose}</strong>
                <p className={styles.message}>{notif.message}</p>
                <p className={styles.time}>
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
                <p className={styles.sender}>from: {notif.sent_by}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerNotification;
