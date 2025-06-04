import React, { useState, useEffect } from 'react';
import styles from './styles/ChangePassword.module.css';
import logo from '../assets/logo_1.png'; 
import { Link, useLocation } from 'react-router-dom';

const ChangePassword = () => {
    useEffect(() => {
        document.title = "Cafe Delights - Change Password";
    }, []);  

    const location = useLocation();
    const from = location.state?.from || '/login';

    const [isTextVisible, setIsTextVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTextVisible(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src={logo} alt="Cafe Delights Logo" className={`${styles.logo} ${isTextVisible ? styles.fadeInUp : ''}`} />
        <h1 className={styles.name}>Cafe Delights</h1>
        <h2 className={styles.title}>Keep Your Account Secure</h2>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" />
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter new password" />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <input type={showPassword ? 'text' : 'password'} placeholder="Confirm new password" />
          </div>

          <div className={styles.toggle}>
            <input type="checkbox" id="showPass" onChange={() => setShowPassword(!showPassword)} />
            <label htmlFor="showPass">Show Password</label>
          </div>

          <button type="submit" className={styles.saveBtn}>Save Password</button>

          <div className={styles.backLink}>
            <Link to={from}> {`← Back to home`} </Link>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;