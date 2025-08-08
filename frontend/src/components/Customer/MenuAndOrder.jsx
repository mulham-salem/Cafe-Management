import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/MenuAndOrder.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; 

const MenuAndOrder = () => {
  
  useEffect(() => {
    document.title = "Cafe Delights - Menu & Orders";
  }, []);  

  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderItems, setOrderItems] = useState([]);
  const [note, setNote] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:8000/api'; 
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.put['Content-Type'] = 'application/json';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('/user/customer/menuitem'); 
        if (response.data.data) {
          setMenu(response.data.data.map(item => ({
            ...item,
            id: item.id, 
            imageUrl: item.image, 
            category: item.category,
            available: item.available 
          })));
          setFilteredMenu(response.data.data.map(item => ({
            ...item,
            id: item.id,
            imageUrl: item.image,
            category: item.category,
            available: item.available
          })));
        } else {
          toast.info(response.data.message);
          setMenu([]);
          setFilteredMenu([]);
        }
      } catch (error) {
        toast.error('Failed to load menu items.');
        console.error('Error fetching menu items:', error);
        setMenu([]);
        setFilteredMenu([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filterMenu = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredMenu(menu);
    } else {
      const filtered = menu.filter(item => {
        return item.category === category.toLowerCase();
      });
      setFilteredMenu(filtered);
    }
  };

  const addToOrder = (item) => {
    if (!item.available) {
      toast.error(`${item.name} is not available!`);
      return;
    }

    setOrderItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(orderItem => orderItem.id === item.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems]; 
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex], 
          quantity: updatedItems[existingItemIndex].quantity + 1 ,
          price: (updatedItems[existingItemIndex].quantity + 1) * updatedItems[existingItemIndex].unitPrice 
        };
        return updatedItems; 
      } else {
        return [...prevItems, { ...item, quantity: 1, unitPrice: item.price, price: item.price }];
      }
    });

    const cartIcon = document.querySelector(`.${styles.cartIcon}`);
    const target = cartIcon.getBoundingClientRect();
    const source = document.getElementById(`menu-item-${item.id}`).getBoundingClientRect();

    const flying = document.createElement('div');
    flying.className = styles.flyingImage;
    flying.style.backgroundImage = `url(/${item.imageUrl})`;
    flying.style.left = `${source.left}px`;
    flying.style.top = `${source.top}px`;
    document.body.appendChild(flying);

    setTimeout(() => {
      flying.style.left = `${target.left}px`;
      flying.style.top = `${target.top}px`;
      flying.style.transform = 'scale(0.2)';
      flying.style.opacity = '0.1';
    }, 100);

    setTimeout(() => {
      flying.remove();
    }, 800);

    toast.success(`${item.name} added to order`);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to create an order.');
      return;
    }

    const itemsForBackend = orderItems.map(item => ({
      menuItem_id: item.id, 
      quantity: item.quantity,
    }));

    try {
      let toastMessage;
      if (editMode && orderToEdit) {
        const response = await axios.put(`/user/customer/orders/${orderToEdit.id}/edit`, { 
        items: itemsForBackend, 
        note: note.trim(),
      });
      toastMessage = response.data.message; 
      } else {
        const response = await axios.post('/user/customer/orders/create', { 
          items: itemsForBackend,
          note: note.trim(),
        });
        toastMessage = response.data.message;
      }
      
      toast.success(toastMessage); 
      setOrderItems([]);
      setNote('');
      setShowOverlay(false);

    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message); 
      }
      else {
        toast.error('Failed to create order.');
      }
      console.error('Error creating order:', error);
    }
  };

  const location = useLocation();
  const editMode = location.state?.editMode || false;
  const orderToEdit = location.state?.orderToEdit || null;

  useEffect(() => {
    if (editMode && orderToEdit) {
      const fetchOrderForEdit = async () => {
        try {
          const response = await axios.get(`/user/customer/orders/${orderToEdit.id}/edit`);
          const fetchedOrder = response.data;
          
          const formattedItems = fetchedOrder.items.map(item => ({
            id: item.menuItem_id, 
            name: item.name,
            price: item.price,
            unitPrice: item.price / item.quantity,
            quantity: item.quantity,
            imageUrl: item.image, 
            available: true, 
          }));

          setOrderItems(formattedItems || []);
          setNote(fetchedOrder.note || '');
          setShowOverlay(true);
        } catch (error) {
          toast.error('Failed to load order for editing.');
          console.error('Error fetching order for edit:', error);
        }
      };
      fetchOrderForEdit();
    }
  }, [editMode, orderToEdit]);
  
  const increaseQty = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemToUpdate = updatedItems[index];

      updatedItems[index] = {
        ...itemToUpdate,
        quantity: itemToUpdate.quantity + 1,
        price: (itemToUpdate.quantity + 1) * itemToUpdate.unitPrice, 
      };
      return updatedItems;
    });
  };
  
  const decreaseQty = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemToUpdate = updatedItems[index];

      if (itemToUpdate.quantity > 1) {
        updatedItems[index] = {
          ...itemToUpdate,
          quantity: itemToUpdate.quantity - 1,
          price: (itemToUpdate.quantity - 1) * itemToUpdate.unitPrice, 
        };
      } else {
        updatedItems.splice(index, 1); 
      }
      return updatedItems;
    });
  };
  
  return (
    <div className={styles.menuOrdersPage}>
      <ToastContainer />
      <div className={styles.menuHero}>
        <div className={styles.overlay}>
          <h1 className={styles.menuTitle}>DISCOVER OUR MENU</h1>
          <p className={styles.menuSubtitle}>Explore the finest drinks & snacks made just for you.</p>
        </div>
      </div>
      
      {filteredMenu.length > 0 && (
        <div className={styles.menuTabs}>
          <button onClick={() => filterMenu('All')} className={selectedCategory === 'All' ? styles.active : ''}>All</button>
          <button onClick={() => filterMenu('Drinks')} className={selectedCategory === 'Drinks' ? styles.active : ''}>Drinks</button>
          <button onClick={() => filterMenu('Snacks')} className={selectedCategory === 'Snacks' ? styles.active : ''}>Snacks</button>

          <div className={styles.cartButtonWrapper}>
            <div className={styles.cartIcon} onClick={() => setShowOverlay(true)}>
              🛒 {orderItems.length}
            </div>
          </div>

      </div>
      )}

      <div className={styles.menuContent}>
      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : filteredMenu.length === 0 ? (
          <div className={styles.emptyMenu}>No menu items available right now.</div>
        ) : (
          <div className={styles.menuGrid}>
            {filteredMenu.map(item => (
              <div className={styles.menuCard} key={item.id} id={`menu-item-${item.id}`}>
                <img src={`/${item.imageUrl}`} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span>${parseFloat(item.price).toFixed(2)}</span>
                  {!item.available && <span className={styles.notAvailable}>❌</span>}
                </div>
                <button onClick={() => addToOrder(item)} disabled={!item.available}>
                  <FontAwesomeIcon icon={faCartPlus}/> Add to Order 
                </button>
              </div>
            ))}
          </div>
        )}
      </div>



      {showOverlay && (
        <div className={styles.overlayForm}>
          <div className={styles.formContainer}>
            <h2>Your Order</h2>
            {orderItems.map((item, index) => (
              <div key={index} className={styles.orderItemPreview}>
                <span>{item.name}</span> × <strong>{item.quantity} (${(parseFloat(item.price)).toFixed(2)}</strong>) 

                {editMode && (
                  <div className={styles.editQty}>
                    <button onClick={() =>  decreaseQty(index) }><FontAwesomeIcon icon={faMinus}/></button>
                    <button onClick={() =>  increaseQty(index) }><FontAwesomeIcon icon={faPlus}/></button>
                  </div>
                )}
              </div>
            ))}
            <textarea
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className={styles.formActions}>
              <button onClick={handleCreateOrder}> {editMode ? 'Update Order' : 'Confirm Order'} </button>
              <button className={styles.cancelBtn}  onClick={() => setShowOverlay(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAndOrder;