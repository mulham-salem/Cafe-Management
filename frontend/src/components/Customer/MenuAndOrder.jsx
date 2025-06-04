import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/MenuAndOrder.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
    const storedMenu = JSON.parse(localStorage.getItem('menuItems')) || [];
    setMenu(storedMenu);
    setFilteredMenu(storedMenu);
  }, []);

  const filterMenu = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredMenu(menu);
    } else {
      const filtered = menu.filter(item => item.category === category);
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
          quantity: updatedItems[existingItemIndex].quantity + 1 
        };
        return updatedItems; 
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });

    const cartIcon = document.querySelector(`.${styles.cartIcon}`);
    const target = cartIcon.getBoundingClientRect();
    const source = document.getElementById(`menu-item-${item.id}`).getBoundingClientRect();

    const flying = document.createElement('div');
    flying.className = styles.flyingImage;
    flying.style.backgroundImage = `url(${item.imageUrl})`;
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

  const handleCreateOrder = () => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to create an order.');
      return;
    }

    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    if (existingOrders.length === 0) {
      localStorage.setItem('lastOrderId', '0'); 
    } 
    let updatedOrders;
    let toastMessage; 

    if (editMode && orderToEdit) {
      updatedOrders = existingOrders.map(order =>
        order.id === orderToEdit.id
          ? { ...order, items: orderItems, note: note.trim(), status: 'pending', createdAt: new Date().toISOString() } 
          : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      toastMessage = `Order #${orderToEdit.id} updated successfully!`; 
    } else {
        let lastOrderId = parseInt(localStorage.getItem('lastOrderId')) || 0;
        const newId = lastOrderId + 1;
        localStorage.setItem('lastOrderId', newId);

        const newOrder = {
          id: newId,
          items: orderItems,
          note: note.trim(),
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        updatedOrders = [...existingOrders, newOrder];
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        toastMessage = `Order #${newId} created successfully!`;
    }

    toast.success(toastMessage); 

    setOrderItems([]);
    setNote('');
    setShowOverlay(false);
  };

  const location = useLocation();
  const editMode = location.state?.editMode || false;
  const orderToEdit = location.state?.orderToEdit || null;

  useEffect(() => {
    if (editMode && orderToEdit) {
      setOrderItems(orderToEdit.items || []);
      setNote(orderToEdit.note || '');
      setShowOverlay(true);
    }
  }, [editMode, orderToEdit]);
  
  const increaseQty = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: updatedItems[index].quantity + 1,
      };
      return updatedItems;
    });
  };
  
  const decreaseQty = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      if (updatedItems[index].quantity > 1) {
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: updatedItems[index].quantity - 1,
        };
      } else {
        updatedItems.splice(index, 1); // احذف العنصر إذا وصل 0
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

      <div className={styles.menuTabs}>
        <button onClick={() => filterMenu('All')} className={selectedCategory === 'All' ? styles.active : ''}>All</button>
        <button onClick={() => filterMenu('Drinks')} className={selectedCategory === 'Drinks' ? styles.active : ''}>Drinks</button>
        <button onClick={() => filterMenu('Snacks')} className={selectedCategory === 'Snacks' ? styles.active : ''}>Snacks</button>
      </div>

      <div className={styles.menuContent}>
        {filteredMenu.length === 0 ? (
          <div className={styles.emptyMenu}>No menu items available right now.</div>
        ) : (
          <div className={styles.menuGrid}>
            {filteredMenu.map(item => (
              <div className={styles.menuCard} key={item.id} id={`menu-item-${item.id}`}>
                <img src={item.imageUrl} alt={item.name} />
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

      <div className={styles.cartButtonWrapper}>
        <div className={styles.cartIcon} onClick={() => setShowOverlay(true)}>
          🛒 {orderItems.length}
        </div>
      </div>

      {showOverlay && (
        <div className={styles.overlayForm}>
          <div className={styles.formContainer}>
            <h2>Your Order</h2>
            {orderItems.map((item, index) => (
              <div key={index} className={styles.orderItemPreview}>
                <span>{item.name}</span> × <strong>{item.quantity} (${(parseFloat(item.price) * item.quantity).toFixed(2)}</strong>)

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