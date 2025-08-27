import React, { useState, useEffect } from "react";
import logo from "/logo_1.png";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChair,
  faUtensils,
  faClipboardList,
  faFire,
  faSearch,
  faMessage,
  faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/EmployeeHome.module.css";
import { toast as toastify } from "react-toastify";
import { toast, Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import { createContext } from "react";
export const EmpSearchContext = createContext({
  searchQuery: "",
  setSearchQuery: () => {},
  searchPlaceholder: "",
  setSearchPlaceholder: () => {},
});
import { motion } from "framer-motion";
import axios from "axios";
import SidebarToggle from "../SidebarToggle";
import { useActiveTab } from "../../context/ActiveTabContext";

const cards = [
  {
    title: "Menu & Order",
    description: "Browse menu items and manage order requests.",
    icon: faUtensils,
    link: "menu-order",
  },
  {
    title: "Order Management",
    description: "Manage orders easily with customer support.",
    icon: faClipboardList,
    link: "user-order",
  },
  {
    title: "Kitchen",
    description: "Monitor kitchen queue and prepare orders efficiently.",
    icon: faFire,
    link: "kitchen-order",
  },
  {
    title: "Table Management",
    description: "Update and view your tables in real-time",
    icon: faChair,
    link: "table-management",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const EmployeeHome = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Employee Home";
    profile();
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;
  const { activeTab } = useActiveTab();

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
              <Link to="/login/employee-home" className={styles.activeLink}>
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
              <a href="#">Contact Us</a>
            </li>
            <li>
              <Link onClick={handleLogout} className={styles.activeLink}>
                {" "}
                Logout{" "}
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.rightSection}>
          {(location.pathname.includes("/menu-order") ||
            location.pathname.includes("/user-order") ||
            location.pathname.includes("/kitchen-order") ||
            location.pathname.includes("/table-management") ||
            location.pathname.includes("/user-management") ||
            location.pathname.includes("/menu-management") ||
            location.pathname.includes("/promotion-management") ||
            (location.pathname.includes("/inventory-supply") &&
              activeTab === "inventory") ||
            (location.pathname.includes("/inventory-supply") &&
              activeTab === "offers") ||
            (location.pathname.includes("/inventory-supply") &&
              activeTab === "purchaseBills") ||
            (location.pathname.includes("/inventory-supply") &&
              activeTab === "supplyHistory")) && (
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
                  <FontAwesomeIcon icon={faUserAlt} className={styles.icon} />
                  <span>My Account</span>
                </button>
              </Link>
              <Link to="message" className={styles.dropdownLink}>
                <button className={styles.dropdownButton}>
                  <FontAwesomeIcon icon={faMessage} className={styles.icon} />
                  <span>Messages</span>
                </button>
              </Link>
            </div>
          </div>
          <Link to="employee-notification" className={styles.bellIcon}>
            <FontAwesomeIcon icon={faBell} title="Notifications" />
          </Link>
        </div>
      </nav>

      {currentPath === "/login/employee-home" && (
        <header className={styles.hero}>
          <div className={styles.overlay}>
            <h1 className={styles.title}>WELCOME TO THE KITCHEN COMMAND</h1>
            <p className={styles.subtitle}>
              Here is where culinary magic begins. Focus on precision, flavor,
              and delivering perfection one plate at a time.
            </p>
          </div>
        </header>
      )}

      {currentPath === "/login/employee-home" && (
        <main className={styles.mainContent}>
          <div className={styles.cardsGrid}>
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={styles.cardsGrid}
              >
                <Link to={card.link} key={index} className={styles.card}>
                  <FontAwesomeIcon
                    icon={card.icon}
                    className={styles.cardIcon}
                  />
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDesc}>{card.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </main>
      )}

      {currentPath === "/login/employee-home" && (
        <div className={styles.sidebarWrapper}>
          <SidebarToggle roleProp="employee" />
        </div>
      )}
      <EmpSearchContext.Provider
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
      </EmpSearchContext.Provider>
    </div>
  );
};

export default EmployeeHome;
