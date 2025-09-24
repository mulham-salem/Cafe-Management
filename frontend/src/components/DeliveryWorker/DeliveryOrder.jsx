import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from "axios";
import {
  FaClipboardList,
  FaCheck,
  FaTruck,
  FaCheckCircle,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTruck, faBox } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/DeliveryOrder.module.css";

const mockOrders = [
  {
    id: 101,
    status: "unassigned",
    items: [
      { name: "Cappuccino", quantity: 2, unitPrice: 3.5, totalPrice: 7 },
      {
        name: "Blueberry Muffin",
        quantity: 1,
        unitPrice: 2.5,
        totalPrice: 2.5,
      },
    ],
    estimated_time: "2025-09-01T12:45:00",
    delivery_fee: 1.5,
    pickup_time: "2025-09-01T12:15:00",
    note: "Leave at the doorstep",
    customer: {
      name: "Ali Ahmad",
      address: "123 Main St, Amsterdam",
      phone: "+31 6 12345678",
    },
  },
  {
    id: 102,
    status: "assigned",
    items: [
      { name: "Latte", quantity: 1, unitPrice: 4, totalPrice: 4 },
      { name: "Croissant", quantity: 2, unitPrice: 2, totalPrice: 4 },
    ],
    estimated_time: "2025-09-01T13:00:00",
    delivery_fee: 2,
    pickup_time: "2025-09-01T12:30:00",
    note: "",
    customer: {
      name: "Sara Jansen",
      address: "456 Canal Rd, Amsterdam",
      phone: "+31 6 87654321",
    },
  },
  {
    id: 103,
    status: "inTransit",
    items: [{ name: "Espresso", quantity: 3, unitPrice: 2.5, totalPrice: 7.5 }],
    estimated_time: "2025-09-01T12:50:00",
    delivery_fee: 1,
    pickup_time: "2025-09-01T12:20:00",
    note: "Call upon arrival",
    customer: {
      name: "Mark de Vries",
      address: "789 Park Ave, Amsterdam",
      phone: "+31 6 11223344",
    },
  },
  {
    id: 104,
    status: "delivered",
    items: [{ name: "Espresso", quantity: 3, unitPrice: 2.5, totalPrice: 7.5 }],
    estimated_time: "2025-09-01T12:50:00",
    delivery_fee: 1,
    pickup_time: "2025-09-01T12:20:00",
    note: "Call upon arrival",
    customer: {
      name: "Mark de Vries",
      address: "789 Park Ave, Amsterdam",
      phone: "+31 6 11223344",
    },
  },
];

