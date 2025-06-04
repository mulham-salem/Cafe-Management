import React, { useState, useEffect } from 'react';
import styles from './styles/Login.module.css';
import logo from '../assets/logo_1.png'; 
import bg from '../assets/coffee-bg.png'; 

function Login() {

    useEffect(() => {
        document.title = "Cafe Delights - Login";
    }, []);  

    const [isTextVisible1, setIsTextVisible1] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setIsTextVisible1(true);
        }, 1000);

        return () => clearTimeout(timer1);
    }, []);

    const [isTextVisible2, setIsTextVisible2] = useState(false);

    useEffect(() => {
        const timer2 = setTimeout(() => {
            setIsTextVisible2(true);
        }, 200);

        return () => clearTimeout(timer2);
    }, []);

    return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
        <div className={ `${styles.leftText} ${isTextVisible1 ? styles.fadeIn : ''}`}>
        <h1>Start your day with flavor and warmth <br/> at <span>Cafe Delights</span></h1>
        </div>

        <div className={styles.card}>
        <img src={logo} alt="Cafe Logo" className={`${styles.logo} ${isTextVisible2 ? styles.fadeInUp : ''}`} />
        <h2 className={styles.title}>Cafe Delights</h2>
        <form className={styles.form}>
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <div className={styles.options}>
            <label>
                <input type="checkbox" id="remember"/>
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