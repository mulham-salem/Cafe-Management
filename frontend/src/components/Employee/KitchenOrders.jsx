import React, { useEffect, useState, useContext, useCallback } from "react";
import styles from "../styles/KitchenOrders.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faTruck,
  faClock,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { EmpSearchContext } from "./EmployeeHome";
import axios from "axios";

const mockData = [
  {
    id: 1001,
    status: "confirmed",
    items: [
      { name: "Cappuccino", quantity: 2 },
      { name: "Croissant", quantity: 1 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "dineIn",
    note: "Extra foam on cappuccino",
  },
  {
    id: 1002,
    status: "preparing",
    items: [
      { name: "Espresso", quantity: 1 },
      { name: "Chocolate Cake", quantity: 1 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "takeaway",
    note: "Slice the cake please",
  },
  {
    id: 1003,
    status: "ready",
    items: [
      { name: "Latte", quantity: 1 },
      { name: "Blueberry Muffin", quantity: 2 },
    ],
    receiptTime: "14:30",
    receiptMethod: "delivery",
    note: "One latte with oat milk",
  },
  {
    id: 1004,
    status: "delivered",
    items: [
      { name: "Turkish Coffee", quantity: 1 },
      { name: "Baklava", quantity: 2 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "dineIn",
    note: "Less sugar in coffee",
  },
  {
    id: 1005,
    status: "confirmed",
    items: [
      { name: "Iced Coffee", quantity: 3 },
      { name: "Cheesecake", quantity: 1 },
    ],
    receiptTime: "15:00",
    receiptMethod: "takeaway",
    note: "No straws please",
  },
  {
    id: 1006,
    status: "preparing",
    items: [
      { name: "Matcha Latte", quantity: 2 },
      { name: "Almond Biscotti", quantity: 3 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "delivery",
    note: "Matcha with coconut milk",
  },
  {
    id: 1007,
    status: "ready",
    items: [
      { name: "Americano", quantity: 1 },
      { name: "Tiramisu", quantity: 1 },
    ],
    receiptTime: "16:15",
    receiptMethod: "dineIn",
    note: "Extra shot in americano",
  },
  {
    id: 1008,
    status: "confirmed",
    items: [
      { name: "Hot Chocolate", quantity: 2 },
      { name: "Red Velvet Cake", quantity: 1 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "takeaway",
    note: "Whipped cream on both hot chocolates",
  },
  {
    id: 1009,
    status: "preparing",
    items: [
      { name: "Mocha", quantity: 1 },
      { name: "Cinnamon Roll", quantity: 2 },
    ],
    receiptTime: "17:30",
    receiptMethod: "delivery",
    note: "Extra chocolate on mocha",
  },
  {
    id: 1010,
    status: "delivered",
    items: [
      { name: "Green Tea", quantity: 1 },
      { name: "Macarons", quantity: 4 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "dineIn",
    note: "Assorted macaron flavors",
  },
  {
    id: 1011,
    status: "confirmed",
    items: [
      { name: "Flat White", quantity: 2 },
      { name: "Banana Bread", quantity: 1 },
    ],
    receiptTime: "18:00",
    receiptMethod: "takeaway",
    note: "One flat white with almond milk",
  },
  {
    id: 1012,
    status: "ready",
    items: [
      { name: "Chai Latte", quantity: 1 },
      { name: "Scone", quantity: 2 },
    ],
    receiptTime: "ASAP",
    receiptMethod: "delivery",
    note: "Clotted cream with scones",
  },
];

const KitchenOrders = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Kitchen";
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const token =
    sessionStorage.getItem("employeeToken") || localStorage.getItem("employeeToken");

  const fetchOrders = useCallback(async () => {
    try {
      // const response = await axios.get('http://localhost:8000/api/user/employee/kitchen/orders', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // setOrders(response.data.data.map(order => ({
      //   id: order.order_id,
      //   status: order.status,
      //   receiptTime: order.receiptTime,
      //   receiptMethod: order.receiptMethod,
      //   note: order.note,
      //   items: order.orderItems.map(item => ({
      //     name: item.item_name,
      //     quantity: item.quantity,
      //   }))
      // })));
      setOrders(mockData);
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (e, orderId, newStatus) => {
    e.preventDefault();

    if (newStatus === "") {
      return;
    }
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const allowedTransitions = {
      confirmed: "preparing",
      preparing: "ready",
      ready: "delivered",
    };

    if (allowedTransitions[order.status] !== newStatus) {
      toast.warning(
        "Cannot move to this status before completing the previous one or this transition is invalid!"
      );
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/api/user/employee/kitchen/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message) {
        toast.success(response.data.message);

        const updatedOrders = orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        );
        setOrders(updatedOrders);

        if (searchQuery.trim() != "") {
          setFilteredOrders((prevFiltered) =>
            prevFiltered.map((o) =>
              o.id === orderId ? { ...o, status: newStatus } : o
            )
          );
        }

        if (newStatus === "ready" && response.data.notifiedCustomer) {
          setTimeout(() => {
            toast.info(
              "The customer has been notified that the order is ready."
            );
          }, 5000);
        }
      } else if (response.data.error) {
        toast.error(response.data.error);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update order status. Please try again.";
      toast.error(errorMessage);
    }
  };

  const { searchQuery, setSearchPlaceholder } = useContext(EmpSearchContext);
  useEffect(() => {
    setSearchPlaceholder("Search by ID...");
  }, [setSearchPlaceholder]);

  const validStatusFlow = ["confirmed", "preparing", "ready", "delivered"];

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const searchSingleOrder = async () => {
        try {
          // const response = await axios.get(
          //   `http://localhost:8000/api/user/employee/orders/search?order_id=${searchQuery}&statuses=${validStatusFlow}`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //     },
          //   }
          // );
          // const fetchedOrder = response.data.data;
          // setFilteredOrders([
          //   {
          //     id: fetchedOrder.order_id,
          //     status: fetchedOrder.status,
          //     receiptTime: fetchedOrder.receiptTime,
          //     receiptMethod: fetchedOrder.receiptMethod,
          //     note: fetchedOrder.note,
          //     items:
          //       orders.find((o) => o.id === fetchedOrder.order_id)?.items || [],
          //   },
          // ]);
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

  return (
    <div className={styles.kitchenPage}>
      <h1 className={styles.pageTitle}>Active Kitchen Orders</h1>
      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : isSearching ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Searching...</p>
        </div>
      ) : searchQuery.trim() !== "" ? (
        filteredOrders.length > 0 ? (
          <div className={styles.ordersGrid}>
            {filteredOrders.map((order) => (
              <div className={styles.orderCard} key={order.id}>
                <div className={styles.orderHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUtensils}
                      className={styles.icon}
                    />
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

                <div className={styles.orderDetails}>
                  <div className={styles.detailRow}>
                    <FontAwesomeIcon
                      icon={faTruck}
                      className={styles.detailIcon}
                    />
                    <span className={styles.detailLabel}>Receipt Method:</span>
                    <span className={styles.detailValue}>
                      {order.receiptMethod}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <FontAwesomeIcon
                      icon={faClock}
                      className={styles.detailIcon}
                    />
                    <span className={styles.detailLabel}>Receipt Time:</span>
                    <span className={styles.detailValue}>
                      {order.receiptTime}
                    </span>
                  </div>

                  {order.note && (
                    <div className={styles.detailRow}>
                      <FontAwesomeIcon
                        icon={faStickyNote}
                        className={styles.detailIcon}
                      />
                      <span className={styles.detailLabel}>Note:</span>
                      <span className={styles.noteValue}>{order.note}</span>
                    </div>
                  )}
                </div>

                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Status: </span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(e, order.id, e.target.value)
                    }
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
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
              <div className={styles.orderDetails}>
                <div className={styles.detailRow}>
                  <FontAwesomeIcon
                    icon={faTruck}
                    className={styles.detailIcon}
                  />
                  <span className={styles.detailLabel}>Receipt Method:</span>
                  <span className={styles.detailValue}>
                    {order.receiptMethod}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <FontAwesomeIcon
                    icon={faClock}
                    className={styles.detailIcon}
                  />
                  <span className={styles.detailLabel}>Receipt Time:</span>
                  <span className={styles.detailValue}>
                    {order.receiptTime}
                  </span>
                </div>

                {order.note && (
                  <div className={styles.detailRow}>
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      className={styles.detailIcon}
                    />
                    <span className={styles.detailLabel}>Note:</span>
                    <span className={styles.noteValue}>{order.note}</span>
                  </div>
                )}
              </div>

              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Status: </span>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(e, order.id, e.target.value)
                  }
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
