import { useState, useEffect, useContext, useMemo } from "react";
import styles from "../styles/UserOrder.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faCheck,
  faTimes,
  faReceipt,
  faMugHot,
  faEllipsisVertical,
  faPause,
  faInfoCircle,
  faArrowRotateBack,
  faRefresh,
  faHeart,
  faCircleExclamation,
  faDollarSign,
  faClock,
  faMapMarkedAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from "axios";
import { CusSearchContext } from "./CustomerHome";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import InvoiceOverlay from "./InvoiceOverlay";
import PaymentModal from "./PaymentModal";
import RatingModal from "./RatingModal";

const mockOrders = [
  {
    id: "001",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    itemsCount: 2,
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 12.99 },
      { name: "Caesar Salad", quantity: 1, price: 8.99 },
    ],
    note: "Extra cheese on pizza",
    canShowBill: "",
  },
  {
    id: "002",
    status: "confirmed",
    createdAt: "2024-01-15T11:15:00Z",
    receiptMethod: "Takeaway",
    receiptTime: "2024-01-15T12:30:00Z",
    itemsCount: 2,
    items: [
      { name: "Chicken Burger", quantity: 2, price: 9.99 },
      { name: "French Fries", quantity: 1, price: 4.99 },
    ],
    note: "No onions in burgers",
    canShowBill: "",
  },
  {
    id: "003",
    status: "preparing",
    createdAt: "2024-01-15T12:00:00Z",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    itemsCount: 2,
    items: [
      { name: "Spaghetti Carbonara", quantity: 1, price: 14.99 },
      { name: "Garlic Bread", quantity: 1, price: 5.99 },
    ],
    note: "",
    canShowBill: "",
  },
  {
    id: "004",
    status: "ready",
    createdAt: "2024-01-15T13:20:00Z",
    receiptMethod: "Takeaway",
    receiptTime: "ASAP",
    itemsCount: 2,
    items: [
      { name: "Vegetable Stir Fry", quantity: 1, price: 11.99 },
      { name: "Steamed Rice", quantity: 2, price: 3.99 },
    ],
    note: "Extra spicy",
    canShowBill: "",
  },
  {
    id: "005",
    status: "delivered",
    createdAt: "2024-01-15T14:10:00Z",
    receiptMethod: "Takeaway",
    receiptTime: "2024-01-15T15:00:00Z",
    itemsCount: 2,
    items: [
      { name: "Grilled Salmon", quantity: 1, price: 18.99 },
      { name: "Roasted Vegetables", quantity: 1, price: 7.99 },
    ],
    note: "Well done salmon",
    canShowBill: 1,
  },
  {
    id: "006",
    status: "delivered",
    createdAt: "2024-01-15T15:30:00Z",
    receiptMethod: "Delivery",
    receiptTime: "ASAP",
    itemsCount: 2,
    items: [
      { name: "Pepperoni Pizza", quantity: 1, price: 13.99 },
      { name: "Coca Cola", quantity: 2, price: 2.99 },
    ],
    note: "Please ring bell",
    canShowBill: "1",
    deliveryDetails: {
      name: "John Smith",
      address: "123 Main Street",
      city: "New York",
      phone: "+1-555-0123",
      deliveryFee: 3.99,
      ETA: "25 minutes",
    },
  },
  {
    id: "007",
    status: "assigned",
    createdAt: "2024-01-15T16:45:00Z",
    receiptMethod: "Delivery",
    receiptTime: "2024-01-15T18:00:00Z",
    itemsCount: 3,
    items: [
      { name: "Chicken Tikka Masala", quantity: 1, price: 15.99 },
      { name: "Naan Bread", quantity: 2, price: 3.49 },
      { name: "Mango Lassi", quantity: 1, price: 4.99 },
    ],
    note: "Leave at door",
    canShowBill: "",
    deliveryDetails: {
      name: "Sarah Johnson",
      address: "456 Oak Avenue",
      city: "Brooklyn",
      phone: "+1-555-0456",
      deliveryFee: 4.99,
      ETA: "20 minutes",
    },
  },
  {
    id: "008",
    status: "inTransit",
    createdAt: "2024-01-15T17:20:00Z",
    receiptMethod: "Delivery",
    receiptTime: "ASAP",
    itemsCount: 2,
    items: [
      { name: "Beef Burrito", quantity: 2, price: 10.99 },
      { name: "Guacamole", quantity: 1, price: 3.99 },
    ],
    note: "Call upon arrival",
    canShowBill: "",
    deliveryDetails: {
      name: "Mike Wilson",
      address: "789 Pine Road",
      city: "Queens",
      phone: "+1-555-0789",
      deliveryFee: 2.99,
      ETA: "15 minutes",
    },
  },
  {
    id: "009",
    status: "delivered",
    createdAt: "2024-01-15T18:40:00Z",
    receiptMethod: "Delivery",
    receiptTime: "2024-01-15T19:30:00Z",
    itemsCount: 2,
    items: [
      { name: "Sushi Platter", quantity: 1, price: 24.99 },
      { name: "Miso Soup", quantity: 2, price: 3.49 },
    ],
    note: "",
    canShowBill: 1,
    deliveryDetails: {
      name: "Emily Chen",
      address: "321 Elm Street",
      city: "Manhattan",
      phone: "+1-555-0321",
      deliveryFee: 5.99,
      ETA: "30 minutes",
    },
  },
  {
    id: "010",
    status: "preparing",
    createdAt: "2024-01-15T19:15:00Z",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    itemsCount: 3,
    items: [
      { name: "Ribeye Steak", quantity: 1, price: 29.99 },
      { name: "Mashed Potatoes", quantity: 1, price: 6.99 },
      { name: "House Salad", quantity: 1, price: 7.99 },
    ],
    note: "Steak medium rare",
    canShowBill: "",
  },
  {
    id: "011",
    status: "confirmed",
    createdAt: "2024-01-15T20:00:00Z",
    receiptMethod: "Takeaway",
    receiptTime: "2024-01-15T21:00:00Z",
    itemsCount: 2,
    items: [
      { name: "Vegetable Curry", quantity: 1, price: 12.99 },
      { name: "Basmati Rice", quantity: 2, price: 4.99 },
    ],
    note: "Mild spice level",
    canShowBill: "",
  },
  {
    id: "012",
    status: "onHold",
    createdAt: "2024-01-15T21:30:00Z",
    receiptMethod: "Delivery",
    receiptTime: "ASAP",
    itemsCount: 3,
    items: [
      { name: "BBQ Chicken Wings", quantity: 1, price: 13.99 },
      { name: "Coleslaw", quantity: 1, price: 4.99 },
      { name: "Lemonade", quantity: 3, price: 2.49 },
    ],
    note: "Extra napkins please",
    canShowBill: "",
    deliveryDetails: {
      name: "David Brown",
      address: "654 Maple Lane",
      city: "Bronx",
      phone: "+1-555-0654",
      deliveryFee: 3.49,
      ETA: "35 minutes",
    },
  },
];

