import { useState, useEffect, createContext, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/ManagerDashboard.module.css";
import logo from "/logo_1.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUsers,
  faUtensils,
  faFileAlt,
  faBoxes,
  faBullhorn,
  faBell,
  faSignOutAlt,
  faHome,
  faSearch,
  faUserAlt,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { toast as toastify, ToastContainer } from "react-toastify";
import { toast, Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useActiveTab } from "../../context/ActiveTabContext";
import echo from "../../../echo";
export const SearchContext = createContext({
  searchQuery: "",
  setSearchQuery: () => {},
  searchPlaceholder: "",
  setSearchPlaceholder: () => {},
});
import useChattingNotification from "../../hooks/ChattingNotification";
import useUnreadNotifications from "../../hooks/UnreadNotifications";

const ManagerDashboard = () => {
  const { activeTab } = useActiveTab();
  const location = useLocation();
  const currentPath = location.pathname;
  const notificationsBuffer = useRef({
    supplyOffers: [],
    supplyResponses: [],
  });

  useChattingNotification();

  const { unreadCount, loadingCount } = useUnreadNotifications();

  useEffect(() => {
    document.title = "Cafe Delights - Manager Dashboard";
    profile();
  }, []);

  const [isTextVisible, setIsTextVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTextVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getTitle = () => {
    if (currentPath === "/login/manager-dashboard") return "Dashboard";
    if (currentPath.includes("/user-management")) return "User Management";
    if (currentPath.includes("/menu-management")) return "Menu Management";
    if (currentPath.includes("/table-management")) return "Table Management";
    if (currentPath.includes("/inventory-supply")) return "Inventory & Supply";
    if (currentPath.includes("/promotion-management")) return "Promotion";
    if (currentPath.includes("/manager-notification"))
      return "Notifications Page";
    if (currentPath.includes("/reports-dashboard")) return "Reports Dashboard";
    if (currentPath.includes("/my-account")) return "Account";
    if (currentPath.includes("/message")) return "Messages";
    return "";
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
      }, 2000);
    }
  }, [location.state]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const token =
      sessionStorage.getItem("managerToken") ||
      localStorage.getItem("managerToken");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/manager/logout",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("managerToken");
      sessionStorage.removeItem("managerToken");
      const successMessage = response.data.message || "Logged out successfully";
      navigate("/login", { state: { message: successMessage } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Logout failed. Please try again.";
      toastify.error(errorMessage);
    }
  };

  const [managerName, setManagerName] = useState("Manager");

  const profile = async () => {
    const token =
      sessionStorage.getItem("managerToken") ||
      localStorage.getItem("managerToken");

    try {
      const response = await axios.get(
        "http://localhost:8000/api/manager/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setManagerName(response.data.name || "Manager");
    } catch (error) {
      toastify.error("Failed to fetch manager name");
    }
  };

  useEffect(() => {
    try {
      const channel = echo.channel("notifications");
      channel.listen(".new-notification", (e) => {
        console.log("Received notification via WebSocket:", e);
        const n = e.notification;

        if (n.seen === false && n.purpose === "Supply Offer") {
          notificationsBuffer.current.supplyOffers.push(n);
        }

        if (n.seen === false && n.purpose === "Response For Supply Request") {
          notificationsBuffer.current.supplyResponses.push(n);
        }
      });
      // كل شوي (مثلاً 2 ثانية) شوف إذا في إشعارات جديدة واجمعهن برسالة وحدة
      const interval = setInterval(() => {
        const offers = notificationsBuffer.current.supplyOffers;
        const responses = notificationsBuffer.current.supplyResponses;

        setTimeout(() => {
          if (offers.length > 0) {
            toastify.info(
              `You received ${offers.length} new supply offer${
                offers.length > 1 ? "s" : ""
              }.`
            );
            notificationsBuffer.current.supplyOffers = [];
          }
        }, 2000);

        setTimeout(() => {
          if (responses.length > 0) {
            toastify.info(
              `You received ${responses.length} new response${
                responses.length > 1 ? "s" : ""
              } for your supply request.`
            );
            notificationsBuffer.current.supplyResponses = [];
          }
        }, 2000);
      }, 2000);

      // معالج الأخطاء للقناة
      channel.error((error) => {
        console.error("Channel error:", error);
        toast.error("Connection error. Reconnecting...");
      });

      return () => {
        clearInterval(interval);
        echo.leaveChannel("notifications");
      };
    } catch (error) {
      console.error("Failed to set up WebSocket:", error);
      toast.error("Real-time notifications unavailable");
    }
  }, []);

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search...");

  const shouldShowSearch = () => {
    if (currentPath.includes("/user-management")) return true;
    if (currentPath.includes("/menu-management")) return true;
    if (currentPath.includes("/promotion-management")) return true;
    if (currentPath.includes("/inventory-supply")) {
      return (
        activeTab === "inventory" ||
        activeTab === "offers" ||
        activeTab === "purchaseBills" ||
        activeTab === "supplyHistory"
      );
    }
    return false;
  };

  return (
    <div className={styles.dashboard}>
      <ToastContainer />
      <Toaster />
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <FontAwesomeIcon
            icon={faBars}
            className={`${styles.menuIcon} ${
              sidebarOpen ? styles.open : styles.close
            }`}
            onClick={toggleSidebar}
          />
          <div className={styles.logoSection}>
            <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
            <h1 className={styles.cafeName}>Cafe Delights</h1>
          </div>
        </div>
        <div className={styles.headerCenter}>
          <span className={styles.pageTitle}>{getTitle()}</span>

          {shouldShowSearch() && (
            <div className={styles.searchContainer}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                aria-label="Search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchBox}
              />
            </div>
          )}
        </div>
        <div className={styles.rightSection}>
          <div className={styles.managerName}>
            {managerName}
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
          <Link to="manager-notification" className={styles.iconWrapper}>
            <FontAwesomeIcon
              icon={faBell}
              title="Notifications"
              className={styles.notificationIcon}
            />
            {!loadingCount && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </Link>
        </div>
      </header>

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""} ${
          styles.sidebar
        } ${isTextVisible ? styles.fadeIn : ""}`}
      >
        <ul>
          <li>
            <Link
              to="/login/manager-dashboard"
              className={
                currentPath === "/login/manager-dashboard"
                  ? styles.active
                  : styles.inactive
              }
            >
              <FontAwesomeIcon icon={faHome} className={styles.icon} />
              Home
            </Link>
          </li>
          <li>
            <Link
              to="user-management"
              className={
                currentPath === "/login/manager-dashboard/user-management"
                  ? styles.active
                  : styles.inactive
              }
            >
              <FontAwesomeIcon icon={faUsers} className={styles.icon} />
              User Management
            </Link>
          </li>
          <li>
            <Link
              to="menu-management"
              className={
                currentPath === "/login/manager-dashboard/menu-management"
                  ? styles.active
                  : styles.inactive
              }
            >
              <FontAwesomeIcon icon={faUtensils} className={styles.icon} />
              Menu Management
            </Link>
          </li>
          <li>
            <Link
              to="reports-dashboard"
              className={
                currentPath === "/login/manager-dashboard/reports-dashboard"
                  ? styles.active
                  : styles.inactive
              }
            >
              <FontAwesomeIcon icon={faFileAlt} className={styles.icon} />
              Report Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="inventory-supply"
              className={
                currentPath === "/login/manager-dashboard/inventory-supply"
                  ? styles.active
                  : styles.inactive
              }
            >
              <FontAwesomeIcon icon={faBoxes} className={styles.icon} />
              Inventory & Supply
            </Link>
          </li>
          <li>
            <Link
              to="promotion-management"
              className={
                currentPath === "/login/manager-dashboard/promotion-management"
                  ? styles.active
                  : styles.inactive
              }
            >
              <FontAwesomeIcon icon={faBullhorn} className={styles.icon} />
              Promotion Manage
            </Link>
          </li>
        </ul>
      </aside>
      <main className={styles.mainContent}>
        {currentPath === "/login/manager-dashboard" && (
          <div
            className={`${styles.mainText} ${
              isTextVisible ? styles.fadeIn : ""
            }`}
          >
            <h2>
              <span className={styles.highlight}>
                Welcome back, {managerName}{" "}
              </span>{" "}
              <br />
              <span className={styles.sub}>
                Your command center is brewed and ready.
              </span>
              <span className={styles.keywords}>
                User <strong>Roles</strong>, Menu <strong>Magic</strong>, Table{" "}
                <strong>Mastery</strong>, Inventory <strong>Control</strong>,
                Promotion <strong>Power</strong>.
              </span>
              <span className={styles.cta}>
                Steer your café’s success <strong>–</strong> one click at a
                time.
              </span>
            </h2>
          </div>
        )}
        <SearchContext.Provider
          value={{
            searchQuery,
            setSearchQuery,
            searchPlaceholder,
            setSearchPlaceholder,
          }}
        >
          <Outlet />
        </SearchContext.Provider>
      </main>
    </div>
  );
};

export default ManagerDashboard;
