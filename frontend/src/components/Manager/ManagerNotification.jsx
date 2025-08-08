import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/ManagerNotification.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';

const ManagerNotification = () => {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken'); 

  useEffect(() => {
    document.title = "Cafe Delights - Manager Notifications";

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/manager/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          withCredentials: true,
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
      await axios.patch(`http://localhost:8000/api/manager/notifications/${id}/seen`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

  
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
      <h2 className={styles.pageTitle}>
        <FontAwesomeIcon icon={faBell} className={styles.bellIcon} /> Notifications
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

export default ManagerNotification;
