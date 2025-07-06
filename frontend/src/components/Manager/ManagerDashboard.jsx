import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from '../styles/ManagerDashboard.module.css';
import logo from '/logo_1.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faUtensils, faChair, faBoxes, faBullhorn, faBell, faSignOutAlt, faKey, faHome } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const ManagerDashboard = () => {

  const location = useLocation();
  const currentPath = location.pathname;

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
    if (currentPath === "/login/manager-dashboard") return "Manager Dashboard";
    if (currentPath.includes("/user-management")) return "User Management";
    if (currentPath.includes("/menu-management")) return "Menu Management";
    if (currentPath.includes("/table-management")) return "Table Management";
    if (currentPath.includes("/inventory-supply")) return "Inventory & Supply";
    if (currentPath.includes("/promotion-management")) return "Promotion Management";
    if (currentPath.includes("/manager-notification")) return "Notifications Page";
    return "";
  };

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
      const response = await axios.post('http://localhost:8000/api/manager/logout', null, 
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

  const [managerName, setManagerName] = useState('Manager');

  const profile = async () => {

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    try {
      const response = await axios.get('http://localhost:8000/api/manager/profile',
      {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });

      setManagerName(response.data.name || 'Manager');

    } catch (error) {
        //toast.error("Failed to fetch manager name");
    }
  };
  
  useEffect(() => {
    const checkNewNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  
        const response = await axios.get("http://localhost:8000/api/manager/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const allNotifications = response.data.notifications;
  
        const unseenSupplyOffers = allNotifications.filter(n =>
          n.seen === 0 && n.purpose === 'Supply Offer'
        );
  
        const unseenSupplyResponses = allNotifications.filter(n =>
          n.seen === 0 && n.purpose === 'Response For Supply Request'
        );
  
        if (unseenSupplyOffers.length > 0) {

          toast.info(`You received ${unseenSupplyOffers.length} new supply offer${unseenSupplyOffers.length > 1 ? 's' : ''}.`);
  
          const ids = unseenSupplyOffers.map(n => n.id);
          await Promise.all(
            ids.map(id =>
              axios.patch(`http://localhost:8000/api/manager/notifications/${id}/seen`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
          );
        }
  
        if (unseenSupplyResponses.length > 0) {

          toast.info(`You received ${unseenSupplyResponses.length} new response${unseenSupplyResponses.length > 1 ? 's' : ''} for your supply request.`);
  
          const ids = unseenSupplyResponses.map(n => n.id);
          await Promise.all(
            ids.map(id =>
              axios.patch(`http://localhost:8000/api/manager/notifications/${id}/seen`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
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
  
  
  return (
    <div className={styles.dashboard}>
        <ToastContainer/>
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <FontAwesomeIcon icon={faBars} className={`${styles.menuIcon} ${sidebarOpen ? styles.open : styles.close}`} onClick={toggleSidebar} />
                <div className={styles.logoSection}>
                    <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
                    <h1 className={styles.cafeName}>Cafe Delights</h1>
                </div>
            </div>
            <div className={styles.headerCenter}>
                <span className={styles.pageTitle}>{getTitle()}</span>
		        </div>
            <div className={styles.rightSection}>
                <div className={styles.managerName}>
                    {managerName}
                    <div className={styles.dropdown}>
                        <span className={styles.dropdownLink}>
                            <button onClick={handleLogout} className={styles.dropdownButton}>
                               <FontAwesomeIcon icon={faSignOutAlt} className={styles.logoutIcon}/>
                               <span className={styles.logout}>Logout</span> 
                            </button>
                        </span>
                        <Link to="/change-password" state={{from:location.pathname}} className={styles.dropdownLink}>
                            <button className={styles.dropdownButton}>
                                <FontAwesomeIcon icon={faKey} className={styles.keyIcon}/><span className={styles.changePassword}>Change Password</span>
                            </button>
                        </Link>
                    </div>
                </div>
                <Link to="manager-notification">
                    <FontAwesomeIcon icon={faBell} title="Notifications" className={styles.notificationIcon} />
                </Link>
            </div>
        </header>

        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''} ${styles.sidebar} ${isTextVisible ? styles.fadeIn : ''}`}>
            <ul>
                <li>
                    <Link to="/login/manager-dashboard" className={currentPath === "/login/manager-dashboard" ? styles.active :  styles.inactive}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="user-management" className={currentPath === "/login/manager-dashboard/user-management" ? styles.active :  styles.inactive}>
                        <FontAwesomeIcon icon={faUsers} className={styles.icon} />
                        User Management
                    </Link>
                </li>
                <li>
                    <Link to="menu-management" className={currentPath === "/login/manager-dashboard/menu-management" ? styles.active :  styles.inactive}>
                        <FontAwesomeIcon icon={faUtensils} className={styles.icon} />
                        Menu Management
                    </Link>
                </li>
                <li>
                    <Link to="table-management" className={currentPath === "/login/manager-dashboard/table-management" ? styles.active :  styles.inactive}>
                        <FontAwesomeIcon icon={faChair} className={styles.icon} />
                        Table Management
                    </Link>
                </li>
                <li>
                    <Link to="inventory-supply" className={currentPath === "/login/manager-dashboard/inventory-supply" ? styles.active :  styles.inactive}>
                        <FontAwesomeIcon icon={faBoxes} className={styles.icon} />
                        Inventory & Supply
                    </Link>
                </li>
                <li>
                    <Link to="promotion-management" className={currentPath === "/login/manager-dashboard/promotion-management" ? styles.active :  styles.inactive}>
                        <FontAwesomeIcon icon={faBullhorn} className={styles.icon} />
                        Promotion Manage
                    </Link>
                </li>
            </ul>
        </aside>
        <main className={styles.mainContent}>
            {currentPath === "/login/manager-dashboard" && (
            <div className={ `${styles.mainText} ${isTextVisible ? styles.fadeIn : ''}`}>
                <h2>
                    <span className={styles.highlight}>Welcome back, {managerName} </span> <br />
                    <span className={styles.sub}>Your command center is brewed and ready.</span>
                    <span className={styles.keywords}>
                        User <strong>Roles</strong>, Menu <strong>Magic</strong>, Table <strong>Mastery</strong>,
                        Inventory <strong>Control</strong>, Promotion <strong>Power</strong>.
                    </span>
                    <span className={styles.cta}>
                        Steer your café’s success <strong>–</strong> one click at a time.
                    </span>
                </h2>
            </div>
            )}
            <Outlet/>
        </main>
    </div>
  );
}

export default ManagerDashboard;

