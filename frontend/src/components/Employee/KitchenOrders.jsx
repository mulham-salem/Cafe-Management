import React, { useEffect, useState, useContext, useCallback } from 'react';
import styles from '../styles/KitchenOrders.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { OrderSearchContext } from './EmployeeHome';
import axios from 'axios'; // Import Axios

const KitchenOrders = () => {

  useEffect(() => {
    document.title = "Cafe Delights - Kitchen";
  }, []);  

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  // دالة لجلب الطلبات من الـ API
  const fetchOrders = useCallback(async () => {
  
    try {
      const response = await axios.get('http://localhost:8000/api/user/employee/kitchen/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // الـ Backend يرجع 'data' كـ array من الطلبات
      setOrders(response.data.data.map(order => ({
        id: order.order_id, // تغيير order_id إلى id ليتوافق مع الـ frontend
        status: order.status,
        items: order.orderItems.map(item => ({
          name: item.item_name,
          quantity: item.quantity,
          price: item.price,
        }))
      })));
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); 

  // جلب الطلبات عند تحميل المكون لأول مرة
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {

    if (newStatus === "") {
      return;
    }
    const order = orders.find(o => o.id === orderId); // 
    if (!order) return; // 

    // التحقق من صلاحية الانتقال للحالة بناءً على ترتيب الـ Backend
    // Backend يسمح بـ: confirmed -> preparing, preparing -> ready, ready -> delivered
    const allowedTransitions = {
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'delivered',
    };

    if (allowedTransitions[order.status] !== newStatus) {
      toast.warning("Cannot move to this status before completing the previous one or this transition is invalid!"); // 
      return; // 
    }

    try {
      const response = await axios.put(`http://localhost:8000/api/user/employee/kitchen/orders/${orderId}/status`, {
        status: newStatus,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend يرجع 'status' و 'order' عند النجاح
      if (response.data.status) {
        toast.success(response.data.status); // استخدم رسالة النجاح من الـ Backend

        // تحديث حالة الطلبات في الواجهة الأمامية
        const updatedOrders = orders.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        );
        setOrders(updatedOrders); // 

        if (newStatus === 'ready' && response.data.notifiedCustomer) { // 
          // Backend يقوم بإرسال الإشعارات للعميل، هذا الـ toast هو مجرد تأكيد للـ employee
          setTimeout(() => {
            toast.info("The customer has been notified that the order is ready.");
          }, 5000); // 
        }
      } else if (response.data.error) {
          toast.error(response.data.error); // رسالة الخطأ من الـ Backend
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to update order status. Please try again.";
      toast.error(errorMessage);
    }
  };


  const searchTerm = useContext(OrderSearchContext);

  // حالة للتعامل مع الطلبات المفلترة بالبحث
  const [filteredOrders, setFilteredOrders] = useState([]);
  const validStatusFlow = ['confirmed', 'preparing', 'ready', 'delivered']; //  أضف 'confirmed' كحالة أولية

  // تحديث الطلبات المفلترة عند تغيير الـ searchTerm أو الـ orders
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      // جلب طلب واحد بالـ ID من الـ API للبحث
      const searchSingleOrder = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/user/employee/orders/search?order_id=${searchTerm}&statuses=${validStatusFlow}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const fetchedOrder = response.data.data;
          setFilteredOrders([{
            id: fetchedOrder.order_id,
            status: fetchedOrder.status,
            // بيانات الأصناف غير متوفرة في استجابة searchOrder، قد تحتاج لتعديل الـ Backend أو جلبها بشكل منفصل إذا كانت ضرورية هنا
            items: orders.find(o => o.id === fetchedOrder.order_id)?.items || [] // محاولة جلب الأصناف من الطلبات الموجودة
          }]);
        } catch (error) {
          console.error('Error searching order:', error);
          if (error.response && error.response.status === 404) {
            setFilteredOrders([]); // لا يوجد طلب مطابق
          } else {
            toast.error("Failed to search order. Please try again.");
          }
        } finally {
          setIsSearching(false);
        }
      };

      const handler = setTimeout(() => {
        searchSingleOrder();
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [searchTerm, orders]); //  يعتمد على searchTerm و orders
  
  return (
    <div className={styles.kitchenPage}>
      <ToastContainer />
      <h1 className={styles.pageTitle}>Active Kitchen Orders</h1>
      {loading ? (
        <p className={styles.emptyText}>Loading...</p>
      ) : isSearching ? (
        <p className={styles.emptyText}>Searching...</p>
      ) : searchTerm.trim() !== '' ? (
        filteredOrders.length > 0 ? (
          <div className={styles.ordersGrid}>
            {filteredOrders.map((order) => (
              <div className={styles.orderCard} key={order.id}>
                <div className={styles.orderHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FontAwesomeIcon icon={faUtensils} className={styles.icon} />
                    <h3>Order #{order.id}</h3>
                  </div>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <ul className={styles.itemList}>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                )}

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
        ) : (
          <p className={styles.noResults}>No matching orders found.</p>
        )
      ) : orders.length === 0 ? (
        <p className={styles.noOrders}>No active orders at the moment.</p>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map((order) => (
            <div className={styles.orderCard} key={order.id}>
              <div className={styles.orderHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FontAwesomeIcon icon={faUtensils} className={styles.icon} />
                  <h3>Order #{order.id}</h3>
                </div>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status}
                </span>
              </div>

              {order.items && order.items.length > 0 && (
                <ul className={styles.itemList}>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              )}

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