import React, { useEffect } from 'react';
import styles from '../styles/ManagerNotification.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';

const ManagerNotification = () => {

  useEffect(() => {
     document.title = "Cafe Delights - Manager Notifications";
  }, []);

  const notifications = [
    {
      id: 1,
      message: 'New supply offer received from Supplier A.',
      createdAt: '2025-05-28 14:33',
      seen: true,
    },
    {
      id: 1,
      message: 'New supply offer received from Supplier A.',
      createdAt: '2025-05-28 14:33',
      seen: true,
    },
    {
      id: 1,
      message: 'New supply offer received from Supplier A.',
      createdAt: '2025-05-28 14:33',
      seen: true,
    },
    {
      id: 1,
      message: 'New supply offer received from Supplier A.',
      createdAt: '2025-05-28 14:33',
      seen: false,
    },
    {
      id: 1,
      message: 'New supply offer received from Supplier A.',
      createdAt: '2025-05-28 14:33',
      seen: false,
    },
    {
      id: 1,
      message: 'New supply offer received from Supplier A.',
      createdAt: '2025-05-28 14:33',
      seen: false,
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.pageTitle}><FontAwesomeIcon icon={faBell} className={styles.bellIcon}/> Notifications</h2>

      {notifications.length === 0 ? (
        <p className={styles.emptyText}>No notifications available.</p>
      ) : (
        <div className={styles.list}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.card} ${notif.seen ? styles.seen : styles.unseen}`}
            >
              <div className={styles.icon}>
                <FontAwesomeIcon icon={notif.seen ? faCheckCircle : faClock} />
              </div>
              <div className={styles.content}>
                <p className={styles.message}>{notif.message}</p>
                <p className={styles.time}>{notif.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerNotification;
