import React, { useEffect } from 'react';
import useOrderNotifications from '../../hooks/useOrderNotifications';
import logo from '../../assets/logo_1.png';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUtensils, faClipboardList, faChair, faKey } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/CustomerHome.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";

const cards = [
  {
    title: 'Menu & Order',
    description: 'Explore our menu and create your perfect order.',
    icon: faUtensils,
    link: 'menu-order',
  },
  {
    title: 'User Orders',
    description: 'View, confirm, modify or cancel your orders.',
    icon: faClipboardList,
    link: 'user-order',
  },
  {
    title: 'Table Reservations',
    description: 'Reserve your table now and enjoy the best experience.',
    icon: faChair,
    link: 'table-reservation',
  },
  {
    title: 'Notifications',
    description: 'Stay updated with your order and reservation status.',
    icon: faBell,
    link: 'customer-notification',
  },
];

const CustomerHome = () => {

  useOrderNotifications();  

  useEffect(() => {
   document.title = "Cafe Delights - Customer Home";
  }, []);  
  
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={styles.container}>
      <ToastContainer />
      <nav className={styles.navbar}>
        <div className={styles.leftSection}>
          <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
          <span className={styles.brandName}>Cafe Delights</span>
          <ul className={styles.navLinks}>
            <li><Link to="/login/customer-home" className={styles.activeLink}> Home </Link></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Pages</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><Link to="/login" className={styles.activeLink}> Logout </Link></li>
          </ul>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.username}>
            Customer Name
            <div className={styles.dropdown}>
                <Link to="/change-password" state={{from:location.pathname}} className={styles.dropdownLink}>
                    <button className={styles.dropdownButton}>
                        <FontAwesomeIcon icon={faKey} className={styles.keyIcon}/><span>Change Password</span>
                    </button>
                </Link>
            </div>
          </div>
          <Link to="customer-notification" className={styles.bellIcon}>
            <FontAwesomeIcon icon={faBell} title='Notifications' />
          </Link>
        </div>
      </nav>

      {currentPath === "/login/customer-home" && (
      <header className={styles.hero}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>TIME TO DISCOVER COFFEE HOUSE</h1>
          <p className={styles.subtitle}>
            The coffee is brewed by first roasting the green coffee beans over hot coals in a brazier<br/> given an opportunity to sample.
          </p>
        </div>
      </header>
      )}
     
     {currentPath === "/login/customer-home" && (
      <main className={styles.mainContent}>
        <div className={styles.cardsGrid}>
          {cards.map((card, index) => (
            <Link to={card.link} key={index} className={styles.card}>
              <FontAwesomeIcon icon={card.icon} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.description}</p>
            </Link>
          ))}
        </div>
      </main>
     )}

      <div className={styles.outletContainer}>
        <Outlet />
      </div>
    </div>
  );
};

export default CustomerHome;