function OrderCard({ order, onUpdate, onShowDetails }) {
  
  const token =
    sessionStorage.getItem("delivery_workerToken") ||
    localStorage.getItem("delivery_workerToken");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const updateOrderAPI = async (orderId, patch) => {
    const res = await axiosInstance.patch(
      `/user/delivery-worker/delivery-orders/${orderId}`,
      patch
    );
    return res.data;
  };
  const nextAction = () => {
    switch (order.status) {
      case "unassigned":
        return {
          label: "Accept Order",
          next: "assigned",
          icon: <FaCheckCircle />,
        };
      case "assigned":
        return {
          label: "Start Delivery",
          next: "inTransit",
          icon: <FaTruck />,
        };
      case "inTransit":
        return { label: "Delivered", next: "delivered", icon: <FaCheck /> };
      default:
        return null;
    }
  };

  const action = nextAction();

  const handleActionClick = async () => {
    if (!action) return;
    try {
      await updateOrderAPI(order.id, { status: action.next });
      onUpdate(order.id, { status: action.next });
      toast.success(`Order #${order.id} status updated to ${action.next}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  const handleConfirmReceiptClick = (orderId) => {
    toast(
      ({ closeToast }) => (
        <div className="receipt-toast">
          <p>
            Have you delivered the order? <br /> Press confirm to complete the
            delivery.
          </p>
          <div className="receipt-toast-buttons">
            <button
              className="receipt-confirm-btn"
              onClick={() => {
                handleConfirmReceipt(orderId); // your API call
                closeToast();
              }}
            >
              <FaCheck /> Confirm
            </button>
            <button className="receipt-cancel-btn" onClick={closeToast}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </div>
      ),
      {
        toastId: orderId,
        autoClose: false,
        closeButton: false,
        className: "receipt-toast-wrapper",
      }
    );
  };

  const handleConfirmReceipt = async (orderId) => {
    try {
      const response = await axiosInstance.post(
        `/user/delivery-worker/orders/${orderId}/confirm-receipt`
      );
      if (response.status === 200) {
        toast.success("Order marked as delivered!");
        onUpdate(orderId, { status: action.next });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm delivery.");
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 1,
      }}
      whileHover={{
        y: -3,
        transition: { duration: 0.15 },
      }}
      layout
    >
      <div className={styles.cardHeader}>
        <h3>
          <FontAwesomeIcon icon={faBox} /> Order #{order.id}
        </h3>
        <motion.span
          className={`${styles.status} ${styles[order.status]}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {order.status}
        </motion.span>
      </div>

      <p className={styles.customer}>
        <strong>Name:</strong> {order.customer.name}
      </p>
      <p className={styles.address}>
        <strong>Address: </strong> {order.customer.address}
      </p>
      <p className={styles.total}>
        <strong>Total Items:</strong> ${order.total_items_price.toFixed(2)}{" "}
        <strong>-</strong> <strong>Delivery Fee:</strong> ${order.delivery_fee}
      </p>
      <div className={styles.actions}>
        {action && order.status !== "inTransit" && (
          <motion.button
            className={styles.btnPrimary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleActionClick}
          >
            {action.icon} {action.label}
          </motion.button>
        )}
        {order.status === "inTransit" && (
          <motion.button
            className={styles.btnSecondary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleConfirmReceiptClick(order.id)}
          >
            <FaCheck /> Confirm Delivery
          </motion.button>
        )}

        <motion.button
          className={styles.btnDetails}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onShowDetails(order)}
        >
          <FaClipboardList /> Details
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function DeliveryOrder() {
  useEffect(() => {
    document.title = "Cafe Delights - Delivery Order";
  }, []);

  const token =
    sessionStorage.getItem("delivery_workerToken") ||
    localStorage.getItem("delivery_workerToken");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const [orders, setOrders] = useState([]);
  const [detailOrder, setDetailOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateOrder = (id, patch) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );

  const showDetails = (order) => setDetailOrder(order);
  const closeDetails = () => setDetailOrder(null);

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get(
        "/user/delivery-worker/delivery-orders"
      );
      setOrders(res.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setOrders(mockOrders);
      } else {
        toast.error("Failed to load orders. Please try again.");
        console.error("Error fetching orders:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className={styles.page}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
          },
        },
      }}
    >
      <ToastContainer />
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="Back to previous page"
          >
            ← Back
          </button>
        </div>

        <div className={styles.headerCenter}>
          <h1 className={styles.pageTitle}>Delivery Order</h1>
          <p className={styles.subTitle}>
            Delivery Order List - Swipe to confirm actions
          </p>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : orders.length !== 0 ? (
        <section className={styles.list} aria-label="Delivery List">
          <AnimatePresence>
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onUpdate={updateOrder}
                onShowDetails={showDetails}
              />
            ))}
          </AnimatePresence>
        </section>
      ) : (
        <p className={styles.noResults}>no ready order yet</p>
      )}
      <AnimatePresence>
        {detailOrder && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h3>
                  <FontAwesomeIcon icon={faTruck} /> Delivery Details #
                  {detailOrder.id}
                </h3>
                <button
                  className={styles.closeBtn}
                  onClick={closeDetails}
                  aria-label="Close"
                >
                  ✖
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>
                  <strong>Customer:</strong> {detailOrder.customer.name}
                </p>
                <p>
                  <strong>Phone:</strong> {detailOrder.customer.phone}
                </p>
                <p>
                  <strong>Address:</strong> {detailOrder.customer.address}
                </p>
                <p>
                  <strong>City:</strong> {detailOrder.customer.address}
                </p>
                <p>
                  <strong>Note:</strong> {detailOrder.note || "—"}
                </p>
                <p>
                  <strong>Pickup Time:</strong>{" "}
                  {detailOrder.pickup_time
                    ? new Date(detailOrder.pickup_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "ASAP"}
                </p>

                <p>
                  <strong>Estimated Time:</strong>{" "}
                  {detailOrder.estimated_time
                    ? `${Math.max(
                        Math.round(
                          (new Date(detailOrder.estimated_time) - new Date()) /
                            60000
                        ),
                        0
                      )} mins`
                    : "N/A"}
                </p>
                <p>
                  <strong>Items:</strong>
                  <ul>
                    {detailOrder.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity} | Unit: ${item.unitPrice}{" "}
                        | Total: ${item.totalPrice}
                      </li>
                    ))}
                  </ul>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
