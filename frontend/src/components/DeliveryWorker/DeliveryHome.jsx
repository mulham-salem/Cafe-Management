import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Package, MapPin, Clock } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUserAlt,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import logo from "/logo_1.png";
import styles from "../styles/DeliveryHome.module.css";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import DeliveryLocation from "./DeliveryLocation";
import useChattingNotification from "../../hooks/ChattingNotification";
import useUnreadNotifications from "../../hooks/UnreadNotifications";

// Framer Motion variants
const pageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.33, 1, 0.68, 1],
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardHover = {
  scale: 1.03,
  y: -4,
  boxShadow: "0 32px 64px rgba(2,6,23,0.16)",
  transition: { type: "spring", stiffness: 50, damping: 5 },
};

export default function DeliveryHome() {
  useEffect(() => {
    document.title = "Cafe Delights - Delivery Home";
    profile();
  }, []);

  const [workerName, setWorkerName] = useState("Delivery Worker");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount, loadingCount } = useUnreadNotifications();
  useChattingNotification();

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
          { duration: 3500, position: "top-right" }
        );
        window.history.replaceState({}, document.title);
      }, 1500);
    }
  }, [location.state]);

  const handleLogout = async () => {
    const token =
      sessionStorage.getItem("delivery_workerToken") ||
      localStorage.getItem("delivery_workerToken");

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

      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      const successMessage = response.data.message || "Logged out successfully";
      navigate("/login", { state: { message: successMessage } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Logout failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const profile = async () => {
    const token =
      sessionStorage.getItem("delivery_workerToken") ||
      localStorage.getItem("delivery_workerToken");

    try {
      const response = await axios.get(
        "http://localhost:8000/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWorkerName(response.data.firstName || "Delivery Worker");
    } catch (error) {
      console.error(error);
      // toast.error("Failed to fetch worker name");
    }
  };

  async function checkNewDeliveryOrders() {
    const token =
      sessionStorage.getItem("delivery_workerToken") ||
      localStorage.getItem("delivery_workerToken");
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/user/delivery-worker/delivery-orders/check-new",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data; // { hasNewOrders: true/false, message?: string }
    } catch (error) {
      console.error(error);
      return { hasNewOrders: false };
    }
  }

  useEffect(() => {
    async function fetchNotifications() {
      const res = await checkNewDeliveryOrders();
      setTimeout(() => {
        if (res.hasNewOrders) {
          toast.custom((t) => (
            <span
              className={`${styles.toastNewNotify} ${
                t.visible ? styles.enter : styles.leave
              }`}
            >
              {res.message}
            </span>
          ));
        }
      }, 3000);
    }

    fetchNotifications();
  }, []);

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      <Toaster />
      <ToastContainer />
      {/* Navbar */}
      <header className={styles.navbar}>
        {/* يمين: اللوغو + اسم المقهى */}
        <div className={styles.logoSection}>
          <motion.img
            src={logo}
            alt="Cafe Delights Logo"
            className={styles.logo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <Link
              to="/login/delivery-home"
              className={styles.cafeName}
              title="home"
            >
              Cafe Delights
            </Link>
          </motion.span>
        </div>

        <div className={styles.rightSection}>
          {/* يسار: اسم المستخدم + جرس */}
          <motion.div
            className={styles.username}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {workerName}
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
              <Link onClick={handleLogout} className={styles.dropdownLink}>
                <button className={styles.dropdownButton}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link to="delivery-notification" title="Notifications" className={styles.iconWrapper}>
              <Bell className={styles.bellIcon} />
              {!loadingCount && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* MAIN*/}
      <main className={styles.main}>
        {/* DEFAULT CARDS */}
        {location.pathname === "/login/delivery-home" && (
          <AnimatePresence>
            <motion.div
              className={styles.cardsWrap}
              variants={cardVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
            >
              <motion.div
                className={`${styles.card} ${styles.cardGreen}`}
                role="button"
                tabIndex={0}
                whileHover={cardHover}
                whileTap={{ scale: 0.98 }}
                variants={cardVariants}
              >
                <div className={styles.cardHead}>
                  <Package
                    className={`${styles.cardIcon} ${styles.iconInteractive}`}
                  />
                  <h3 className={styles.cardTitle}>Delivery Orders</h3>
                </div>
                <p className={styles.cardText}>
                  View and manage your assigned deliveries.
                </p>
                <div className={styles.cardFoot}>
                  <span className={styles.cardMeta}>
                    <Clock className={styles.metaIcon} /> Live feed
                  </span>
                  <Link to="delivery-order" className={styles.cardAction}>
                    Open
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className={`${styles.card} ${styles.cardGray}`}
                role="button"
                tabIndex={0}
                whileHover={cardHover}
                whileTap={{ scale: 0.98 }}
                variants={cardVariants}
              >
                <div className={styles.cardHead}>
                  <MapPin
                    className={`${styles.cardIcon} ${styles.iconInteractive}`}
                  />
                  <h3 className={styles.cardTitle}>Location</h3>
                </div>
                <p className={styles.cardText}>
                  Track and update your current location on the map.
                </p>
                <div className={styles.cardFoot}>
                  <span className={styles.cardMeta}>GPS ready</span>
                  <button
                    className={styles.cardActionNeutral}
                    onClick={() => setShowLocationModal(true)}
                  >
                    Open
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        <Outlet />
        <DeliveryLocation
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          isEditable={true}
        />
      </main>
    </motion.div>
  );
}
