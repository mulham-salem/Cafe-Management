import React, { useState, useEffect } from "react";
import styles from "./styles/ChangePassword.module.css";
import logo from "/logo_1.png";
import { Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ChangePassword = () => {
  
  useEffect(() => {
    document.title = "Cafe Delights - Change Password";
  }, []);

  const location = useLocation();
  const from = location.state?.from || "/login";

  const [isTextVisible, setIsTextVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTextVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const [showPassword, setShowPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const path = location.pathname;

  let apiBase = "http://localhost:8000/api/user";

  if (path.includes("/login/manager-dashboard")) {
    apiBase = "http://localhost:8000/api/manager";
  } else if (path.includes("/login/supplier-home")) {
    apiBase = "http://localhost:8000/api/supplier";
  } else if (path.includes("/login/employee-home")) {
    apiBase = "http://localhost:8000/api/employee";
  } else if (path.includes("/login/customer-home")) {
    apiBase = "http://localhost:8000/api/customer";
  }

  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if ( !role ) return null;
    return sessionStorage.getItem(`${role}Token`) || localStorage.getItem(`${role}Token`);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getCurrentToken();
    if ( !token ) return;

    try {
      const response = await axios.post(
        `${apiBase}/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message || "Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password update failed.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img
            src={logo}
            alt="Cafe Delights Logo"
            className={`${styles.logo} ${isTextVisible ? styles.fadeInUp : ""}`}
          />
          <h1 className={styles.name}>Cafe Delights</h1>
        </div>
        <h2 className={styles.title}>Keep Your Account Secure</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.toggle}>
            <input
              type="checkbox"
              id="showPass"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPass">Show Password</label>
          </div>

          <button type="submit" className={styles.saveBtn}>
            Save Password
          </button>

          <div className={styles.backLink}>
            <Link to={from}> {`← Back to my account`} </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
