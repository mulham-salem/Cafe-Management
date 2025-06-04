import React, { useState, useEffect } from 'react';
import styles from '../styles/InventorySupply.module.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faTruckLoading, faPlus, faEdit, faTrash, faBell, faFileInvoiceDollar, faPaperPlane, faTimes, faArrowRotateBack } from '@fortawesome/free-solid-svg-icons';


const InventorySupply = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Inventory & Supply";
  }, []);

  const allowedTabs = ['inventory', 'supply', 'offers', 'null'];

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('activeTab');
    return allowedTabs.includes(saved) ? (saved === 'null' ? null : saved) : null;
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab === null ? 'null' : tab);
  };

  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const [inventory, setInventory] = useState(() => {
    const savedInventory = localStorage.getItem("inventory");
    return savedInventory ? JSON.parse(savedInventory) : [];
  });

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);
  
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [threshold, setThreshold] = useState('');


  useEffect(() => {
    inventory.forEach((item) => {
      if (item.quantity <= item.thresholdLevel) {
        toast.warning(
          <div className='lowStock'>
            <span>⚠️ Low Stock Alert</span>
            <br/>
            <span>
              {item.name} only {item.quantity} {item.unit} left <br/> (threshold: {item.thresholdLevel} {item.unit})
            </span>
          </div>
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
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: 'Offer 1',
      supplier: 'Supplier A',
      totalPrice: 250,
      deliveryDate: '2025-06-10',
      note: 'Fast delivery guaranteed.',
      status: 'Pending',
      items: [
        { name: 'Sugar', quantity: 10, unit: 'kilo', unitPrice: 5 },
        { name: 'Milk', quantity: 5, unit: 'liter', unitPrice: 10 },
      ],
    },
    {
      id: 2,
      title: 'Offer 2',
      supplier: 'Supplier B',
      totalPrice: 400,
      deliveryDate: '2025-06-15',
      note: 'Includes packaging.',
      status: 'Pending',
      items: [
        { name: 'Coffee', quantity: 8, unit: 'kilo', unitPrice: 20 },
      ],
    },
  ]);
  const [rejectingOffer, setRejectingOffer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const handleAcceptOffer = (id) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === id ? { ...offer, status: 'approved' } : offer
      )
    );
    toast.success('✅ Offer accepted');
  };
  const handleRejectOffer = (id) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === id ? { ...offer, status: 'Rejected', reason: rejectionReason } : offer
      )
    );
    toast.info('❌ Offer rejected');
    setRejectingOffer(null);
    setRejectionReason('');
  };
  
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [billDate, setBillDate] = useState('');
  const [bills, setBills] = useState([]); 

  const approvedOffers = offers.filter(o => o.status === 'approved');

  const handleSubmitBill = (e) => {
    e.preventDefault();
  
    const offer = approvedOffers.find(o => o.id.toString() === selectedOfferId);
    if (!offer || !billDate) {
      toast.error("Missing required fields");
      return;
    }
  
    const newBill = {
      id: Date.now(),
      offerId: offer.id,
      supplier: offer.supplier,
      items: offer.items,
      total: offer.totalPrice,
      date: billDate,
    };
  
    setBills([...bills, newBill]); 
    toast.success("🧾 Purchase Bill Saved!");
    setShowBillModal(false);
    setSelectedOfferId('');
    setBillDate('');
  };

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 50); 

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={styles.pageWrapper}>
      <ToastContainer />
      {activeTab === null && (
        <div className={`${styles.backgroundFull} ${loaded ? styles.visible : ''}`}>
            <div className={styles.backgroundContent}>
                <h2>Welcome to Inventory & Supply</h2>
                <p>Choose a section to get started</p>
                <div className={styles.tabs}>
                    <button
                        className={styles.tabBtn}
                        onClick={() => changeTab('inventory')}
                        >
                        <FontAwesomeIcon icon={faBoxes} className={styles.iconTabBtn} /> Inventory Management
                    </button>
                    <button
                        className={styles.tabBtn}
                        onClick={() => changeTab('supply')}
                        >
                        <FontAwesomeIcon icon={faTruckLoading}  className={styles.iconTabBtn} /> Supply Management
                    </button>
                </div>
             </div>
        </div>
      )}

      <main className={styles.tabContent}>
        {activeTab === 'inventory' && (
          <section className={styles.inventortSection}>
            <h3 className={styles.inventortSectionTitle}>📦 Inventory Items</h3>
            <button className={styles.addBtn} onClick={() => setShowAddItemModal(true)}>
              <FontAwesomeIcon icon={faPlus} /> Add Item
            </button>

            <button className={styles.backBtn} onClick={() => changeTab(null)}>
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
                            <FontAwesomeIcon icon={faEdit} data-action="Edit" title="Edit"/>
                        </button>
                        <button className={styles.iconBtn} onClick={() => handleDelete(item.id)}>
                            <FontAwesomeIcon icon={faTrash} data-action="Delete" title="Delete" />
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
          <section className={styles.supplySection}>
            <h3 className={styles.supplySectionTitle}>📑 Supply Section</h3>
            <button className={styles.backBtn2} onClick={() => changeTab(null)}>
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
                <button className={styles.cardBtn} onClick={() => changeTab('offers')}>
                    Go to Offers
                </button>
              </div>

              <div className={styles.card}>
                <h4><FontAwesomeIcon icon={faFileInvoiceDollar} /> Create Purchase Bill</h4>
                <p>Generate a bill for accepted supply offers.</p>
                <button className={styles.cardBtn} onClick={() => setShowBillModal(true)}>
                  + New Bill
                </button>
              </div>
            </div>
          </section>
        )}

        {showRequestModal && (
        <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
            <div className={`${styles.modal} ${styles.slideUpModal} ${styles.requestModal}`}>
            <h4>📝 New Supply Request</h4>
            <form onSubmit={handleSubmitSupplyRequest}>
                <label>📋 Select Items & Quantities:</label>
                <div className={styles.itemList}>
                {requestItems.map((item, idx) => (
                    <div key={item.id} className={styles.itemRow}>
                    <span className={styles.itemName}>{item.name}</span>
                    <input
                        type="number"
                        placeholder="Qty"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(e, idx)}
                    />
                    </div>
                ))}
                </div>

                <label>👤 Select Supplier:</label>
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

                <label>🗒️ Note (optional):</label>
                <textarea
                className={styles.textArea}
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional instructions..."
                />

                <div className={styles.modalActions}>
                <button type="submit" className={styles.supplySaveBtn}>Send</button>
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

        {activeTab === 'offers' && (
        <section>
            <h3 className={styles.supplyOffersTitle}>📦 Supply Offers</h3>
            <button className={styles.backBtn3} onClick={() => changeTab('supply')}>
              <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
            </button>
            <div className={`${styles.offerList} ${styles.fadeInOverlay}`}>
            {offers.map((offer) => (
                <div key={offer.id} className={styles.offerCard}>
                <h4 className={styles.offerTitle}>{offer.title}</h4>
                <p><strong>Supplier:</strong> {offer.supplier}</p>
                <p><strong>Total Price:</strong> ${offer.totalPrice.toFixed(2)}</p>
                <p><strong>Delivery Date:</strong> {offer.deliveryDate}</p>
                <p><strong>Note:</strong> {offer.note}</p>
                <div className={styles.offerItems}>
                    {offer.items.map((item, idx) => (
                    <div key={idx} className={styles.offerItem}>
                        • {item.name} - {item.quantity} - {item.unit} - ${item.unitPrice}
                    </div>
                    ))}
                </div>
                <div className={styles.offerActions}>
                    {offer.status === 'Pending' ? (
                        <>
                        <button className={styles.acceptBtn} onClick={() => handleAcceptOffer(offer.id)}>✅ Accept</button>
                        <button className={styles.rejectBtn} onClick={() => setRejectingOffer(offer)}>❌ Reject</button>
                        </>
                    ) : (
                        <span
                        className={`${styles.statusBadge} ${
                            offer.status === 'approved' ? styles.statusApproved : styles.statusRejected
                        }`}
                        >
                        {offer.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                    )}
                </div>

                </div>
            ))}
            </div>
        </section>
        )}

        {rejectingOffer && (
        <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
            <div className={`${styles.slideUpModal} ${styles.rejectModal}`}>
            <h4 className={styles.rejectModalTitle}>❌ Reject Offer</h4>
            <p>Optional: Add reason for rejection</p>
            <textarea
                className={styles.textArea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="3"
                placeholder="e.g., Price too high, delivery too late..."
            />
            <div className={styles.rejectModalActions}>
                <button
                className={styles.rejectConfirmBtn}
                onClick={() => handleRejectOffer(rejectingOffer.id)}
                >
                Confirm Reject
                </button>

                <button
                className={styles.rejectCancelBtn}
                onClick={() => {
                    setRejectingOffer(null);
                    setRejectionReason('');
                }}
                >
                Cancel
                </button>

            </div>
            </div>
        </div>
        )}

        {showBillModal && (
          <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
            <div className={`${styles.slideUpModal} ${styles.billModal}`}>
              <h4 className={styles.billModalTitle}>🧾 Create Purchase Bill</h4>
              <form onSubmit={handleSubmitBill}>
                <label className={styles.inputLabel}>📦 Select Approved Offer:</label>
                <select
                  className={styles.selectBox}
                  value={selectedOfferId}
                  onChange={(e) => setSelectedOfferId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Offer --</option>
                  {approvedOffers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.title} - {offer.supplier}
                    </option>
                  ))}
                </select>

                <label className={styles.inputLabel}>📅 Purchase Date:</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  required
                />

                {selectedOfferId && (
                  <div className={styles.billDetails}>
                    <h5 className={styles.sectionSubTitle}>Offer Details</h5>
                    {approvedOffers
                      .find((o) => o.id.toString() === selectedOfferId)
                      .items.map((item, idx) => (
                        <div key={idx} className={styles.billItemRow}>
                          • {item.name}: {item.quantity} {item.unit} × ${item.unitPrice} = ${item.quantity * item.unitPrice}
                        </div>
                      ))}
                    <p className={styles.totalPrice}>
                      Total: $
                      {approvedOffers.find((o) => o.id.toString() === selectedOfferId).totalPrice.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button type="submit" className={styles.billSaveBtn}>Save Bill</button>
                  <button
                    type="button"
                    className={styles.billCancelBtn}
                    onClick={() => {
                      setShowBillModal(false);
                      setSelectedOfferId('');
                      setBillDate('');
                    }}
                  >
                    Cancel
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