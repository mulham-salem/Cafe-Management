import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const useOrderNotifications = () => {
  const previousOrdersRef = useRef([]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'orders') {
        const newOrders = JSON.parse(event.newValue || '[]');
        const prevOrders = previousOrdersRef.current;

        newOrders.forEach((newOrder) => {
          const prevOrder = prevOrders.find((o) => o.id === newOrder.id);

          if ( newOrder.status === 'ready' && (!prevOrder || prevOrder.status !== 'ready')) {
            toast.info(`Your order #${newOrder.id} is ready! ☕️`, {
              autoClose: 5000,
              icon: false,
              hideProgressBar: true,
              className: "ready-custom-toast",
              bodyClassName: "ready-custom-toast-body",
            });
          }
        });
        previousOrdersRef.current = newOrders;
      }
    };

    window.addEventListener('storage', handleStorageChange);

    previousOrdersRef.current = JSON.parse(localStorage.getItem('orders') || '[]');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};

export default useOrderNotifications;



