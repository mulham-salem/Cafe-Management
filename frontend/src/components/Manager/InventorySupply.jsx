import React, { useState, useEffect } from 'react';
import styles from '../styles/InventorySupply.module.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faTruckLoading, faPlus, faEdit, faTrash, faBell, faFileInvoiceDollar, faPaperPlane, faTimes, faArrowRotateBack } from '@fortawesome/free-solid-svg-icons';


const InventorySupply = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Inventory & Supply";
  }, []);
  const [activeTab, setActiveTab] = useState(null); // null shows background
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Sugar',
      quantity: 10,
      unit: 'kg',
      expiryDate: '2025-06-01',
      thresholdLevel: 5,
    },
    {
      id: 2,
      name: 'Milk',
      quantity: 10,
      unit: 'L',
      expiryDate: '2025-05-30',
      thresholdLevel: 3,
    },
  ]);

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [threshold, setThreshold] = useState('');


  // Check low stock and notify
  useEffect(() => {
    inventory.forEach((item) => {
      if (item.quantity <= item.thresholdLevel) {
        toast.warning(
          `⚠️ Low Stock Alert: ${item.name} only ${item.quantity}${item.unit} left (threshold: ${item.thresholdLevel}${item.unit})`
        );
      }
    });
  }, [inventory]);

  const handleDelete = (id) => {
    const item = inventory.find((item) => item.id === id);
    toast.info(`🗑️ ${item.name} deleted`);
    setInventory(inventory.filter((i) => i.id !== id));
  };

  const [editItem, setEditItem] = useState(null);

  const handleAddItem = (e) => {
    e.preventDefault();
  
    if (!itemName || !quantity || !unit || !expiryDate || !threshold) {
      toast.error('Please fill in all fields');
      return;
    }
  
    if (quantity <= 0 || threshold < 0) {
      toast.error('Quantity must be > 0 and Threshold ≥ 0');
      return;
    }
  
    if (editItem) {
      // تعديل موجود
      const updated = inventory.map((item) =>
        item.id === editItem.id
          ? {
              ...item,
              name: itemName,
              quantity: parseFloat(quantity),
              unit,
              expiryDate,
              thresholdLevel: parseFloat(threshold),
            }
          : item
      );
      setInventory(updated);
      toast.success(`✏️ ${itemName} updated`);
    } else {
      // إضافة جديدة
      const newItem = {
        id: Date.now(),
        name: itemName,
        quantity: parseFloat(quantity),
        unit,
        expiryDate,
        thresholdLevel: parseFloat(threshold),
      };
      setInventory([...inventory, newItem]);
      toast.success(`✅ ${itemName} added`);
    }
  
    // Reset everything
    setShowAddItemModal(false);
    setItemName('');
    setQuantity('');
    setUnit('');
    setExpiryDate('');
    setThreshold('');
    setEditItem(null);
  };
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Supplier A' },
    { id: 2, name: 'Supplier B' },
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [note, setNote] = useState('');
  const [requestItems, setRequestItems] = useState([]);

  useEffect(() => {
    if (showRequestModal) {
      const initial = inventory.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: 0,
      }));
      setRequestItems(initial);
    }
  }, [showRequestModal]);

  const handleSubmitSupplyRequest = (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
  
    const validItems = requestItems.filter((i) => i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please enter quantity for at least one item");
      return;
    }
  
    toast.success("📦 Supply request sent!");
    setShowRequestModal(false);
    setSelectedSupplier('');
    setNote('');
  };
  
  const handleQuantityChange = (e, idx) => {
    const qty = parseInt(e.target.value) || 0;
    setRequestItems((prev) => {
      const updated = [...prev];
      updated[idx].quantity = qty;
      return updated;
    });
  };
  
  return (
    <div className={styles.pageWrapper}>
      <ToastContainer />
      {activeTab === null && (
        <div className={styles.backgroundFull}>
            <div className={styles.backgroundContent}>
                <h2>Welcome to Inventory & Supply</h2>
                <p>Choose a section to get started</p>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'inventory' ? styles.active : ''}`}
                        onClick={() => setActiveTab('inventory')}
                        >
                        <FontAwesomeIcon icon={faBoxes} /> Inventory Management
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'supply' ? styles.active : ''}`}
                        onClick={() => setActiveTab('supply')}
                        >
                        <FontAwesomeIcon icon={faTruckLoading} /> Supply Management
                    </button>
                </div>
             </div>
        </div>
      )}

      <main className={styles.tabContent}>
        {activeTab === 'inventory' && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📦 Inventory Items</h3>
            <button className={styles.addBtn} onClick={() => setShowAddItemModal(true)}>
              <FontAwesomeIcon icon={faPlus} /> Add Item
            </button>

            <button className={styles.backBtn} onClick={() => setActiveTab(null)}>
              <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
            </button>

            <table className={`${styles.table} ${styles.fadeInOverlay}`}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Expiry</th>
                  <th>Threshold</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.expiryDate}</td>
                    <td>{item.thresholdLevel}</td>
                    <td>
                        <button className={styles.iconBtn}
                            onClick={() => {
                                setEditItem(item);
                                setItemName(item.name);
                                setQuantity(item.quantity);
                                setUnit(item.unit);
                                setExpiryDate(item.expiryDate);
                                setThreshold(item.thresholdLevel);
                                setShowAddItemModal(true);
                            }}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className={styles.iconBtn} onClick={() => handleDelete(item.id)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showAddItemModal && (
              <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
                <div className={`${styles.modal} ${styles.slideUpModal}`}>
                  <h4>{editItem ? 'Edit Item' : 'Add New Item'}</h4>
                  <form onSubmit={handleAddItem}>
                    <input type="text" placeholder="Name" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                    <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    <input type="text" placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} required />
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
                    <input type="number" placeholder="Threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} required />
                    <div className={styles.modalActions}>
                      <button type="submit" className={styles.saveBtn}>
                        Save
                      </button>
                      <button onClick={() => {setShowAddItemModal(false); setEditItem(null);} } className={styles.cancelBtn}>
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'supply' && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📑 Supply Section</h3>
            <button className={styles.backBtn2} onClick={() => setActiveTab(null)}>
              <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
            </button>
            <div className={styles.cardGrid}>
              <div className={styles.card}>
                <h4><FontAwesomeIcon icon={faPaperPlane} /> Send Supply Request</h4>
                <p>Request materials with specific quantities from suppliers.</p>
                <button className={styles.cardBtn} onClick={() => setShowRequestModal(true)}>
                    + New Request
                </button>
              </div>
              <div className={styles.card}>
                <h4><FontAwesomeIcon icon={faBell} /> Review Supply Offers</h4>
                <p>Check offers from suppliers and accept or reject them.</p>
                <button className={styles.cardBtn}>Go to Offers</button>
              </div>

              <div className={styles.card}>
                <h4><FontAwesomeIcon icon={faFileInvoiceDollar} /> Create Purchase Bill</h4>
                <p>Generate a bill for accepted supply offers.</p>
                <button className={styles.cardBtn}>+ New Bill</button>
              </div>
            </div>
          </section>
        )}

        {showRequestModal && (
        <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
            <div className={`${styles.modal} ${styles.slideUpModal} ${styles.requestModal}`}>
            <h4 className={styles.modalTitle}>📝 New Supply Request</h4>
            <form onSubmit={handleSubmitSupplyRequest}>
                <label className={styles.inputLabel}>📋 Select Items & Quantities:</label>
                <div className={styles.itemList}>
                {requestItems.map((item, idx) => (
                    <div key={item.id} className={styles.itemRow}>
                    <span className={styles.itemName}>{item.name}</span>
                    <input
                        type="number"
                        className={styles.itemQtyInput}
                        placeholder="Qty"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(e, idx)}
                    />
                    </div>
                ))}
                </div>

                <label className={styles.inputLabel}>👤 Select Supplier:</label>
                <select
                className={styles.selectBox}
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                required
                >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                </select>

                <label className={styles.inputLabel}>🗒️ Note (optional):</label>
                <textarea
                className={styles.textArea}
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional instructions..."
                />

                <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>Send</button>
                <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowRequestModal(false)}
                >
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
                </div>
            </form>
            </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default InventorySupply;