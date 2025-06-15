import React, { useEffect, useState } from 'react';
import styles from '../styles/SupplierNotification.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SupplierNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  useEffect(() => {
    document.title = "Cafe Delights - Supplier Notifications";

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/supplier/notifications', {
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
      await axios.patch(`http://localhost:8000/api/supplier/notifications/${id}/seen`, {}, {
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

  const respond = async (id, response, rejection_reason = '') => {
    try {
      await axios.patch(`http://localhost:8000/api/supplier/notifications/supply-requests/${id}/respond`, {
        response,
        rejection_reason,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
  
      if (response == 'accepted') {
        toast.success('Supply request accepted successfully!');
      } else {
        toast.info('Supply request rejected. Manager will be notified.');
      }
      // بعد الرد، نعتبره تم
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, seen: true } : notif
        )
      );
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Failed to send response.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <ToastContainer />
      <h2 className={styles.pageTitle}>
        <FontAwesomeIcon icon={faBell} className={styles.bellIcon} /> Notifications
      </h2>

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
                <p className={styles.message}>{notif.message}</p>
                <p className={styles.time}>
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
                {notif.purpose === 'supplyRequestFromManager' && !notif.seen && (
                  <div className={styles.responseSection}>
                    <button className={styles.acceptButton} onClick={() => respond(notif.id, 'accepted')}>
                      Accept
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => {
                        const reason = prompt('Enter rejection reason (optional):');
                        respond(notif.id, 'rejected', reason);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
                <p className={styles.sender}>From: {notif.sent_by }</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierNotification;