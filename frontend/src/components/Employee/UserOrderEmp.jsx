import { useState, useEffect, useContext } from "react";
import styles from "../styles/UserOrderEmp.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faCheck,
  faReceipt,
  faMugHot,
  faEllipsisVertical,
  faPause,
  faPhone,
  faCog,
  faClock,
  faCalendarAlt,
  faBan,
  faInfoCircle,
  faArrowRotateBack,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import { EmpSearchContext } from "./EmployeeHome";
import axios from "axios";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

const mockOrders = [
  {
    id: "1001",
    status: "pending",
    createdAt: "2023-10-15T08:30:00Z",
    note: "Please deliver to back door",
    itemsCount: 3,
    canShowBill: "",
    receiptMethod: "DineIn",
    receiptTime: "12:30",
    items: [
      { name: "Pepperoni Pizza", price: 28, quantity: 1 },
      { name: "Caesar Salad", price: 15, quantity: 1 },
      { name: "Soda", price: 8, quantity: 2 },
    ],
  },
  {
    id: "1002",
    status: "preparing",
    createdAt: "2023-10-15T09:15:23Z",
    note: "Extra napkins please",
    itemsCount: 2,
    canShowBill: "",
    receiptMethod: "Takeaway",
    receiptTime: "13:45",
    items: [
      { name: "Chicken Burger", price: 18, quantity: 1 },
      { name: "French Fries", price: 10, quantity: 1 },
    ],
  },
  {
    id: "1003",
    status: "ready",
    createdAt: "2023-10-15T10:05:47Z",
    note: "Allergic to peanuts",
    itemsCount: 5,
    canShowBill: "",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    items: [
      { name: "Vegetable Pasta", price: 22, quantity: 1 },
      { name: "Garlic Bread", price: 8, quantity: 2 },
      { name: "Chocolate Cake", price: 12, quantity: 1 },
      { name: "Iced Tea", price: 7, quantity: 1 },
    ],
  },
  {
    id: "1004",
    status: "confirmed",
    createdAt: "2023-10-15T10:42:11Z",
    note: "Call upon arrival",
    itemsCount: 1,
    canShowBill: "",
    receiptMethod: "DineIn",
    receiptTime: "15:00",
    items: [{ name: "Cheesecake", price: 14, quantity: 1 }],
  },
  {
    id: "1005",
    status: "delivered",
    createdAt: "2023-10-14T16:20:35Z",
    note: "Leave at reception",
    itemsCount: 4,
    canShowBill: 1,
    receiptMethod: "Takeaway",
    receiptTime: "ASAP",
    items: [
      { name: "Beef Steak", price: 35, quantity: 1 },
      { name: "Mashed Potatoes", price: 12, quantity: 1 },
      { name: "Grilled Vegetables", price: 10, quantity: 1 },
      { name: "Red Wine", price: 25, quantity: 1 },
    ],
  },
  {
    id: "1006",
    status: "onHold",
    createdAt: "2023-10-15T11:30:15Z",
    note: "Add extra sugar",
    itemsCount: 2,
    canShowBill: "",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    items: [
      { name: "Coffee", price: 6, quantity: 2 },
      { name: "Blueberry Muffin", price: 8, quantity: 1 },
    ],
  },
  {
    id: "1007",
    status: "preparing",
    createdAt: "2023-10-15T11:45:22Z",
    note: "No onions please",
    itemsCount: 3,
    canShowBill: "",
    receiptMethod: "Takeaway",
    receiptTime: "ASAP",
    items: [
      { name: "Veggie Wrap", price: 16, quantity: 1 },
      { name: "Onion Rings", price: 9, quantity: 1 },
      { name: "Smoothie", price: 11, quantity: 1 },
    ],
  },
  {
    id: "1008",
    status: "delivered",
    createdAt: "2023-10-14T19:10:43Z",
    note: "Gate code: 2345",
    itemsCount: 6,
    canShowBill: "1",
    receiptMethod: "DineIn",
    receiptTime: "18:45",
    items: [
      { name: "Seafood Platter", price: 42, quantity: 1 },
      { name: "Rice Pilaf", price: 10, quantity: 1 },
      { name: "Green Salad", price: 9, quantity: 1 },
      { name: "White Wine", price: 22, quantity: 1 },
      { name: "Tiramisu", price: 13, quantity: 1 },
    ],
  },
  {
    id: "1009",
    status: "ready",
    createdAt: "2023-10-15T12:05:19Z",
    note: "Fragile handle with care",
    itemsCount: 2,
    canShowBill: "",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    items: [
      { name: "Chicken Wings", price: 18, quantity: 1 },
      { name: "Coleslaw", price: 7, quantity: 1 },
    ],
  },
  {
    id: "1010",
    status: "confirmed",
    createdAt: "2023-10-15T12:30:54Z",
    note: "Office delivery - 3rd floor",
    itemsCount: 7,
    canShowBill: "",
    receiptMethod: "Takeaway",
    receiptTime: "ASAP",
    items: [
      { name: "Club Sandwich", price: 16, quantity: 2 },
      { name: "Fruit Salad", price: 12, quantity: 1 },
      { name: "Mineral Water", price: 5, quantity: 3 },
      { name: "Brownie", price: 9, quantity: 1 },
    ],
  },
  {
    id: "1011",
    status: "ready",
    createdAt: "2023-10-15T12:05:19Z",
    note: "Fragile handle with care",
    itemsCount: 2,
    canShowBill: "",
    receiptMethod: "Takeaway",
    receiptTime: "ASAP",
    items: [
      { name: "Margherita Pizza", price: 24, quantity: 1 },
      { name: "Lemonade", price: 7, quantity: 2 },
    ],
  },
  {
    id: "1012",
    status: "confirmed",
    createdAt: "2023-10-15T12:30:54Z",
    note: "Office delivery - 3rd floor",
    itemsCount: 7,
    canShowBill: "",
    receiptMethod: "DineIn",
    receiptTime: "ASAP",
    items: [
      { name: "BBQ Ribs", price: 32, quantity: 1 },
      { name: "Baked Potato", price: 9, quantity: 1 },
      { name: "Corn on the Cob", price: 8, quantity: 2 },
      { name: "Beer", price: 12, quantity: 2 },
      { name: "Apple Pie", price: 11, quantity: 1 },
    ],
  },
];

const UserOrderEmp = () => {
  const token =
    sessionStorage.getItem("employeeToken") || localStorage.getItem("employeeToken");

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
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      // const response = await axios.get('/user/employee/myOrders');
      // const fetchedOrders = response.data.data.map(order => ({
      //   id: order.order_id,
      //   status: order.status,
      //   createdAt: new Date(order.created_at).toLocaleString(),
      //   canShowBill: order.can_show_bill,
      //   itemsCount: order.item_count,
      //   receiptMethod: order.receiptMethod,
      //   receiptTime: order.receiptTime,
      //   note: order.note,
      //   items: order.items.map((item) => ({
      //   name: item.name,
      //   price: item.price,
      //   quantity: item.quantity,
      //  }))
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

  const handleEditOrder = (order) => {
    navigate("/login/employee-home/menu-order", {
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
                  await axios.delete(`/user/employee/orders/cancel/${orderId}`);

                  const updatedOrders = orders.filter(
                    (order) => order.id !== orderId
                  );
                  setOrders(updatedOrders);

                  if (searchQuery.trim() !== "") {
                    setFilteredOrders((prev) =>
                      prev.filter((order) => order.id !== orderId)
                    );
                  }

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
        className: "custom-confirmEmp-toast",
      }
    );
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await axios.post(`/user/employee/orders/confirm/${orderId}`);

      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: "confirmed" } : order
      );
      setOrders(updatedOrders);

      if (searchQuery.trim() !== "") {
        setFilteredOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "confirmed" } : order
          )
        );
      }
      toast.success("Order confirmed successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to confirm order.";
      toast.error(errorMessage);
      console.error("Error confirming order:", error);
    }
  };

  const handleShowInvoice = async (order) => {
    try {
      const response = await axios.get(
        `/user/employee/myOrders/invoice/${order.id}`
      );
      const invoiceData = response.data;

      const mappedInvoice = {
        id: order.id,
        customerName: invoiceData.username,
        items: invoiceData.items.map((item) => ({
          name: item.menu_item,
          quantity: item.quantity,
          price: item.price / item.quantity,
        })),
        totalPrice: invoiceData.total_price,
      };

      setSelectedInvoice(mappedInvoice);
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

  const [filteredOrders, setFilteredOrders] = useState([]);
  const { searchQuery, setSearchPlaceholder } = useContext(EmpSearchContext);
  setSearchPlaceholder("Search by ID...");

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const searchSingleOrder = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/user/employee/orders/search?order_id=${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const fetchedOrder = response.data.data;
          setFilteredOrders([
            {
              id: fetchedOrder.order_id,
              status: fetchedOrder.status,
              createdAt: new Date(fetchedOrder.created_at).toLocaleString(),
              canShowBill: fetchedOrder.can_show_bill,
              itemsCount: fetchedOrder.item_count,
              receiptMethod: fetchedOrder.receiptMethod,
              receiptTime: fetchedOrder.receiptTime,
              note: fetchedOrder.note,
              items: fetchedOrder.items.map((item) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
            },
          ]);
        } catch (error) {
          console.error("Error searching order:", error);
          if (error.response && error.response.status === 404) {
            setFilteredOrders([]);
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
  }, [searchQuery]);

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

  // دوال الخيارات
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

  const mockCustomer = {
    id: 1,
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
  };

  const [contactInfo, setContactInfo] = useState(null);
  const [openContact, setOpenContact] = useState(false);

  const handleContactCustomer = async (orderId) => {
    setActiveMenu(null);
    try {
      // const res = await axios.get(`/api/customers/${orderId}/contact`);
      // setContactInfo(res.data);
      setContactInfo(mockCustomer);
      setOpenContact(true);
    } catch (err) {
      console.error("Error fetching contact info:", err);
      toast.error("Error fetching contact info");
    }
  };

  const [open, setOpen] = useState(false);
  const [systemPaused, setSystemPaused] = useState(false);
  const [resumeTime, setResumeTime] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  async function pauseOrders(duration = null) {
    try {
      // const res = await axios.post(
      //   "/api/orders/pause",
      //   { duration }, // send null or minutes
      //   { withCredentials: true }
      // );
      // return res.data;
      return true;
    } catch (err) {
      throw err.response?.data?.message || "Error while pausing orders";
    }
  }

  const handlePause = async () => {
    try {
      setOpen(false);
      const data = await pauseOrders();
      setSystemPaused(true);
      setResumeTime(null);
      toast.success("✅ Orders paused successfully");
    } catch {
      toast.error("❌ Failed to pause orders");
    }
  };

  const handleSchedule = async () => {
    setShowScheduler(true);
    if (!selectedDate) {
      setShowScheduler(!showScheduler); // toggle field visibility
      return;
    }

    try {
      const data = await pauseOrders(selectedDate);
      setSystemPaused(true);
      setResumeTime(new Date(selectedDate));
      toast.success(
        "Orders paused until " + new Date(selectedDate).toLocaleString()
      );
      setShowScheduler(false);
      setSelectedDate("");
    } catch {
      toast.error("❌ Failed to schedule auto-resume");
    }
  };

  function handleSettings() {
    setOpen(false);
    // TODO: implement settings logic
  }

  const [spinning, setSpinning] = useState(false);

  function handleSettingOpen() {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setOpen(true);
    }, 800);
  }

  return (
    <div className={styles.ordersPage}>
      <h1 className={styles.pageTitle}>
        <FontAwesomeIcon
          icon={faMugHot}
          className={`${styles.icon} ${styles.floatingIcon}`}
        />
        My Orders
      </h1>

      {systemPaused && (
        <div className={styles.alertBanner}>
          <FontAwesomeIcon icon={faBan} className={styles.banIcon} size="lg" />{" "}
          Orders are paused
          {resumeTime && ` until ${resumeTime.toLocaleString()}`}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : isSearching ? (
        <p className={styles.emptyText}>Searching...</p>
      ) : searchQuery.trim() !== "" && filteredOrders.length === 0 ? (
        <p className={styles.noResults}>No matching orders found.</p>
      ) : orders.length === 0 ? (
        <p className={styles.emptyOrderList}>No orders to display.</p>
      ) : (
        <div className={styles.ordersGrid}>
          {(searchQuery.trim() !== "" ? filteredOrders : orders).map(
            (order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span>Order #{order.id}</span>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status}
                  </span>

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
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className={styles.trashIcon}
                            />
                            Delete Order
                          </button>
                        )}

                        <button
                          className={styles.menuItem}
                          onClick={() => handleContactCustomer(order.id)}
                        >
                          <FontAwesomeIcon
                            icon={faPhone}
                            className={styles.phoneIcon}
                          />
                          Contact Customer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <p>
                    <strong>Date:</strong> {order.createdAt}
                  </p>
                  <p>
                    <strong>Receipt Method:</strong> {order.receiptMethod}
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
                              <span className={styles.itemName}>
                                {item.name}
                              </span>
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
            )
          )}
        </div>
      )}

      {showInvoiceOverlay && selectedInvoice && (
        <div className={styles.invoiceOverlay}>
          <div className={styles.invoiceContent}>
            <button
              className={styles.closeOverlay}
              onClick={handleCloseInvoice}
            >
              ×
            </button>
            <h2>Invoice for Order #{selectedInvoice.id}</h2>

            <p>
              <strong>Name:</strong> {selectedInvoice.customerName || "N/A"}
            </p>
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

      {openContact && (
        <div className={styles.modalOverlay}>
          <div
            onClick={() => setOpenContact(false)}
            className={styles.backdrop}
          />
          <div className={styles.contactCard}>
            <h3 className={styles.title}>Customer Info</h3>
            <p>
              <strong>Name:</strong> {contactInfo.name}
            </p>
            <p>
              <strong>Phone:</strong> {contactInfo.phone}
            </p>
            <p>
              <strong>Email:</strong> {contactInfo.email}
            </p>
          </div>
        </div>
      )}

      <button
        aria-label="Open quick actions"
        onClick={() => handleSettingOpen()}
        className={styles.fab}
      >
        <FontAwesomeIcon
          icon={faCog}
          size="2x"
          className={`${styles.optionIcon} ${spinning ? styles.spinIcon : ""}`}
        />
      </button>

      {/* Modal / Popover */}
      {open && (
        <div className={styles.modalOverlay}>
          <div onClick={() => setOpen(false)} className={styles.backdrop} />

          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Quick actions</h3>

            <div className={styles.optionsGrid}>
              <button onClick={handlePause} className={styles.optionBtn}>
                <FontAwesomeIcon icon={faPause} fixedWidth />
                <span className={styles.optionLabel}>Pause Receive Orders</span>
              </button>

              <button onClick={handleSchedule} className={styles.optionBtn}>
                <FontAwesomeIcon icon={faClock} fixedWidth />
                <span className={styles.optionLabel}>
                  Auto-resume (schedule)
                </span>
              </button>

              <button onClick={handleSettings} className={styles.optionBtn}>
                <FontAwesomeIcon icon={faCog} fixedWidth />
                <span className={styles.optionLabel}>System settings</span>
              </button>
            </div>

            {showScheduler && (
              <div className={styles.schedulerBox}>
                <label className={styles.schedulerLabel}>
                  Select resume time
                </label>
                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className={styles.inputIcon}
                  />
                  <input
                    type="datetime-local"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
                <div className={styles.schedulerActions}>
                  <button
                    onClick={async () => {
                      await handleSchedule(selectedDate);
                      setShowScheduler(false);
                      setOpen(false);
                    }}
                    className={styles.confirmButton}
                  >
                    Confirm Schedule
                  </button>
                  <button
                    onClick={() => setShowScheduler(false)}
                    className={styles.cancelButton}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            <div className={styles.modalFooter}>
              <button
                onClick={() => setOpen(false)}
                className={styles.closeBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderEmp;
