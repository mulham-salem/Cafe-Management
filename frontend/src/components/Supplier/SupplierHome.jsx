import React, { useState, useEffect } from "react";
import styles from "../styles/SupplierHome.module.css";
import logo from '/logo_1.png';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBell, faSignOutAlt,  faKey } from "@fortawesome/free-solid-svg-icons";
import { toast as toastify, ToastContainer } from 'react-toastify';
import { toast, Toaster } from 'react-hot-toast';
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios';

const SupplierHome = () => {

  useEffect(() => {
      document.title = "Cafe Delights - Supplier Home";
      profile();
  }, []);  

  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('supplier_activeTab') || 'send';
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('supplier_activeTab', tab);
  };

  const [title, setTitle] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([
    { id: uuidv4(), name: "", quantity: "", unit: "", unitPrice: "" },
  ]);

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), name: "", quantity: "", unit: "", unitPrice: "" }]);
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !deliveryDate.trim()) {
      toastify.error("Please fill in all required fields.");
      return;
    }

    for (let item of items) {
      if (!item.name.trim() || !item.quantity || !item.unitPrice) {
        toastify.error("Please complete all item fields.");
        return;
      }
    }

    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

    try {
      const response = await axios.post('http://localhost:8000/api/user/supplier/offers', {
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

      toastify.success("Supply offer submitted successfully.");
      setTitle("");
      setDeliveryDate("");
      setNote("");
      setItems([{ id: uuidv4(), name: "", quantity: "", unit: "", unitPrice: "" }]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit offer. Please try again.";
      toastify.error(errorMessage);
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
      const response = await axios.get('http://localhost:8000/api/user/supplier/view-offers', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setMyOffers(response.data.offers);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch offers.";
      toastify.error(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setTimeout(() => {
      toast.custom((t) => (
        <div className={`${styles.toastCard} ${t.visible ? styles.enter : styles.leave}`}>
          <div className={styles.textContainer}>
            <p className={styles.messageTitle}>☕️ {location.state.successMessage}</p>
            <p className={styles.message}>Glad to see you again at Coffee House!</p>
          </div>
        </div>
      ), {duration: 4000, position:"top-right"});
        window.history.replaceState({}, document.title);
      }, 1500);
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
        toastify.error(errorMessage);
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
      toastify.error("Failed to fetch user name");
    }
  };

  useEffect(() => {
    const checkNewNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  
        const response = await axios.get("http://localhost:8000/api/user/supplier/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const allNotifications = response.data.notifications;
  
        const unseenSupplyOfferResponses = allNotifications.filter(n =>
          n.seen === 0 && n.purpose === 'Supply Offer Response'
        );
  
        const unseenSupplyRequests = allNotifications.filter(n =>
          n.seen === 0 && n.purpose === 'Supply Request'
        );
  
        if (unseenSupplyOfferResponses.length > 0) {

          toastify.info(`You received ${unseenSupplyOfferResponses.length} response${unseenSupplyOfferResponses.length > 1 ? 's' : ''} for your supply offer.`);
  
          const ids = unseenSupplyOfferResponses.map(n => n.id);
          await Promise.all(
            ids.map(id =>
              axios.patch(`http://localhost:8000/api/user/supplier/notifications/${id}/seen`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
          );
        }
  
        if (unseenSupplyRequests.length > 0) {

          toastify.info(`You received ${unseenSupplyRequests.length} new supply request${unseenSupplyRequests.length > 1 ? 's' : ''}.`);
  
          const ids = unseenSupplyRequests.map(n => n.id);
          await Promise.all(
            ids.map(id =>
              axios.patch(`http://localhost:8000/api/user/supplier/notifications/${id}/seen`, {}, {
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

  const isFullWidthPage = location.pathname === '/login/supplier-home/supplier-notification';

  return (
    <div className={styles.container}>
      <ToastContainer />
      <Toaster/>
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

      <main className={isFullWidthPage ? styles.fullWidthPageWrapper :  styles.mainContent}>
      {currentPath === "/login/supplier-home" && activeTab === "send" && (
        
        <form className={styles.offerForm} onSubmit={handleSubmit}>
          <input type="text" placeholder="Offer Title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input type="date" value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
          <textarea placeholder="Additional Notes (Optional)" value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <h4>Items</h4>
          {items.map((item) => (
         
            <div key={item.id} className={styles.itemRow}>
              <input type="text" placeholder="Item Name" value={item.name}
                onChange={(e) =>
                  handleItemChange(item.id, "name", e.target.value)
                }
              
              />
              <input type="number" placeholder="Quantity" value={item.quantity}
                onChange={(e) =>
                  handleItemChange(item.id, "quantity", e.target.value)
                }
              />
    
              <input type="text" placeholder="Unit" value={item.unit}
                onChange={(e) =>
                  handleItemChange(item.id, "unit", e.target.value)
                }
              />
          
              <input type="number" placeholder="Unit Price" value={item.unitPrice}
                onChange={(e) =>
                  handleItemChange(item.id, "unitPrice", e.target.value)
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
            {loading ? (
              <div className={styles.loadingOverlay}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : myOffers.length > 0 ? (
                myOffers.map((offer) => (
                <div key={offer.id} className={styles.offerCard}>
                    <h3>{offer.title}</h3>
                    <p>
                    <strong>Delivery:</strong> {new Date(offer.delivery_date).toLocaleDateString()}
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
                    {offer.status === "rejected" && offer.rejection_reason
                    && (
                    <p className={styles.rejection}>
                        <strong>Reason for Rejection:</strong>{" "}
                        {offer.rejection_reason}
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