import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/MenuAndOrderEmp.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // Import axios

const MenuAndOrderEmp = () => {
 
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

    // Get the token from sessionStorage or localStorage
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  // Configure Axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:8000/api'; // Adjust your API base URL if different
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.put['Content-Type'] = 'application/json';

  // Fetch menu items from the backend
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('/user/employee/menuitem'); // Adjust API endpoint if necessary
        if (response.data.data) {
          setMenu(response.data.data.map(item => ({
            ...item,
            id: item.id, // Using name as a temporary ID, you should use a unique ID from your backend if available
            imageUrl: item.image, // Map 'image' from backend to 'imageUrl' for consistency
            category: item.category,
            available: item.available // Assuming items fetched are available. Adjust if your backend sends availability.
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
        // Assuming your backend category names are 'drinks' and 'snacks'
        // You might need to adjust this if your backend uses different category identifiers (e.g., category_id)
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
          // * إعادة حساب السعر الإجمالي بناءً على سعر الوحدة الجديد *
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

    // Map orderItems to the structure expected by your Laravel backend
    const itemsForBackend = orderItems.map(item => ({
      menuItem_id: item.id, // Assuming 'id' from your frontend state maps to 'menu_item_id' in backend
      quantity: item.quantity,
      note: item.note,
    }));

    try {
      let toastMessage;
      if (editMode && orderToEdit) {
     // * الجزء الذي يجب تعديله لإرسال طلب التعديل (PUT) *
        const response = await axios.put(`/user/employee/orders/${orderToEdit.id}/edit`, { 
      // هام: تأكد أن 'orderToEdit.id' هو الـ ID الصحيح للطلب
      // يجب أن يتم تمريره من الصفحة السابقة
        items: itemsForBackend, // تم بناء هذا Array في بداية الدالة
        note: note.trim(),
      });
      toastMessage = response.data.message; 
      } else {
        const response = await axios.post('/user/employee/orders/create', { // Adjust API endpoint if necessary
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
        toast.error(error.response.data.message); // For validation errors
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
      // * الجزء الذي يجب تعديله لجلب بيانات الطلب للتعديل (GET) *
      const fetchOrderForEdit = async () => {
        try {
          const response = await axios.get(`/user/employee/orders/${orderToEdit.id}/edit`);
          // هام: تأكد أن 'orderToEdit.id' هو الـ ID الصحيح للطلب
          const fetchedOrder = response.data;
          
          // تحويل البيانات المسترجعة من الباك إند لتناسب هيكل orderItems في الواجهة الأمامية
          const formattedItems = fetchedOrder.items.map(item => ({
            id: item.menuItem_id, // هذا يجب أن يتطابق مع 'id' في كائن الـ MenuItem الذي أرجعته دالة fetchMenuItems
            name: item.name,
            price: item.price,
            unitPrice: item.price / item.quantity,
            quantity: item.quantity,
            // إذا كنت بحاجة لـ imageUrl أو description للعرض في الـ OverlayForm، ستحتاج لجلبها من الباك إند
            // حالياً، دالة editOrder في الباك إند لا ترجع هذه البيانات مباشرة.
            // قد تحتاج لتعديل الباك إند (في الـ GET) لإرجاعها، أو جلبها من الـ 'menu' state لديك.
            imageUrl: item.image, // مؤقتًا فارغ، يمكنك جلبها من الـ 'menu' state إذا كانت متوفرة
            available: true, // افتراضياً متوفر عند التعديل، عدّل حسب منطق الباك إند
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
        // * حساب السعر الإجمالي الجديد بناءً على سعر الوحدة *
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
          // * حساب السعر الإجمالي الجديد بناءً على سعر الوحدة *
          price: (itemToUpdate.quantity - 1) * itemToUpdate.unitPrice, 
        };
      } else {
        // إذا وصلت الكمية إلى 0، احذف العنصر
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

      <div className={styles.menuTabs}>
        <button onClick={() => filterMenu('All')} className={selectedCategory === 'All' ? styles.active : ''}>All</button>
        <button onClick={() => filterMenu('Drinks')} className={selectedCategory === 'Drinks' ? styles.active : ''}>Drinks</button>
        <button onClick={() => filterMenu('Snacks')} className={selectedCategory === 'Snacks' ? styles.active : ''}>Snacks</button>
      </div>

      <div className={styles.menuContent}>
      {loading ? (
        <p className={styles.emptyText}>Loading...</p>
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

export default MenuAndOrderEmp;