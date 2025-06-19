import React, { useState, useRef, useEffect } from 'react';
import styles from "../styles/MenuManagement.module.css";
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios'; 

const MenuManagement = () => {

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
    document.title = "Cafe Delights - Menu Management";
    fetchMenuItems(); 
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        clearForm();
        setShowForm(false);
      }
    };
    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForm]);

  const [menuItems, setMenuItems] = useState([]);

 
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'drinks', 
    image_url: '', 
    available: true,
  });

  const fetchMenuItems = async () => {
    try {
      const response = await axiosInstance.get('/manager/menuitem');
      const formattedItems = response.data.map(item => ({
        ...item,
        category: item.category_name ? item.category_name.toLowerCase() : '',
        image_url: item.image_url || '', 
      }));
      setMenuItems(formattedItems);
    } catch (error) {
      toast.error('Failed to load menu items. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddOrEditItem = async () => {
    const { name, description, price, image_url, category } = newItem;

    if (!name || !description || !price || !image_url || !category) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      const itemData = {
        name,
        description,
        price: parseFloat(price), 
        category, 
        image_url, 
        available: newItem.available,
      };

      if (editingId !== null) {
        const response = await axiosInstance.put(`/manager/menuitem/${editingId}`, itemData);
        toast.success(response.data.message || 'Item updated successfully');
      } else {
        const response = await axiosInstance.post('/manager/menuitem', itemData);
        toast.success(response.data.message || 'Item added successfully');
      }
      fetchMenuItems(); 
      clearForm(); 
      setShowForm(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach(([msg]) => toast.error(msg));
      } else {
        toast.error(error.response?.data?.message || 'Failed to save menu item. Check server logs.');
      }
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = menuItems.find((item) => item.id === id);
    if (itemToEdit) {
      setNewItem({
        name: itemToEdit.name,
        description: itemToEdit.description,
        price: itemToEdit.price,
        category: itemToEdit.category_name ? itemToEdit.category_name.toLowerCase() : '',
        image_url: itemToEdit.image_url,
        available: itemToEdit.available,
      });
      setEditingId(id); 
      setShowForm(true);
    } else {
      toast.error("Item not found for editing.");
    }
  };

  const handleDelete = async (id) => {
    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>Are you sure you want to delete this item?</p>
          <div className="toast-buttons">
            <button
              onClick={async () => {
                try {
                  const response = await axiosInstance.delete(`/manager/menuitem/${id}`); 
                  toast.success(response.data.message || 'Item deleted successfully');
                  fetchMenuItems(); 
                } catch (error) {
                  console.error('Error deleting menu item:', error);
                  if (error.response && error.response.status === 403) {
                    toast.error(error.response.data.message || 'Failed to delete item due to active orders.');
                  } else {
                    toast.error(error.response?.data?.message || 'Failed to delete item.');
                  }
                }
                closeToast(); 
              }}
            >
              Yes
            </button>
            <button onClick={closeToast} >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-item-${id}`,
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


  const clearForm = () => {
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'drinks',
      image_url: '',
      available: true,
    });
    setEditingId(null); 
  };

  const renderSection = (title, category) => (
    <>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <hr className={styles.sectionDivider} />
      <div className={styles.menuGrid}>
        {loading ? (
          <p className={styles.emptyText}>Loading...</p>
        ) :
        menuItems.filter((item) => item.category === category).length === 0 ? (
          <p className={styles.noItemsMessage}>No menu items available in this category.</p>
        ) : (
          menuItems
            .filter((item) => item.category === category)
            .map((item) => (
              <div className={styles.card} key={item.id}> 
                <img src={`/${item.image_url}`} alt={item.name} className={styles.cardImage} />
                <div className={styles.cardContent}>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <p><strong>Price:</strong> ${item.price}</p>
                  <p><strong>Category:</strong> {item.category_name}</p> 
                  <p><strong>Available:</strong> {item.available ? 'Yes' : 'No'}</p>
                </div>
                <div className={styles.cardActions}>
                  <FontAwesomeIcon icon={faPen} onClick={() => handleEdit(item.id)} data-action="Edit" title="Edit" />
                  <FontAwesomeIcon icon={faTrash} onClick={() => handleDelete(item.id)} data-action="Delete" title="Delete" />
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      <ToastContainer />
      <button onClick={() => { clearForm(); setShowForm(true); }} className={styles.addButton}>
        <FontAwesomeIcon icon={faPlus} /> Add New Item
      </button>
      {showForm && (
        <div className={`${styles.formOverlay} ${styles.modalOverlay}`}>
          <div className={`${styles.form} ${styles.modal}`} ref={formRef}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newItem.name}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newItem.description}
              onChange={handleInputChange}
            ></textarea>
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={newItem.price}
              onChange={handleInputChange}
              required
            />
            <select name="category" value={newItem.category} onChange={handleInputChange} required>
              <option value="drinks">Drinks</option>
              <option value="snacks">Snacks</option>
            </select>
            <input
              type="text"
              name="image_url" 
              placeholder="Image Path (e.g., Drinks/coffee.jpg)"
              value={newItem.image_url}
              onChange={handleInputChange}
              required
            />
            <label>
              <input
                type="checkbox"
                name="available"
                checked={newItem.available}
                onChange={handleInputChange}
              />
              Available
            </label>
            <button onClick={handleAddOrEditItem} className={styles.saveButton}>
              {editingId !== null ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      )}
      {renderSection('Drinks', 'drinks')}
      {renderSection('Snacks', 'snacks')}
    </div>
  );
};

export default MenuManagement;