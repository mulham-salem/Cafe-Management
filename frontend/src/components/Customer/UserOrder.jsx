import React, { useState, useEffect } from 'react';
import styles from '../styles/UserOrder.module.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faCheck, faReceipt, faMugHot } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from 'axios'; 


const UserOrder = () => {

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:8000/api'; 
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.put['Content-Type'] = 'application/json';

  useEffect(() => {
    document.title = "Cafe Delights - User Orders";
  }, []);  

  const [orders, setOrders] = useState([]);
  const [showInvoiceOverlay, setShowInvoiceOverlay] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const fetchOrders = async () => {
    try {
      const response = await axios.get('/user/customer/myOrders');
 
      const fetchedOrders = response.data.data.map(order => ({
        id: order.order_id,
        status: order.status,
        createdAt: new Date(order.created_at).toLocaleString(), 
        canShowBill: order.can_show_bill,
        itemsCount: order.item_count, 
        note: order.note, 
      }));
      setOrders(fetchedOrders);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setOrders([]); 
      } else {
        toast.error('Failed to load orders. Please try again.');
        console.error('Error fetching orders:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const navigate = useNavigate();

  const handleEditOrder = (order) => {
    navigate('/login/customer-home/menu-order', {
        state: {
            editMode: true,
            orderToEdit: order,
        }
    })
  };

  const handleCancelOrder = (orderId) => {
    toast((t) => (
        <span>
          Are you sure you want to cancel this order?
          <div className="toast-buttons-order">
            <button
              onClick={async () => { 
                try {
                  await axios.delete(`/user/customer/orders/cancel/${orderId}`);
                  
                  const updatedOrders = orders.filter((order) => order.id !== orderId);
                  setOrders(updatedOrders);
                  toast.dismiss(t.id);
                  toast.success('Order cancelled successfully!');
                } catch (error) {
                  toast.dismiss(t.id);
                  const errorMessage = error.response?.data?.message || 'Failed to cancel order.';
                  toast.error(errorMessage);
                  console.error('Error cancelling order:', error);
                }
              }}
              className="toast-btn-order confirm-btn-order"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="toast-btn-order cancel-btn-order"
            >
              No
            </button>
          </div>
        </span>
      ),
      {
        toastId: orderId, 
        position: "top-center",
        autoClose: false,
        draggable: false,
        closeButton: false,
        className: 'custom-confirm-toast',
      }
    );
    
  };

  const handleConfirmOrder = async (orderId) => { 
    try {
      await axios.post(`/user/customer/orders/confirm/${orderId}`);
      
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: 'confirmed' } : order
      );
      setOrders(updatedOrders);
      toast.success('Order confirmed successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to confirm order.';
      toast.error(errorMessage);
      console.error('Error confirming order:', error);
    }
  };

  const handleShowInvoice = async (order) => {
    try {
      const response = await axios.get(`/user/customer/myOrders/invoice/${order.id}`);
      const invoiceData = response.data;

      const mappedInvoice = {
        id: order.id, 
        customerName: invoiceData.username,
        items: invoiceData.items.map(item => ({
          name: item.menu_item,
          quantity: item.quantity,
          price: item.price / item.quantity, 
        })),
        totalPrice: invoiceData.total_price, 
      };

      setSelectedInvoice(mappedInvoice);
      setShowInvoiceOverlay(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch invoice.';
      toast.error(errorMessage);
      console.error('Error fetching invoice:', error);
    }
  };
  
  const handleCloseInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceOverlay(false);
  };
  
  return (
    <div className={styles.ordersPage}>
      <ToastContainer />
      <h1 className={styles.pageTitle}><FontAwesomeIcon icon={faMugHot} className={`${styles.icon} ${styles.floatingIcon}`}/>
        My Orders
      </h1>
      <div className={styles.ordersGrid}>
        {loading ? (
          <p className={styles.emptyText}>Loading...</p>
        ) :
        orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span>Order #{order.id}</span>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.orderBody}>
                <p><strong>Date:</strong> {order.createdAt}</p>
                <p><strong>Note:</strong> {order.note}</p> {/* Note is a placeholder now */}
                <p><strong>Items:</strong> {order.itemsCount}</p> {/* This will be 0 initially unless you fetch full order details */}
              </div>

              <div className={styles.actions}>
                {order.status === 'pending' && (
                <button className={styles.editBtn} onClick={() => handleEditOrder(order)}>
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                )}

                {order.status === 'pending' && (
                <button className={styles.cancelBtn} onClick={() => handleCancelOrder(order.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Cancel
                </button>
                )}

                {order.status === 'pending' && (
                  <button className={styles.confirmBtn} onClick={() => handleConfirmOrder(order.id)}>
                    <FontAwesomeIcon icon={faCheck} /> Confirm
                  </button>
                )}

                {/* Only show invoice button if canShowBill is true */}
                {order.canShowBill && ( 
                  <button className={styles.invoiceBtn} onClick={() => handleShowInvoice(order)}>
                    <FontAwesomeIcon icon={faReceipt} /> Invoice
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyOrderList}>No orders to display.</p>
        )}
      </div>

      {showInvoiceOverlay && selectedInvoice && (
       <div className={styles.invoiceOverlay}>
         <div className={styles.invoiceContent}>
           <button className={styles.closeOverlay} onClick={handleCloseInvoice}>×</button>
           <h2>Invoice for Order #{selectedInvoice.id}</h2>

           <p><strong>Customer:</strong> {selectedInvoice.customerName || 'N/A'}</p>
           <ul className={styles.invoiceItems}>
              {selectedInvoice.items.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.quantity} = ${item.price * item.quantity}
               </li>
              ))}
            </ul>

            <p className={styles.totalAmount}>
             Total: ${selectedInvoice.totalPrice}
            </p>
         </div>
        </div>
      )}
    </div>
  );
};

export default UserOrder;
