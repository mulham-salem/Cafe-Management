import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import styles from '../styles/ManagerDashboard.module.css';
import logo from '../../assets/logo_1.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faUtensils, faChair, faBoxes, faBullhorn, faBell, faSignOutAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const ManagerDashboard = () => {

    const location = useLocation();
    const currentPath = location.pathname;

    useEffect(() => {
        document.title = "Cafe Delights - Manager Dashboard";
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

  return (
    <div className={styles.dashboard}>
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
                    Manager Name
                    <div className={styles.dropdown}>
                        <Link to="/login" className={styles.dropdownLink}>
                            <button className={styles.dropdownButton}>
                                <FontAwesomeIcon icon={faSignOutAlt} className={styles.logoutIcon}/><span className={styles.logout}>Logout</span> 
                            </button>
                        </Link>
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
                    <span className={styles.highlight}>Welcome back,</span>  John Doe!<br />
                    <span className={styles.sub}>Your command center is brewed and ready.</span><br />
                    <span className={styles.keywords}>
                        User <strong>Roles</strong>, Menu <strong>Magic</strong>, Table <strong>Mastery</strong>,<br />
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







