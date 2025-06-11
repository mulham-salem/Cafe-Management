import React, { useState, useEffect } from 'react';
import styles from '../styles/PromotionManagement.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faPercentage, faCalendarAlt, faTags, faTimes, faGift } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/toastStyles.css';
import axios from 'axios'; 

const PromotionManagement = () => {

  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPromo, setEditPromo] = useState(null);

  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState('');


  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api", 
    withCredentials: true, 
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });


  useEffect(() => {
    document.title = "Cafe Delights - Promotion Management";
    fetchPromotions();
  }, []);


  const fetchPromotions = async () => {
    try {
      const response = await axiosInstance.get('/manager/promotion');
      
      const formattedPromotions = response.data.map(promo => ({
        ...promo,
        products: Array.isArray(promo.products) ? promo.products.join(', ') : '', 
      }));
      setPromotions(formattedPromotions);
    } catch (error) {
      toast.error('Failed to load promotions.');
    }
  };

  const handleSave = async (e) => { 
    e.preventDefault();

    if (!title || !discount || !startDate || !endDate || !products) { 
      toast.error('Please fill in all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }

    const productNamesArray = products.split(',').map(p => p.trim()).filter(p => p !== ''); 

    const promoData = {
      title,
      discount_percentage: parseFloat(discount), 
      start_date: startDate, 
      end_date: endDate, 
      description,
      product_names: productNamesArray, 
    };

    try {
      if (editPromo) {
        const response = await axiosInstance.put(`/manager/promotion/${editPromo.id}`, promoData);
        toast.success(response.data.message || '✅ Promotion updated');
      } else {
        const response = await axiosInstance.post('/manager/promotion', promoData);
        toast.success(response.data.message || '✅ Promotion added');
      }
      fetchPromotions(); 
      clearForm();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach(([msg]) => toast.error(msg));
      } else {
        toast.error('Failed to save promotion.');
      }
    }
  };

  const handleDelete = async (id) => { 
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;

    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>Are you sure you want to delete <strong>{promo.title}</strong>?</p>
          <div className="toast-buttons">
            <button onClick={async () => {
              try {
                await axiosInstance.delete(`/manager/promotion/${id}`);
                toast.success(`🗑️ Promotion "${promo.title}" deleted`);
                fetchPromotions(); 
              } catch (error) {
                toast.error('Failed to delete promotion.');
              }
              closeToast();
            }}>Yes</button>
            <button onClick={closeToast}>Cancel</button>
          </div>
        </div>
      ),
      {
        toastId: `delete-promo-${id}`,
        position: "top-center",
        closeButton: false,
        autoClose: false,
        draggable: false,
        icon: false,
        className: "custom-toast-container",
        bodyClassName: "custom-toast-body",
      }
    );
  };

  const startEdit = (promo) => {
    setEditPromo(promo);
    setTitle(promo.title);
    setDiscount(promo.discount_percentage); 
    setStartDate(promo.start_date); 
    setEndDate(promo.end_date);     
    setDescription(promo.description);
    setProducts(promo.products); 
    setShowModal(true);
  };

  const clearForm = () => {
    setTitle('');
    setDiscount('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setProducts('');
    setEditPromo(null);
    setShowModal(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <ToastContainer />
      <h2 className={styles.pageTitle}><FontAwesomeIcon icon={faGift}/> Promotion List</h2>

      <button className={styles.addBtn} onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faPlus} /> Add Promotion
      </button>

      <div className={styles.cardGrid}>
        {promotions.map((promo) => (
          <div key={promo.id} className={styles.card}>
            <h4 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faTags} /> {promo.title}
            </h4>
            <p><FontAwesomeIcon icon={faPercentage} /> {promo.discount_percentage}%</p> {/* استخدام discount_percentage */}
            <p><FontAwesomeIcon icon={faCalendarAlt} /> {promo.start_date} ➜ {promo.end_date}</p> {/* استخدام start_date و end_date */}

            <p><strong>Products:</strong> {promo.products}</p> {/* المنتجات جاهزة كسلسلة نصية */}
            <p className={styles.desc}>{promo.description}</p>
            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => startEdit(promo)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(promo.id)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
          <div className={`${styles.modal} ${styles.slideUpModal}`}>
            <h4>{editPromo ? 'Edit Promotion' : 'Add New Promotion'}</h4>
            <form onSubmit={handleSave}>
              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input type="number" placeholder="Discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              <input type="text" placeholder="Products (comma separated)" value={products} onChange={(e) => setProducts(e.target.value)} />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>Save</button>
                <button type="button" className={styles.cancelBtn} onClick={clearForm}>
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;