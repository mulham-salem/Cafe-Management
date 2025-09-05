import { createContext, useContext, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "../components/styles/toastStyles.css";
import axios from 'axios';

const OrderNotificationContext = createContext();

export const OrderNotificationProvider = ({ children }) => {

  const previousOrdersRef = useRef([]);
  const token = sessionStorage.getItem('customerToken') || localStorage.getItem('customerToken');

  useEffect(() => {

    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/customer/orders/short', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newOrders = response.data.orders;

        const prevOrders = previousOrdersRef.current;

        const notifiedIds = new Set(
          JSON.parse(localStorage.getItem('notifiedOrders') || '[]')
        );

        newOrders.forEach((newOrder) => {
          const prevOrder = prevOrders.find((o) => o.id === newOrder.id);

          const isNowReady = newOrder.status === 'ready';
          const wasNotified = notifiedIds.has(newOrder.id);

          if (isNowReady && (!prevOrder || prevOrder.status !== 'ready') && !wasNotified) {
            toast.info(`☕️ Your order #${newOrder.id} is ready!`,
            {
              autoClose: 5000,
              icon: false,
              hideProgressBar: true,
              className: "ready-custom-toast",
              bodyClassName: "ready-custom-toast-body",
            });

            notifiedIds.add(newOrder.id);
            localStorage.setItem('notifiedOrders', JSON.stringify([...notifiedIds]));
          }
        });
        previousOrdersRef.current = newOrders;
      } catch (error) {
        console.error('Failed to fetch orders', error);
      }
    };
  
    fetchOrders();

  
    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <OrderNotificationContext.Provider value={{}}>
      {children}
    </OrderNotificationContext.Provider>
  );
};