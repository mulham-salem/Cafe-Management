import React, { useEffect, useState } from 'react';
import styles from '../styles/KitchenOrders.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

const KitchenOrders = () => {

  useEffect(() => {
    document.title = "Cafe Delights - Kitchen";
  }, []);  

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const confirmedOrders = storedOrders.filter(order => (order.status === 'confirmed'));
    setOrders(confirmedOrders);
  }, []);

  const validStatusFlow = ['preparing', 'ready', 'delivered'];

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus !== "") {

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const currentIndex = validStatusFlow.indexOf(order.status);
      const newIndex = validStatusFlow.indexOf(newStatus);

      if (newIndex !== currentIndex + 1) {
        toast.error("⚠️ Cannot move to this status before completing the previous one.");
        return;
      }
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
      const updatedAllOrders = allOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
      toast.success(`Order status updated to ${newStatus}`);   

      if (newStatus === 'ready') {
        setTimeout(() => {
          toast.info("The customer has been notified that the order is ready.");
        }, 5000);
      } 
    }
  };

  return (
    <div className={styles.kitchenPage}>
      <ToastContainer />
      <h1 className={styles.pageTitle}>Active Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p className={styles.noOrders}>No active orders at the moment.</p>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map(order => (
            <div className={styles.orderCard} key={order.id}>
              <div className={styles.orderHeader}>
                <FontAwesomeIcon icon={faUtensils} className={styles.icon}/>
                <h3>Order #{order.id}</h3>
              </div>

              <ul className={styles.itemList}>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>

              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Status: </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value=""> ⚙️ Update Status </option>
                  <option value="preparing"> ⏳ Preparing </option>
                  <option value="ready"> 🚀 Ready </option>
                  <option value="delivered"> 🚚 Delivered </option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenOrders;