import React, { useState, useRef, useEffect } from 'react';
import styles from "../styles/MenuManagement.module.css";
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MenuManagement = () => {

  useEffect(() => {
    document.title = "Cafe Delights - Menu Management";
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
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
    id: Date.now(),
    name: '',
    description: '',
    price: '',
    category: 'Drinks',
    imageUrl: '',
    available: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddOrEditItem = () => {
    const { name, description, price, imageUrl, category } = newItem;

    if (!name || !description || !price || !imageUrl || !category) {
      toast.error('Please fill out all fields');
      return;
    }

    if (editingId !== null) {
      const updatedItems = menuItems.map((item) => item.id == editingId ? { ...newItem, id:editingId } : item)
      setMenuItems(updatedItems);
      toast.success('Item updated successfully');
    } else {
      setMenuItems([...menuItems, { ...newItem, id:Date.now() }]);
      toast.success('Item added successfully');
    }

    setNewItem({
      id:Date.now(),
      name: '',
      description: '',
      price: '',
      category: 'Drinks',
      imageUrl: '',
      available: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (id) => {
    const itemToEdit = menuItems.find((item) => item.id === id);
    setNewItem(itemToEdit);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>Are you sure you want to delete this item?</p>
          <div className="toast-buttons"> 
            <button 
                onClick={() => {
                const updated = menuItems.filter((item) => item.id !== id);
                setMenuItems(updated);
                toast.success('Item deleted successfully');
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

  const renderSection = (title, category) => (
    <>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <hr className={styles.sectionDivider} />
      <div className={styles.menuGrid}>
        {menuItems
          .filter((item) => item.category === category)
          .map((item) => (
            <div className={styles.card} key={item.id}>
              <img src={item.imageUrl} alt={item.name} className={styles.cardImage} />
              <div className={styles.cardContent}>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p><strong>Price:</strong> ${item.price}</p>
                <p><strong>Category:</strong> {item.category}</p>
                <p><strong>Available:</strong> {item.available ? 'Yes' : 'No'}</p>
              </div>
              <div className={styles.cardActions}>
                <FontAwesomeIcon icon={faPen} onClick={() => handleEdit(item.id)} data-action="Edit" title="Edit" />
                <FontAwesomeIcon icon={faTrash} onClick={() => handleDelete(item.id)} data-action="Delete" title="Delete" />
              </div>
            </div>
          ))}
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      <ToastContainer />
      <button onClick={() => setShowForm(true)} className={styles.addButton}>
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
            />
            <select name="category" value={newItem.category} onChange={handleInputChange}>
                <option value="Drinks">Drinks</option>
                <option value="Snacks">Snacks</option>
            </select>
            <input
                type="text"
                name="imageUrl"
                placeholder="Image URL"
                value={newItem.imageUrl}
                onChange={handleInputChange}
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
      {renderSection('Drinks', 'Drinks')}
      {renderSection('Snacks', 'Snacks')}
    </div>
  );
};

export default MenuManagement;











