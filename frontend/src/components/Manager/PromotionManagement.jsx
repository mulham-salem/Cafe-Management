import React, { useState, useEffect } from 'react';
import styles from '../styles/PromotionManagement.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faPercentage, faCalendarAlt, faTags, faTimes, faGift } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PromotionManagement = () => {

  const [promotions, setPromotions] = useState(() => {
    const saved = localStorage.getItem('promotions');
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editPromo, setEditPromo] = useState(null);

  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState(''); 

  useEffect(() => {
    localStorage.setItem('promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    document.title = "Cafe Delights - Promotion Management";
  }, []);

  const handleSave = (e) => {
    e.preventDefault();

    if (!title || !discount || !startDate || !endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }

    const promoData = {
      id: editPromo ? editPromo.id : Date.now(),
      title,
      discountPercentage: parseFloat(discount),
      startDate,
      endDate,
      description,
      products: products.split(',').map(p => p.trim()),
    };

    if (editPromo) {
      setPromotions(prev =>
        prev.map(p => (p.id === editPromo.id ? promoData : p))
      );
      toast.success('✅ Promotion updated');
    } else {
      setPromotions(prev => [...prev, promoData]);
      toast.success('✅ Promotion added');
    }

    clearForm();
  };

  const handleDelete = (id) => {
    const promo = promotions.find(p => p.id === id);
    if (!promo) return;
    setPromotions(prev => prev.filter(p => p.id !== id));
    toast.info(`🗑️ Promotion "${promo.title}" deleted`);
  };

  const startEdit = (promo) => {
    setEditPromo(promo);
    setTitle(promo.title);
    setDiscount(promo.discountPercentage);
    setStartDate(promo.startDate);
    setEndDate(promo.endDate);
    setDescription(promo.description);
    setProducts(promo.products.join(', '));
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
            <p><FontAwesomeIcon icon={faPercentage} /> {promo.discountPercentage}%</p>
            <p><FontAwesomeIcon icon={faCalendarAlt} /> {promo.startDate} ➜ {promo.endDate}</p>

            <p><strong>Products:</strong> {promo.products.join(', ')}</p>
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
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
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
