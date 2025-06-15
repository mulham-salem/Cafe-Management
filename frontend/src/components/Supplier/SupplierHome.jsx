import React, { useState, useEffect } from "react";
import styles from "../styles/SupplierHome.module.css";
import logo from '/logo_1.png';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBell, faSignOutAlt,  faKey } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

const SupplierHome = () => {

  useEffect(() => {
      document.title = "Cafe Delights - Supplier Home";
      profile();
  }, []);  

  const location = useLocation();
  const currentPath = location.pathname;
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'send';
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  const [title, setTitle] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([
    { name: "", quantity: "", unit: "", unitPrice: "" },
  ]);

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: "", unit: "", unitPrice: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !deliveryDate.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    for (let item of items) {
      if (!item.name.trim() || !item.quantity || !item.unitPrice) {
        toast.error("Please complete all item fields.");
        return;
      }
    }

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    try {
      const response = await axios.post('http://localhost:8000/api/supplier/offers', {
        title,
        delivery_date: deliveryDate,
        note,
        items: items.map(item => ({
          name: item.name,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unit_price: parseFloat(item.unitPrice)
        }))
      }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message);
      setTitle("");
      setDeliveryDate("");
      setNote("");
      setItems([{ name: "", quantity: "", unit: "", unitPrice: "" }]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit offer. Please try again.";
      toast.error(errorMessage);
    }
  };

  const [myOffers, setMyOffers] = useState([]);

  useEffect(() => {
    if (activeTab === 'view') {
      fetchMyOffers();
    }
  }, [activeTab]);

  const fetchMyOffers = async () => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:8000/api/supplier/view-offers', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setMyOffers(response.data.offers);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch offers.";
      toast.error(errorMessage);
    }
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
        <Link to="/login/supplier-home" className={styles.navIcon}>
          <FontAwesomeIcon icon={faHome} title="Home"/>
        </Link>
        <div className={styles.brand}>
          <img src={logo} alt="Cafe Delights Logo" className={styles.logo} />
          <span>Cafe Delights</span>
        </div>
        <div className={styles.rightSection}>
            <div className={styles.userArea}>
            {userName}
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
            <Link to="supplier-notification" className={styles.navIcon}>
                <FontAwesomeIcon icon={faBell} title="Notifications" />
            </Link>
        </div>
      </nav>

      {currentPath === "/login/supplier-home" && (
        <div className={styles.heroText}>
        
            <h1>Welcome, dear supplier!</h1>
            <p>Manage your supply offers and stay updated.</p>
        </div>
      )}

      {currentPath === "/login/supplier-home" && (
        <div className={styles.tabs}>
            <button
            className={activeTab === "send" ? styles.activeTab : ''}
            onClick={() => changeTab("send")}
            >
            Send Supply Offer
            </button>
            <button
            className={activeTab === "view" ? styles.activeTab : ''}
            onClick={() => changeTab("view")}
            >
            View My Offers
            </button>
        </div>
      )}   

      <main className={styles.mainContent}>
      {currentPath === "/login/supplier-home" && activeTab === "send" && (
        
        <form className={styles.offerForm} onSubmit={handleSubmit}>
          <input type="text" placeholder="Offer Title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input type="datetime-local" value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
      
            required
          />
          <textarea placeholder="Additional Notes (Optional)" value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <h4>Items</h4>
          {items.map((item, index) => (
         
            <div key={index} className={styles.itemRow}>
              <input type="text" placeholder="Item Name" value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
              
              />
              <input type="number" placeholder="Quantity" value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
              />
    
              <input type="text" placeholder="Unit" value={item.unit}
                onChange={(e) =>
                  handleItemChange(index, "unit", e.target.value)
                }
              />
          
              <input type="number" placeholder="Unit Price" value={item.unitPrice}
                onChange={(e) =>
                  handleItemChange(index, "unitPrice", e.target.value)
                }
              />
            </div>
 
          ))}
          <button
            type="button"
            className={styles.addItemBtn}
            onClick={handleAddItem}
          >
            + Add Item
       
          </button>
          <button type="submit" className={styles.submitBtn}>
            Submit Offer
          </button>
        </form>
      )}

      {currentPath === "/login/supplier-home"  && activeTab === "view" && (
          <div className={styles.offersList}>
            
            {myOffers.length > 0 ? (
                myOffers.map((offer) => (
                <div key={offer.id} className={styles.offerCard}>
                    <h3>{offer.title}</h3>
                    <p>
                    <strong>Delivery:</strong> {new Date(offer.delivery_date).toLocaleString()}
                    </p>
               
                    <p>
                    <strong>Total Price:</strong> ${offer.total_price}
                    </p>
                    {offer.note && (
                    <p>
                        <strong>Note:</strong> {offer.note}
      
                    </p>
                    )}
                    <p>
                    <strong>Status:</strong> {offer.status}
                    </p>
                    {offer.status === "rejected" && offer.note 
                    && (
                    <p className={styles.rejection}>
                        <strong>Reason for Rejection:</strong>{" "}
                        {offer.note}
                    </p>
                    )}
   
                    <h4>Items:</h4>
                    <table className={styles.itemsTable}>
                    <thead>
                        <tr>
                        <th>Name</th>
          
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        </tr>
                    </thead>
     
                    <tbody>
                        {offer.items.map((item, i) => (
                        <tr key={i}>
                            <td>{item.name}</td>
                 
                            <td>{item.quantity}</td>
                            <td>{item.unit}</td>
                            <td>${item.unit_price}</td>
                        </tr>
                        ))}
   
                    </tbody>
                    </table>
                </div>
                ))
            ) : (
                <p className={styles.emptyText}>No offers to display.</p>
            )}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierHome;