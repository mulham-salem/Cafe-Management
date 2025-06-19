import React, { useEffect, useState } from 'react';
import styles from '../styles/EmployeeNotification.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from 'axios';


const EmployeeNotification = () => {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Optional: Show loading state
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken'); // أو sessionStorage.getItem() إذا مخزن فيه

  useEffect(() => {
     document.title = "Cafe Delights - Employee Notifications";
     
     const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/employee/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          withCredentials: true, // لو بتستخدم Laravel Sanctum مع الكوكيز (optional)
        });
  
        setNotifications(response.data.notifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotifications();
  }, []);

  const markAsSeen = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/user/employee/notifications/${id}/seen`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // تحديث محلي للحالة
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, seen: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking as seen:', err);
    }
  };

  return (
    <div className={styles.pageWrapper}>
       <ToastContainer />
      <h2 className={styles.pageTitle}><FontAwesomeIcon icon={faBell} className={styles.bellIcon}/> Notifications</h2>

      {loading ? (
        <p className={styles.emptyText}>Loading...</p>
      ) : error ? (
        <p className={styles.emptyText}>{error}</p>
      ) : notifications.length === 0 ? (
        <p className={styles.emptyText}>No notifications available.</p>
      ) : (
        <div className={styles.list}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.card} ${notif.seen ? styles.seen : styles.unseen}`}
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

export default EmployeeNotification;
