import React, { useState, useEffect } from "react";
import logo from "/logo_1.png";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUtensils,
  faClipboardList,
  faChair,
  faSignOutAlt,
  faUserAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/CustomerHome.module.css";
import { toast as toastify } from "react-toastify";
import { toast, Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from "axios";
import { motion } from "framer-motion";
import Complaint from "./Complaint";
import { createContext } from "react";
export const CusSearchContext = createContext({
  searchQuery: "",
  setSearchQuery: () => {},
  searchPlaceholder: "",
  setSearchPlaceholder: () => {},
});

const cardVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -5, x: 100 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    x: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const cards = [
  {
    title: "Menu & Order",
    description: "Explore our menu and create your perfect order.",
    icon: faUtensils,
    link: "menu-order",
  },
  {
    title: "User Orders",
    description: "View, confirm, modify or cancel your orders.",
    icon: faClipboardList,
    link: "user-order",
  },
  {
    title: "Table Reservations",
    description: "Reserve your table now and enjoy the best experience.",
    icon: faChair,
    link: "table-reservation",
  },
  {
    title: "Notifications",
    description: "Stay updated with your order and reservation status.",
    icon: faBell,
    link: "customer-notification",
  },
];

const CustomerHome = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Customer Home";
    profile();
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;
  const [complaintOpen, setComplaintOpen] = useState(false);
  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search...");

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
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

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
      toastify.error(errorMessage);
    }
  };

  const [userName, setUserName] = useState("User");

  const profile = async () => {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        "http://localhost:8000/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserName(response.data.name || "User");
    } catch (error) {
      //toastify.error("Failed to fetch user name");
    }
  };

  return (
    <div className={styles.container}>
      <Toaster />
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
          <span className={styles.brandName}>Cafe Delights</span>
          <ul className={styles.navLinks}>
            <li>
              <Link to="/login/customer-home" className={styles.activeLink}>
                {" "}
                Home{" "}
              </Link>
            </li>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <Link
                onClick={() => setComplaintOpen(true)}
                className={styles.activeLink}
              >
                {" "}
                Support{" "}
              </Link>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>
        <div className={styles.rightSection}>
          {(location.pathname.includes("/menu-order") ||
            location.pathname.includes("/user-order")) && (
            <div className={styles.searchContainer}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          )}

          <div className={styles.username}>
            {userName}
            <div className={styles.dropdown}>
              <Link to="my-account" className={styles.dropdownLink}>
                <button className={styles.dropdownButton}>
                  <FontAwesomeIcon icon={faUserAlt} />
                  <span>My Account</span>
                </button>
              </Link>
              <Link onClick={handleLogout} className={styles.dropdownLink}>
                <button className={styles.dropdownButton}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              </Link>
            </div>
          </div>
          <Link to="customer-notification" className={styles.bellIcon}>
            <FontAwesomeIcon icon={faBell} title="Notifications" />
          </Link>
        </div>
      </nav>

      {currentPath === "/login/customer-home" && (
        <header className={styles.hero}>
          <div className={styles.overlay}>
            <h1 className={styles.title}>TIME TO DISCOVER COFFEE HOUSE</h1>
            <p className={styles.subtitle}>
              The coffee is brewed by first roasting the green coffee beans over
              hot coals in a brazier given an opportunity to sample.
            </p>
          </div>
        </header>
      )}

      {currentPath === "/login/customer-home" && (
        <main className={styles.mainContent}>
          <div className={styles.cardsGrid}>
            {cards.map((card, index) => (
              <Link to={card.link} key={index} className={styles.card}>
                <motion.div
                  key={index}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FontAwesomeIcon
                    icon={card.icon}
                    className={styles.cardIcon}
                  />
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDesc}>{card.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </main>
      )}

      {complaintOpen && (
        <Complaint
          open={complaintOpen}
          onClose={() => setComplaintOpen(false)}
        />
      )}

      <CusSearchContext.Provider
        value={{
          searchQuery,
          setSearchQuery,
          searchPlaceholder,
          setSearchPlaceholder,
        }}
      >
        <div className={styles.outletContainer}>
          <Outlet />
        </div>
      </CusSearchContext.Provider>
    </div>
  );
};

export default CustomerHome;
