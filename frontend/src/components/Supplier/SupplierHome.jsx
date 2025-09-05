import { useState, useEffect, useMemo, createContext } from "react";
import styles from "../styles/SupplierHome.module.css";
import logo from "/logo_1.png";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBell,
  faSignOutAlt,
  faUserAlt,
  faSyncAlt,
  faCalendarAlt,
  faTag,
  faDollarSign,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { toast as toastify, ToastContainer } from "react-toastify";
import { toast, Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import SidebarToggle from "../SidebarToggle";
export const SupplierSearchContext = createContext({
  searchQuery: "",
  setSearchQuery: () => {},
  searchPlaceholder: "",
  setSearchPlaceholder: () => {},
});

const SupplierHome = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Supplier Home";
    profile();
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("supplier_activeTab") || "send";
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("supplier_activeTab", tab);
  };

  const [title, setTitle] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([
    { id: uuidv4(), name: "", quantity: "", unit: "", unitPrice: "" },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: uuidv4(), name: "", quantity: "", unit: "", unitPrice: "" },
    ]);
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !deliveryDate.trim()) {
      toastify.error("Please fill in all required fields.");
      return;
    }

    for (let item of items) {
      if (!item.name.trim() || !item.quantity || !item.unitPrice) {
        toastify.error("Please complete all item fields.");
        return;
      }
    }

    const token =
      sessionStorage.getItem("supplierToken") ||
      localStorage.getItem("supplierToken");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/supplier/offers",
        {
          title,
          delivery_date: deliveryDate,
          note,
          items: items.map((item) => ({
            name: item.name,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            unit_price: parseFloat(item.unitPrice),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toastify.success("Supply offer submitted successfully.");
      setTitle("");
      setDeliveryDate("");
      setNote("");
      setItems([
        { id: uuidv4(), name: "", quantity: "", unit: "", unitPrice: "" },
      ]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit offer. Please try again.";
      toastify.error(errorMessage);
    }
  };

  const [myOffers, setMyOffers] = useState([]);

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search...");

  const fetchMyOffers = async () => {
    const token =
      sessionStorage.getItem("supplierToken") ||
      localStorage.getItem("supplierToken");
    try {
      const response = await axios.get(
        "http://localhost:8000/api/user/supplier/view-offers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMyOffers(response.data.offers);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch offers.";
      toastify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setTimeout(() => {
        toast.custom(
          (t) => (
            <div
              className={`${styles.toastCard} ${
                t.visible ? styles.enter : styles.leave
              }`}
            >
              <div className={styles.textContainer}>
                <p className={styles.messageTitle}>
                  ☕️ {location.state.successMessage}
                </p>
                <p className={styles.message}>
                  Glad to see you again at Coffee House!
                </p>
              </div>
            </div>
          ),
          { duration: 4000, position: "top-right" }
        );
        window.history.replaceState({}, document.title);
      }, 1500);
    }
  }, [location.state]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const token =
      sessionStorage.getItem("supplierToken") ||
      localStorage.getItem("supplierToken");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/logout",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("supplierToken");
      sessionStorage.removeItem("supplierToken");
      const successMessage = response.data.message || "Logged out successfully";
      navigate("/login", { state: { message: successMessage } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Logout failed. Please try again.";
      toastify.error(errorMessage);
    }
  };

  const [userName, setUserName] = useState("User");

  const profile = async () => {
    const token =
      sessionStorage.getItem("supplierToken") ||
      localStorage.getItem("supplierToken");

    try {
      const response = await axios.get(
        "http://localhost:8000/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserName(response.data.firstName || "User");
    } catch (error) {
      toastify.error("Failed to fetch user name");
    }
  };

  useEffect(() => {
    const checkNewNotifications = async () => {
      try {
        const token =
          localStorage.getItem("supplierToken") ||
          sessionStorage.getItem("supplierToken");

        const response = await axios.get(
          "http://localhost:8000/api/user/supplier/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const allNotifications = response.data.notifications;

        const shownNotifications =
          JSON.parse(localStorage.getItem("shownNotificationsSupplier")) || [];

        const unseenOfferResponses = allNotifications.filter(
          (n) =>
            n.seen === 0 &&
            n.purpose === "Supply Offer Response" &&
            !shownNotifications.includes(n.id)
        );

        const unseenRequests = allNotifications.filter(
          (n) =>
            n.seen === 0 &&
            n.purpose === "Supply Request" &&
            !shownNotifications.includes(n.id)
        );

        if (unseenOfferResponses.length > 0) {
          toastify.info(
            `You received ${unseenOfferResponses.length} response${
              unseenOfferResponses.length > 1 ? "s" : ""
            } for your supply offer.`
          );

          const ids = unseenOfferResponses.map((n) => n.id);
          localStorage.setItem(
            "shownNotificationsSupplier",
            JSON.stringify([...shownNotifications, ...ids])
          );
        }

        if (unseenRequests.length > 0) {
          toastify.info(
            `You received ${unseenRequests.length} new supply request${
              unseenRequests.length > 1 ? "s" : ""
            }.`
          );

          const ids = unseenRequests.map((n) => n.id);
          localStorage.setItem(
            "shownNotificationsSupplier",
            JSON.stringify([...shownNotifications, ...ids])
          );
        }
      } catch (err) {
        console.error("Failed to load notifications: ", err);
      }
    };

    checkNewNotifications();
    const interval = setInterval(checkNewNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredOffers = useMemo(() => {
    return myOffers.filter(
      (offer) =>
        searchQuery === "" ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myOffers, searchQuery]);

  const isFullWidthPage =
    location.pathname !== "/login/supplier-home" &&
    location.pathname.startsWith("/login/supplier-home/");

  const mockSupplyHistory = [
    {
      id: 1,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2024-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 2,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 3,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
    {
      id: 4,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2024-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 5,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 6,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
    {
      id: 7,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2023-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 8,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 9,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
    {
      id: 10,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2022-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 11,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 12,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
  ];

  const [supplyHistory, setSupplyHistory] = useState(mockSupplyHistory);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchSupplyHistory = async () => {
    try {
      // const response = await axios.get("/api/supply-history");
      // setSupplyHistory(response.data);
    } catch (err) {
      toast.error("Error fetching supply records:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredSupplyHistory = useMemo(() => {
    return supplyHistory.filter(
      (record) =>
        searchQuery === "" || record.supplyDate.toString().includes(searchQuery)
    );
  }, [supplyHistory, searchQuery]);

  useEffect(() => {
    if (activeTab !== "view" && activeTab !== "history") setSearchQuery("");
    if (activeTab === "view") {
      fetchMyOffers();
    } else if (activeTab === "history") {
      fetchSupplyHistory();
    }
  }, [activeTab]);

  const [expandedRecords, setExpandedRecords] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRecords((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <Toaster />
      <nav className={styles.navbar}>
        <Link to="/login/supplier-home" className={styles.navIcon}>
          <FontAwesomeIcon icon={faHome} title="Home" />
        </Link>

        <div className={styles.brand}>
          <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
          <span>Cafe Delights</span>
        </div>

        <div className={styles.rightSection}>
          {/* 🔎 Search – يظهر فقط في view/history */}
          {(activeTab === "view" ||
            activeTab === "history" ||
            location.pathname.includes("inventory-supply")) && (
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                type="search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "view"
                    ? "Search by offer title…"
                    : activeTab === "history"
                    ? "Search by supply date..."
                    : searchPlaceholder
                }
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery("")}
                  title="Clear"
                >
                  ×
                </button>
              )}
            </div>
          )}
          <div className={styles.userArea}>
            {userName}
            <div className={styles.dropdown}>
              <Link to="my-account" className={styles.dropdownLink}>
                <button className={styles.dropdownButton}>
                  <FontAwesomeIcon icon={faUserAlt} />
                  <span>My Account</span>
                </button>
              </Link>
              <Link to="message" className={styles.dropdownLink}>
                <button className={styles.dropdownButton}>
                  <FontAwesomeIcon icon={faMessage} />
                  <span>Messages</span>
                </button>
              </Link>
              <span className={styles.dropdownLink}>
                <button
                  onClick={handleLogout}
                  className={styles.dropdownButton}
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className={styles.logoutIcon}
                  />
                  <span className={styles.logout}>Logout</span>
                </button>
              </span>
            </div>
          </div>
          <Link to="supplier-notification" className={styles.navIcon}>
            <FontAwesomeIcon icon={faBell} title="Notifications" />
          </Link>
        </div>
      </nav>

      {currentPath === "/login/supplier-home" && (
        <div className={styles.heroText}>
          <h1>Welcome, dear supplier!</h1>
          <p>Manage your supply offers and stay updated.</p>
        </div>
      )}

      {currentPath === "/login/supplier-home" && (
        <div className={styles.tabs}>
          <button
            className={activeTab === "send" ? styles.activeTab : ""}
            onClick={() => changeTab("send")}
          >
            Send Supply Offer
          </button>
          <button
            className={activeTab === "view" ? styles.activeTab : ""}
            onClick={() => changeTab("view")}
          >
            View My Offers
          </button>
          <button
            className={activeTab === "history" ? styles.activeTab : ""}
            onClick={() => changeTab("history")}
          >
            Supply History
          </button>
        </div>
      )}

      <main
        className={
          isFullWidthPage ? styles.fullWidthPageWrapper : styles.mainContent
        }
      >
        {currentPath === "/login/supplier-home" && activeTab === "send" && (
          <form className={styles.offerForm} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Offer Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
            <textarea
              placeholder="Additional Notes (Optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <h4>Items</h4>
            {items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(item.id, "name", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(item.id, "quantity", e.target.value)
                  }
                />

                <select
                  value={item.unit}
                  onChange={(e) =>
                    handleItemChange(item.id, "unit", e.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Unit
                  </option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="liter">liter</option>
                  <option value="ml">ml</option>
                  <option value="dozen">dozen</option>
                  <option value="box">box</option>
                  <option value="piece">piece</option>
                </select>
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(item.id, "unitPrice", e.target.value)
                  }
                />
              </div>
            ))}
            <button
              type="button"
              className={styles.addItemBtn}
              onClick={handleAddItem}
            >
              + Add Item
            </button>
            <button type="submit" className={styles.submitBtn}>
              Submit Offer
            </button>
          </form>
        )}

        {currentPath === "/login/supplier-home" && activeTab === "view" && (
          <div className={styles.offersList}>
            {loading ? (
              <div className={styles.loadingOverlay}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <div key={offer.id} className={styles.offerCard}>
                  <h3>{offer.title}</h3>
                  <p>
                    <strong>Delivery:</strong>{" "}
                    {new Date(offer.delivery_date).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Total Price:</strong> ${offer.total_price}
                  </p>
                  {offer.note && (
                    <p>
                      <strong>Note:</strong> {offer.note}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong> {offer.status}
                  </p>
                  {offer.status === "rejected" && offer.rejection_reason && (
                    <p className={styles.rejection}>
                      <strong>Reason for Rejection:</strong>{" "}
                      {offer.rejection_reason}
                    </p>
                  )}

                  <h4>Items:</h4>
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Name</th>

                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                      </tr>
                    </thead>

                    <tbody>
                      {offer.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name}</td>

                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>${item.unit_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : searchQuery ? (
              <p className={styles.noResults}>
                No results match “{searchQuery}”.
              </p>
            ) : (
              <p className={styles.noResults}>No offers to display.</p>
            )}
          </div>
        )}

        {currentPath === "/login/supplier-home" && activeTab === "history" && (
          <section className={styles.supplyHistorySection}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>
                  <span className={styles.historyIcon}>📋</span>
                  Supply History
                </h2>
                <p className={styles.pageSubtitle}>
                  View all past supply records
                </p>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={`${styles.actionButton} ${styles.refreshButton}`}
                  onClick={fetchSupplyHistory}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> Refresh
                </button>
              </div>
            </div>

            {loadingHistory ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading supply records...</p>
              </div>
            ) : filteredSupplyHistory.length === 0 ? (
              <p className={styles.noResults}>
                {searchQuery ? (
                  `No Offer found matching "${searchQuery}"`
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📭</div>
                    <h3>No Supply Records Found</h3>
                    <p>There are no historical supply records to display</p>
                  </div>
                )}
              </p>
            ) : (
              <div className={styles.recordsGrid}>
                {filteredSupplyHistory.map((record) => (
                  <div
                    key={record.id}
                    className={`${styles.recordCard} ${
                      record.type === "supply offer"
                        ? styles.offerCardRecord
                        : styles.requestCardRecord
                    }`}
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <h3>#{String(record.id).padStart(3, "0")}</h3>
                        <p className={styles.recordTitle}>{record.title}</p>
                      </div>
                      <span
                        className={`${styles.statusBadgeRecord} ${
                          styles[record.status]
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </span>
                    </div>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>
                          {new Date(record.supplyDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faTag} />
                        <span>
                          {record.type === "supply offer" ? "Offer" : "Request"}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faDollarSign} />
                        <span>${record.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {expandedRecords === record.id && (
                      <div className={styles.expandedContent}>
                        <div className={styles.itemsSection}>
                          <h4>Items Details</h4>
                          <ul className={styles.itemsList}>
                            {record.items.map((item, idx) => (
                              <li key={idx}>
                                <span className={styles.itemNameRecord}>
                                  {item.name}
                                </span>
                                <span className={styles.itemQuantity}>
                                  {item.quantity} {item.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {record.status === "rejected" &&
                          record.rejectionReason && (
                            <div className={styles.rejectionSection}>
                              <h4>Rejection Reason</h4>
                              <p>{record.rejectionReason}</p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {currentPath === "/login/supplier-home" && <SidebarToggle />}

        <SupplierSearchContext.Provider
          value={{
            searchQuery,
            setSearchQuery,
            searchPlaceholder,
            setSearchPlaceholder,
          }}
        >
          <Outlet />
        </SupplierSearchContext.Provider>
      </main>
    </div>
  );
};

export default SupplierHome;
