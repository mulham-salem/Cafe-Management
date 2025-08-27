import React, { useState, useEffect, useContext, useMemo } from 'react';
import styles from '../styles/PromotionManagement.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faPercentage, faCalendarAlt, faTags, faTimes, faGift } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/toastStyles.css';
import axios from 'axios'; 
import { SearchContext } from "./ManagerDashboard";
import { EmpSearchContext } from "../Employee/EmployeeHome";
import { usePermissions } from "../../context/PermissionsContext";

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
  const [loading, setLoading] = useState(true);
  const { permissions, role } = usePermissions();

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

  const mockPromotions = [
    {
      id: 1,
      title: "Early Bird Special",
      discount_percentage: 20,
      start_date: "2023-11-01",
      end_date: "2023-11-30",
      description: "All coffee orders before 8AM",
      products: "Espresso, Americano, Latte, Cappuccino"
    },
    {
      id: 2,
      title: "Happy Hour",
      discount_percentage: 10,
      start_date: "2023-11-01",
      end_date: "2023-12-31",
      description: "3PM-5PM daily on selected drinks",
      products: "Iced Coffee, Cold Brew, Lemonade"
    },
    {
      id: 3,
      title: "Weekend Brunch",
      discount_percentage: 20,
      start_date: "2023-11-04",
      end_date: "2023-11-05",
      description: "With any large coffee purchase",
      products: "Croissant, Muffin, Danish"
    },
    {
      id: 4,
      title: "Student Discount",
      discount_percentage: 15,
      start_date: "2023-09-01",
      end_date: "2024-06-30",
      description: "Valid with student ID",
      products: "All drinks, All food items"
    },
    {
      id: 5,
      title: "Loyalty Reward",
      discount_percentage: 40,
      start_date: "2023-01-01",
      end_date: "2023-12-31",
      description: "After 10 stamps on loyalty card",
      products: "Any regular sized drink"
    },
    {
      id: 6,
      title: "Pumpkin Spice Season",
      discount_percentage: 10,
      start_date: "2023-10-01",
      end_date: "2023-11-15",
      description: "Special autumn flavors",
      products: "Pumpkin Spice Latte, Pumpkin Muffin"
    },
    {
      id: 7,
      title: "Takeaway Tuesday",
      discount_percentage: 95,
      start_date: "2023-11-07",
      end_date: "2023-11-07",
      description: "All takeaway orders",
      products: "Coffee, Sandwiches, Salads"
    },
    {
      id: 8,
      title: "New Product Launch",
      discount_percentage: 80,
      start_date: "2023-11-15",
      end_date: "2023-11-17",
      description: "Try our new winter special",
      products: "Peppermint Mocha, Gingerbread Cookie"
    },
    {
      id: 9,
      title: "Black Friday",
      discount_percentage: 50,
      start_date: "2023-11-24",
      end_date: "2023-11-24",
      description: "From opening until 10AM only",
      products: "All drinks, All bakery items"
    },
    {
      id: 10,
      title: "Christmas Countdown",
      discount_percentage: 30,
      start_date: "2023-12-01",
      end_date: "2023-12-24",
      description: "Different offer each day until Christmas",
      products: "Seasonal drinks, Holiday treats"
    }
  ];

  const fetchPromotions = async () => {
    try {
      // const response = await axiosInstance.get('/manager/promotion');
      
      // const formattedPromotions = response.data.map(promo => ({
      //   ...promo,
      //   products: Array.isArray(promo.products) ? promo.products.join(', ') : '', 
      // }));
      // setPromotions(formattedPromotions);
      setPromotions(mockPromotions);
    } catch (error) {
        toast.error('Failed to load promotions.');
    } finally {
      setLoading(false);
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

  const managerContext = useContext(SearchContext);
  const empContext = useContext(EmpSearchContext);
  const context = role === "manager" ? managerContext : empContext;
  const { searchQuery, setSearchPlaceholder } = context;
  
  const filteredPromotions = useMemo(() => {
    return promotions.filter(promo => 
      searchQuery === "" ||
      promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.products.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [promotions, searchQuery]);

  useEffect(() => {
    setSearchPlaceholder("Search by title or product...");
  }, [setSearchPlaceholder]);

  return (
    <div className="promoWrapper">
      <ToastContainer />
      <div className="pageHeader">
        <h2 className={styles.pageTitle}><FontAwesomeIcon icon={faGift}/> Promotion List</h2>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Promotion
        </button>
      </div>
      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : (
      <div className="cardGrid">
      {filteredPromotions.length === 0 ? (
        <p className={styles.noResults}>
          {searchQuery 
            ? `No promotions found matching "${searchQuery}"`
            : "No promotions available"}
        </p>
      ) : (
        filteredPromotions.map((promo) => (
          <div key={promo.id} className={styles.card}>
            <h4 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faTags} /> {promo.title}
            </h4>
            <p><FontAwesomeIcon icon={faPercentage} /> {promo.discount_percentage}%</p> 
            <p><FontAwesomeIcon icon={faCalendarAlt} /> {promo.start_date} ➜ {promo.end_date}</p> 

            <p><strong>Products:</strong> {promo.products}</p> 
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
        )))}
      </div>
      )}
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