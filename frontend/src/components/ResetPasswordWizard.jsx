import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/ResetPasswordWizard.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEnvelope, FaLock } from "react-icons/fa";

const ResetPasswordWizard = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Reset Password";
  }, []);

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  // API Calls
  const handleForgotPassword = async () => {
    try {
      // await axios.post("/api/forgot-password", {
      //   email: formData.email,
      // });
      toast.success("Reset link has been sent to your email");
      setStep(2);
    } catch (error) {
      toast.error("Failed to send the link. Please check your email.");
    }
  };

  const handleResetPassword = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    try {
      //   await axios.post("/api/reset-password", {
      //     token,
      //     email: formData.email,
      //     password: formData.password,
      //     password_confirmation: formData.password_confirmation,
      //   });
      toast.success("Password changed successfully");
      setStep(3);
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    } catch (error) {
      toast.error("Failed to change password.");
    }
  };

  // Form Steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2> Reset Password </h2>
            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.icon} />
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <button className={styles.btn} onClick={handleForgotPassword}>
              Send Reset Link
            </button>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
          <div className={styles.emailIcon}>
            <FaEnvelope />
          </div>
          <h2>Check Your Email</h2>
          <p>We've sent a password reset link to your email address.</p>
          <p className={styles.note}>If you didn't receive the link, please check your spam folder or click the button below to resend.</p>
          
          <button className={styles.btn} onClick={handleForgotPassword}>
            Resend Link
          </button>
          
          <div className={styles.supportLink}>
            Still having trouble? <a href="#support">Contact support</a>
          </div>
        </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <h2> Reset Password</h2>
            <div className={styles.inputGroup}>
              <FaLock className={styles.icon} />
              <input
                type="password"
                placeholder="New password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <FaLock className={styles.icon} />
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
              />
            </div>
            <button className={styles.btn} onClick={handleResetPassword}>
              Save Changes
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    { id: 1, label: "Information" },
    { id: 2, label: "Details" },
    { id: 3, label: "Confirmation" },
  ];

  const progressWidth = ((step - 1) / (steps.length - 1)) * 94;

  return (
    <div className={styles.container}>
      <ToastContainer autoClose={3000} />
      <div className={styles.cardContainer}>
        <div className={styles.progressbar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressWidth}%` }}
          ></div>

          {steps.map(({ id, label }) => (
            <div key={id} className={styles.stepWrapper}>
              <div
                className={`${styles.circle} ${
                  step >= id ? styles.active : ""
                }`}
              >
                {id}
              </div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
          ))}
        </div>

        {step > 1 && (
          <button className={styles.btnPrev} onClick={() => setStep(step - 1)}>
            ← Previous
          </button>
        )}
        {/* Step Content */}
        <div className={styles.card}>{renderStep()}</div>
      </div>
    </div>
  );
};

export default ResetPasswordWizard;