const UserOrder = () => {
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:8000/api";
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers.put["Content-Type"] = "application/json";

  useEffect(() => {
    document.title = "Cafe Delights - User Orders";
  }, []);

  const [orders, setOrders] = useState([]);
  const [showInvoiceOverlay, setShowInvoiceOverlay] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentOrderForRating, setCurrentOrderForRating] = useState(null);

  const fetchOrders = async () => {
    try {
      // const response = await axios.get('/user/customer/myOrders');

      // const fetchedOrders = response.data.data.map(order => ({
      //   id: order.order_id,
      //   status: order.status,
      //   createdAt: new Date(order.created_at).toLocaleString(),
      //   canShowBill: order.can_show_bill,
      //   receiptMethod: order.receiptMethod,
      //   receiptTime: order.receiptTime,
      //   note: order.note,
      //   itemsCount: order.item_count,
      //   items: order.items.map((item) => ({
      //   name: item.name,
      //   price: item.price,
      //   quantity: item.quantity,
      //  })),
      // deliveryDetails: order.delivery_details
      //   ? {
      //       name: order.delivery_details.name,
      //       address: order.delivery_details.address,
      //       city: order.delivery_details.city,
      //       phone: order.delivery_details.phone,
      //       deliveryFee: order.delivery_details.delivery_fee,
      //       ETA: order.delivery_details.eta,
      //     }
      //   : null,
      // }));
      // setOrders(fetchedOrders);
      setOrders(mockOrders);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setOrders([]);
      } else {
        toast.error("Failed to load orders. Please try again.");
        console.error("Error fetching orders:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const { searchQuery, setSearchPlaceholder } = useContext(CusSearchContext);
  setSearchPlaceholder("Search by ID...");

  const filteredUserOrder = useMemo(() => {
    return orders.filter(
      (item) => searchQuery === "" || item.id.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  const navigate = useNavigate();

  const handleEditOrder = (order) => {
    navigate("/login/customer-home/menu-order", {
      state: {
        editMode: true,
        orderToEdit: order,
      },
    });
  };

  const handleCancelOrder = (orderId) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to cancel this order?
          <div className="toast-buttons-order">
            <button
              onClick={async () => {
                try {
                  await axios.delete(`/user/customer/orders/cancel/${orderId}`);

                  const updatedOrders = orders.filter(
                    (order) => order.id !== orderId
                  );
                  setOrders(updatedOrders);
                  toast.dismiss(t.id);
                  toast.success("Order cancelled successfully!");
                } catch (error) {
                  toast.dismiss(t.id);
                  const errorMessage =
                    error.response?.data?.message || "Failed to cancel order.";
                  toast.error(errorMessage);
                  console.error("Error cancelling order:", error);
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
        className: "custom-confirm-toast",
      }
    );
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await axios.post(`/user/customer/orders/confirm/${orderId}`);

      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: "confirmed" } : order
      );
      setOrders(updatedOrders);
      toast.success("Order confirmed successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to confirm order.";
      toast.error(errorMessage);
      console.error("Error confirming order:", error);
    }
  };

  const mockInvoice = {
    id: "006",
    receiptMethod: "Delivery",
    customerName: "John Smith",
    items: [
      { name: "Pepperoni Pizza", quantity: 1, price: 13.99 },
      { name: "Coca Cola", quantity: 2, price: 2.99 },
    ],
    deliveryDetails: {
      deliveryFee: 3.99,
    },
    totalPrice: 20.97,
    loyalty: {
      balance: 1250, // points the user owns
      pointValue: 0.01, // 1 pt = $0.01
    },
  };

  const handleShowInvoice = async (order) => {
    try {
      // const response = await axios.get(
      //   `/user/customer/myOrders/invoice/${order.id}`
      // );
      // const invoiceData = response.data;

      // const mappedInvoice = {
      //   id: order.id,
      //   customerName: invoiceData.username,
      //   receiptMethod: invoiceData.receiptMethod,
      //   items: invoiceData.items.map((item) => ({
      //     name: item.menu_item,
      //     quantity: item.quantity,
      //     price: item.price / item.quantity,
      //   })),
      //  deliveryDetails: invoiceData.deliveryDetails.deliveryFee || null,
      //   totalPrice: invoiceData.total_price,
      ///  loyaltyBalance: invoiceData.loyalty.balance,
      //   loyaltyPointValue: invoiceData.loyalty.pointVAlue,
      // };

      // setSelectedInvoice(mappedInvoice);
      setSelectedInvoice(mockInvoice);
      setShowInvoiceOverlay(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch invoice.";
      toast.error(errorMessage);
      console.error("Error fetching invoice:", error);
    }
  };

  const handleCloseInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceOverlay(false);
  };

  const openPaymentModal = (payload) => {
    setPaymentPayload(payload);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentPayload(null);
  };

  const handlePaid = async (orderId) => {
    try {
      // await axios.post(`/api/orders/${orderId}/mark-paid`);

      // Find the paid order in mockOrders
      const paidOrder = orders.find((o) => o.id === orderId);

      if (paidOrder) {
        setCurrentOrderForRating(paidOrder);
        setTimeout(() => {
          setShowRatingModal(true); // show rating modal
        }, 6000);
      }
    } catch (error) {
      toast.error("Payment completed, but failed to trigger rating modal.");
    }
  };

  const handleCashChosen = async (orderId) => {
    try {
      // await axios.post(`/api/orders/${orderId}/mark-paid`);

      // Find the paid order in mockOrders
      const paidOrder = orders.find((o) => o.id === orderId);

      if (paidOrder) {
        setCurrentOrderForRating(paidOrder);
        setTimeout(() => {
          setShowRatingModal(true); // show rating modal
        }, 6000);
      }
    } catch {
      /* noop */
    }
  };

  const [activeMenu, setActiveMenu] = useState(null);

  // دالة لفتح/إغلاق القائمة
  const handleMenuToggle = (e, orderId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === orderId ? null : orderId);
  };

  // دالة لإغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handlePutOnHold = async (orderId) => {
    setActiveMenu(null);
    try {
      const res = await axios.post(
        `/api/orders/${orderId}/suspend`, // adjust API path as in your backend
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Order has been suspended successfully!");
        return res.data;
      } else {
        toast.warning("Order could not be suspended. Try again later.");
      }
    } catch (error) {
      console.error("Suspend order error:", error);
      toast.error(
        error.response?.data?.message || "Failed to suspend the order."
      );
    }
  };

  const handleResumeOrder = async (orderId) => {
    setActiveMenu(null);
    try {
      const res = await axios.post(
        `/api/orders/${orderId}/resume`, // adjust API path as in your backend
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Order has been resumed successfully!");
        return res.data;
      } else {
        toast.warning("Order could not be resumed. Try again later.");
      }
    } catch (error) {
      console.error("Resume order error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resume the order."
      );
    }
  };

  const handleRePreparationOrder = async (orderId) => {
    setActiveMenu(null);
    if (!reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    setLoading(true);
    try {
      // Example API endpoint - adjust to your backend route
      await axios.post("/api/orders/reprepare", {
        orderId,
        reason,
      });
      toast.success("Your re-preparation request was sent successfully!");
      setReason("");
      setOpen(false);
    } catch (error) {
      console.error("Re-preparation request failed:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId) => {
    setActiveMenu(null);
    try {
      const res = await axios.post(
        `/api/orders/${orderId}/reorder`, // adjust API path as in your backend
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Order has been sent to kitchen successfully");
        return res.data;
      } else {
        toast.warning("Order could not be request now. Try again later.");
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(
        error.response?.data?.message || "Failed to request the order."
      );
    }
  };

  const handleConfirmReceiptClick = (orderId) => {
    toast(
      ({ closeToast }) => (
        <div className="receipt-toast">
          <p>
            Have you received your order? <br /> Press confirm to complete the
            receipt.
          </p>
          <div className="receipt-toast-buttons">
            <button
              className="receipt-confirm-btn"
              onClick={() => {
                handleConfirmReceipt(orderId); // your API call
                closeToast();
              }}
            >
              <FontAwesomeIcon icon={faCheck} /> Confirm
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
      const response = await axios.post(
        `/api/orders/${orderId}/confirm-receipt`
      );
      if (response.status === 200) {
        toast.success("Order marked as delivered!");
        // تحديث الحالة محليًا إذا كنت تستخدم state
        // setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'delivered'} : o));
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm receipt.");
    }
  };

  return (
    <div className={styles.ordersPage}>
      <h1 className={styles.pageTitle}>
        <FontAwesomeIcon
          icon={faMugHot}
          className={`${styles.icon} ${styles.floatingIcon}`}
        />
        My Orders
      </h1>
      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : filteredUserOrder.length === 0 ? (
        <p className={styles.emptyOrderList}>
          {searchQuery
            ? `No order Id match "${searchQuery}"`
            : "No orders to display."}
        </p>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredUserOrder.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span>Order #{order.id}</span>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status}
                </span>

                {(order.status === "preparing" ||
                  order.status === "delivered" ||
                  order.status === "onHold") && (
                  <div className={styles.orderActionsMenu}>
                    <button
                      className={styles.menuToggle}
                      onClick={(e) => handleMenuToggle(e, order.id)}
                      aria-label="Order actions menu"
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>

                    {activeMenu === order.id && (
                      <div className={styles.menuDropdown}>
                        {order.status === "preparing" && (
                          <button
                            className={styles.menuItem}
                            onClick={() => handlePutOnHold(order.id)}
                          >
                            <FontAwesomeIcon
                              icon={faPause}
                              className={styles.pauseIcon}
                            />
                            Put on Hold
                          </button>
                        )}
                        {order.status === "onHold" && (
                          <button
                            className={styles.menuItem}
                            onClick={() => handleResumeOrder(order.id)}
                          >
                            <FontAwesomeIcon
                              icon={faArrowRotateBack}
                              className={styles.resumeIcon}
                            />
                            Resume
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <button
                            className={styles.menuItem}
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setOpen(true);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faRefresh}
                              className={styles.rePrepIcon}
                            />
                            Re-preparation
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <button
                            className={styles.menuItem}
                            onClick={() => handleReorder(order.id)}
                          >
                            <FontAwesomeIcon
                              icon={faHeart}
                              className={styles.reorderIcon}
                            />
                            Reorder
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <button
                            className={styles.menuItem}
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className={styles.trashIcon}
                            />
                            Delete Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.orderBody}>
                <p>
                  <strong>Date:</strong> {order.createdAt}
                </p>
                <p className={styles.receiptInfo}>
                  <strong>Receipt Method:</strong> {order.receiptMethod}
                  {order.receiptMethod === "Delivery" &&
                    order.deliveryDetails && (
                      <div className={styles.receiptTooltipContainer}>
                        <span className={styles.tooltipIcon}>
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </span>
                        <div className={styles.receiptTooltip}>
                          <h4>Delivery Details</h4>
                          <ul className={styles.receiptList}>
                            <li>
                              <strong>Name:</strong>{" "}
                              {order.deliveryDetails.name}
                            </li>
                            <li>
                              <strong>Address:</strong>{" "}
                              {order.deliveryDetails.address}
                            </li>
                            <li>
                              <strong>City:</strong>{" "}
                              {order.deliveryDetails.city}
                            </li>
                            <li>
                              <strong>Phone:</strong>{" "}
                              {order.deliveryDetails.phone}
                            </li>
                            <li>
                              <span
                                className={`${styles.deliveryBadge} ${styles.feeBadge}`}
                              >
                                <strong>Delivery Fee:</strong>
                                <FontAwesomeIcon
                                  icon={faDollarSign}
                                  className={styles.badgeIcon}
                                />
                                {order.deliveryDetails.deliveryFee.toFixed(2)}
                              </span>
                            </li>
                            <li>
                              <span
                                className={`${styles.deliveryBadge} ${styles.etaBadge}`}
                              >
                                <strong>Delivery ETA:</strong>
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className={styles.badgeIcon}
                                />
                                {order.deliveryDetails.ETA}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                </p>
                <p>
                  <strong>Receipt Time:</strong> {order.receiptTime}
                </p>
                <p className={styles.itemsInfo}>
                  <strong>Items:</strong> {order.itemsCount}
                  <div className={styles.itemsTooltipContainer}>
                    <span className={styles.tooltipIcon}>
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </span>
                    <div className={styles.itemsTooltip}>
                      <h4>Order Items Details</h4>
                      <SimpleBar
                        className={styles.itemsList}
                        style={{
                          maxHeight: "180px",
                        }}
                      >
                        {order.items.map((item, index) => (
                          <li key={index} className={styles.itemDetail}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemMeta}>
                              {item.quantity} × ${item.price.toFixed(2)}
                              <span className={styles.itemTotal}>
                                ${(item.quantity * item.price).toFixed(2)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </SimpleBar>
                      <div className={styles.itemsTotal}>
                        <strong>
                          Total: $
                          {order.items
                            .reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </p>

                <p>
                  <strong>Note:</strong> {order.note || "—"}
                </p>
              </div>

              <div className={styles.actions}>
                {order.status === "pending" && (
                  <>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEditOrder(order)}
                    >
                      <FontAwesomeIcon icon={faPen} /> Edit
                    </button>

                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Cancel
                    </button>

                    <button
                      className={styles.confirmBtn}
                      onClick={() => handleConfirmOrder(order.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Confirm
                    </button>
                  </>
                )}

                {order.status === "inTransit" && (
                  <>
                    <button
                      className={styles.trackBtn}
                      onClick={() => setTrackingOrder(order)}
                    >
                      <FontAwesomeIcon icon={faMapMarkedAlt} /> Track Delivery
                    </button>

                    <button
                      className={styles.receiptBtn}
                      onClick={() => handleConfirmReceiptClick(order.id)}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} /> Confirm Receipt
                    </button>
                  </>
                )}

                {/* Only show invoice button if canShowBill is true */}
                {order.canShowBill && (
                  <button
                    className={styles.invoiceBtn}
                    onClick={() => handleShowInvoice(order)}
                  >
                    <FontAwesomeIcon icon={faReceipt} /> Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className={styles.reprepOverlay}>
          <div className={styles.reprepModal}>
            <FontAwesomeIcon
              icon={faCircleExclamation}
              className={styles.reprepIcon}
            />

            <h2 className={styles.reprepTitle}>Re-preparation Request</h2>
            <p className={styles.reprepText}>
              We are sorry that the order did not meet your expectations. Please
              provide a reason for requesting a re-preparation.
            </p>

            <input
              type="text"
              placeholder="Reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={styles.reprepInput}
            />

            <div className={styles.reprepActions}>
              <button
                className={`${styles.reprepBtn} ${styles.reprepCancel}`}
                onClick={() => {
                  setOpen(false);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`${styles.reprepBtn} ${styles.reprepConfirm}`}
                onClick={() => handleRePreparationOrder(selectedOrderId)}
                disabled={loading}
              >
                {loading ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceOverlay && selectedInvoice && (
        <InvoiceOverlay
          invoice={selectedInvoice}
          onClose={handleCloseInvoice}
          onOpenPayment={openPaymentModal}
          onCashChosen={handleCashChosen}
        />
      )}

      <PaymentModal
        open={showPaymentModal}
        onClose={closePaymentModal}
        payload={paymentPayload}
        onPaid={handlePaid}
      />

      <RatingModal
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        order={currentOrderForRating}
      />

      {trackingOrder &&
        {
          // <TrackingMap
          //   order={trackingOrder}
          //   onClose={() => setTrackingOrder(null)}
          // />
        }}
    </div>
  );
};

export default UserOrder;
