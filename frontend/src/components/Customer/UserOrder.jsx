import React, { useState, useEffect } from 'react';
import styles from '../styles/UserOrder.module.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faCheck, faReceipt, faMugHot } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";



const UserOrder = () => {

  useEffect(() => {
    document.title = "Cafe Delights - User Orders";
  }, []);  

  const [orders, setOrders] = useState([]);
  const [showInvoiceOverlay, setShowInvoiceOverlay] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
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
              onClick={() => {
                const updatedOrders = orders.filter((order) => order.id !== orderId);
                setOrders(updatedOrders);
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                toast.dismiss(t.id);
                toast.success('Order cancelled successfully!');
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

  const handleConfirmOrder = (orderId) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: 'confirmed' } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    toast.success('Order confirmed successfully!');
  };

  const handleShowInvoice = (order) => {
    setSelectedInvoice(order);
    setShowInvoiceOverlay(true);
  };
  
  const handleCloseInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceOverlay(false);
  };
  

  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);
  
  return (
    <div className={styles.ordersPage}>
      <ToastContainer />
      <h1 className={styles.pageTitle}><FontAwesomeIcon icon={faMugHot} className={`${styles.icon} ${styles.floatingIcon}`}/>
        My Orders
      </h1>
      <div className={styles.ordersGrid}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <span>Order #{order.id}</span>
              <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                {order.status}
              </span>
            </div>

            <div className={styles.orderBody}>
              <p><strong>Date:</strong> {order.createdAt}</p>
              <p><strong>Note:</strong> {order.note || '—'}</p>
              <p><strong>Items:</strong> {order.items?.length || 0}</p>
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

              {order.status === 'delivered' && (
                <button className={styles.invoiceBtn} onClick={() => handleShowInvoice(order)}>
                  <FontAwesomeIcon icon={faReceipt} /> Invoice
                </button>
              )}
            </div>
          </div>
        ))}
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
             Total: $
             {selectedInvoice.items.reduce(
               (sum, item) => sum + item.price * item.quantity,
                0
             )}
            </p>
         </div>
        </div>
      )}
    </div>
  );
};

export default UserOrder;
