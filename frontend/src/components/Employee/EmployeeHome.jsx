import React, { useState, useEffect } from 'react';
import logo from '/logo_1.png';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUtensils, faClipboardList, faFire, faKey, faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/EmployeeHome.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";
import { createContext } from 'react';
export const OrderSearchContext = createContext('');
import { motion } from 'framer-motion';
import axios from 'axios';


const cards = [
  {
    title: 'Menu & Order',
    description: 'Browse menu items and manage order requests.',
    icon: faUtensils,
    link: 'menu-order',
  },
  {
    title: 'User Orders',
    description: 'Track, update, or complete user orders.',
    icon: faClipboardList,
    link: 'user-order',
  },
  {
    title: 'Kitchen',
    description: 'Monitor kitchen queue and prepare orders efficiently.',
    icon: faFire,
    link: 'kitchen-order',
  },
  {
    title: 'Notifications',
    description: 'Check real-time updates and alerts from the system.',
    icon: faBell,
    link: 'employee-notification',
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (location.state && location.state.successMessage) {
        toast.success(location.state.successMessage);
        window.history.replaceState({}, document.title);
    }
  }, [location.state])
  
  const navigate = useNavigate();

  const handleLogout = async () => {

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    try {
      const response = await axios.post('http://localhost:8000/api/user/logout', null, 
      {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      const successMessage = response.data.message || "Logged out successfully"; 
      navigate('/login', { state: { message: successMessage } });

    } catch (error) {
        const errorMessage = error.response?.data?.message || "Logout failed. Please try again.";
        toast.error(errorMessage);
    }
  };

  const [userName, setUserName] = useState('User');

  const profile = async () => {

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    try {
      const response = await axios.get('http://localhost:8000/api/user/profile',
      {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });

      setUserName(response.data.name || 'User');

    } catch (error) {
        toast.error("Failed to fetch user name");
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
          <span className={styles.brandName}>Cafe Delights</span>
          <ul className={styles.navLinks}>
            <li><Link to="/login/employee-home" className={styles.activeLink}> Home </Link></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Pages</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><Link onClick={handleLogout} className={styles.activeLink}> Logout </Link></li>
          </ul>
        </div>
        <div className={styles.rightSection}>

        {location.pathname.includes('/user-order') && (
            <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search Order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}


          <div className={styles.username}>
          {userName}
            <div className={styles.dropdown}>
                <Link to="/change-password" state={{from:location.pathname}} className={styles.dropdownLink}>
                    <button className={styles.dropdownButton}>
                        <FontAwesomeIcon icon={faKey} className={styles.keyIcon}/><span>Change Password</span>
                    </button>
                </Link>
            </div>
          </div>
          <Link to="employee-notification" className={styles.bellIcon}>
            <FontAwesomeIcon icon={faBell} title='Notifications' />
          </Link>
        </div>
      </nav>

      {currentPath === "/login/employee-home" && (
      <header className={styles.hero}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>WELCOME TO THE KITCHEN COMMAND</h1>
          <p className={styles.subtitle}>
            Here is where culinary magic begins. Focus on precision, flavor,<br/> and delivering perfection one plate at a time.
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
              <FontAwesomeIcon icon={card.icon} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.description}</p>
            </Link>
            </motion.div>
          ))}
        </div>
      </main>
     )}

      <OrderSearchContext.Provider value={searchTerm}>
        <div className={styles.outletContainer}>
          <Outlet />
        </div>
     </OrderSearchContext.Provider> 
    </div>
  );
};

export default EmployeeHome;