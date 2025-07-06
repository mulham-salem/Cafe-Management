import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './styles/Login.module.css';
import logo from '/logo_1.png'; 
import bg from '/coffee-bg.png'; 


function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Cafe Delights - Login";
  }, []);  

  const [isTextVisible1, setIsTextVisible1] = useState(false);
  const [isTextVisible2, setIsTextVisible2] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setIsTextVisible1(true), 1000);
    const timer2 = setTimeout(() => setIsTextVisible2(true), 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
      e.preventDefault();
  
      const isManager = username.toLowerCase().startsWith("manager");
      const endpoint = isManager
        ? "http://localhost:8000/api/manager/login"
        : "http://localhost:8000/api/user/login";
  
      try {
        const response = await axios.post(endpoint,
          {
            username,
            password,
          },
          {
            withCredentials: true,
          }
        );
  
        const token = response.data.token;
        const role = response.data.role || null;
        const successMessage = response.data.message || "Logged in successfully"; 

        if (rememberMe) {
          localStorage.setItem("authToken", token);
        } else {
          sessionStorage.setItem("authToken", token);
        }
      
        if (isManager) {
          navigate("/login/manager-dashboard", { state: { successMessage } }); 
        } else if (role === "employee") {
          navigate("/login/employee-home", { state: { successMessage } });
        } else if (role === "supplier") {
          navigate("/login/supplier-home", { state: { successMessage } });
        } else if (role === "customer") {
          navigate("/login/customer-home", { state: { successMessage } });
        } else {
          toast.warning("Unknown role. Please contact support.");
        }

      } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        toast.error(<div dangerouslySetInnerHTML={{ __html: errorMessage }} />);
      }
  };

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <ToastContainer position="top-center" autoClose={3000} />
        <div className={ `${styles.leftText} ${isTextVisible1 ? styles.fadeIn : ''}`}>
          <h1> Start your day with flavor and warmth at <span> Cafe Delights </span> </h1>
        </div>

        <div className={styles.card}>
        <img src={logo} alt="Cafe Logo" className={`${styles.logo} ${isTextVisible2 ? styles.fadeInUp : ''}`} />
        <h2 className={styles.title}>Cafe Delights</h2>
        <form className={styles.form} onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className={styles.options}>
            <label>
              <input 
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
            </div>
            <button type="submit">Login</button>
        </form>
        </div>
    </div>
  );
}

export default Login;