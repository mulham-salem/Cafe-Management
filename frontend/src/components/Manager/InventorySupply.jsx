import React, { useState, useEffect } from 'react';
import styles from '../styles/InventorySupply.module.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faTruckLoading, faPlus, faEdit, faTrash, faBell, faFileInvoiceDollar, faPaperPlane, faTimes, faArrowRotateBack } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Get the token from sessionStorage or localStorage
const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

// Configure Axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000/api'; // Adjust your API base URL if different
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

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

  // حالة المخزون ستُجلب من الباك إند
  const [inventory, setInventory] = useState([]);
  
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [threshold, setThreshold] = useState('');

  const [editItem, setEditItem] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingOffer, setLoadingOffer] = useState(true);

    // دالة لجلب المخزون من الـ API
    const fetchInventory = async () => {
      try {
        const response = await axios.get('/manager/inventory');
        setInventory(response.data.inventory_items);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        toast.error('Failed to load inventory items.');
      } finally {
        setLoadingInventory(false);
      }
    };
  
    // useEffect لجلب المخزون عند تحميل المكون لأول مرة أو عند تغيير التاب إلى 'inventory'
    useEffect(() => {
      if (activeTab === 'inventory') {
        fetchInventory();
      }
    }, [activeTab]);

  // useEffect(() => {
  //   inventory.forEach((item) => {
  //     if (item.quantity <= item.thresholdLevel) {
  //       toast.warning(
  //         <div className='lowStock'>
  //           <span>⚠️ Low Stock Alert</span>
  //           <br/>
  //           <span>
  //             {item.name} only {item.quantity} {item.unit} left <br/> (threshold: {item.thresholdLevel} {item.unit})
  //           </span>
  //         </div>
  //       );
  //     }
  //   });
  // }, [inventory]);

  const handleDelete = async (id) => { // أضف `async` هنا
    const item = inventory.find((item) => item.id === id);
    if (!item) return;

    try {
      // التحقق مما إذا كان العنصر مرتبطًا بعناصر القائمة
      // هذه الخطوة تتم على الباك إند، لذا لا تحتاج لـ `if` هنا
      await axios.delete(`/manager/inventory/${id}`); // إرسال طلب الحذف
      toast.info(`🗑️ ${item.name} deleted`);
      fetchInventory(); // أعد جلب المخزون بعد الحذف لتحديث الواجهة
    } catch (error) {
      console.error('Error deleting item:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete item. Please try again.');
      }
    }
  };

  const handleAddItem = async (e) => { // أضف `async` هنا
    e.preventDefault();

    if (!itemName || !quantity || !unit || !expiryDate || !threshold) {
      toast.error('Please fill in all fields');
      return;
    }

    if (quantity <= 0 || threshold < 0) {
      toast.error('Quantity must be > 0 and Threshold ≥ 0');
      return;
    }

    const itemData = {
      name: itemName,
      quantity: parseFloat(quantity),
      unit: unit,
      expiry_date: expiryDate, // تطابق مع اسم العمود في الباك إند
      threshold_level: parseFloat(threshold), // تطابق مع اسم العمود في الباك إند
    };

    try {
      if (editItem) {
        // تحديث عنصر موجود (PUT request)
        const response = await axios.put(`/manager/inventory/${editItem.id}`, itemData);
        toast.success(`✏️ ${itemName} updated`);

        if (response.data.low_stock_alert) {
          toast.warning(response.data.low_stock_alert, { icon: "⚠️" });
        }
      } else {
        // إضافة عنصر جديد (POST request)
        const response = await axios.post('/manager/inventory', itemData);
        toast.success(`✅ ${itemName} added`);

        if (response.data.low_stock_alert) {
          toast.warning(response.data.low_stock_alert, { icon: "⚠️" });
        }
      }
      setShowAddItemModal(false);
      setItemName('');
      setQuantity('');
      setUnit('');
      setExpiryDate('');
      setThreshold('');
      setEditItem(null);
      fetchInventory(); // أعد جلب المخزون بعد الإضافة أو التعديل لتحديث الواجهة

    } catch (error) {
      console.error('Error adding/updating item:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.errors) {
         // Handle validation errors from Laravel
         const errors = error.response.data.errors;
         for (const key in errors) {
             toast.error(errors[key][0]);
         }
      }
       else {
        toast.error('Failed to save item. Please try again.');
      }
    }
  };
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [requestItems, setRequestItems] = useState([]);

  // Fetch initial data (suppliers, offers)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch suppliers
        const suppliersResponse = await axios.get('/manager/suppliers');
        setSuppliers(suppliersResponse.data);

        // Fetch offers
        const offersResponse = await axios.get('/manager/supply'); // Assumes 'index' method on backend fetches pending offers
        setOffers(offersResponse.data.map(offer => ({
          id: offer.id,
          title: offer.title,
          supplier: offer.supplier_name,
          totalPrice: offer.total_price,
          deliveryDate: offer.delivery_date.split(' ')[0], // Format date for display
          note: offer.note,
          status: offer.status, // All fetched offers are pending
          items: offer.items.map(item => ({
            name: item.item_name,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unit_price,
          })),
        })));
      } catch (error) {
        toast.error("Failed to fetch initial data.");
        console.error("Error fetching initial data:", error);
      } finally {
        setLoadingOffer(false);
      }
    };
    fetchInitialData();
  }, []);


  // Initialize request items when the modal is shown, using the provided 'inventory' state 
  useEffect(() => {
    if (showRequestModal && inventory.length > 0) { // Only initialize if inventory is loaded
      const initial = inventory.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: 0,
      }));
      setRequestItems(initial); // 
    }
  }, [showRequestModal, inventory]); // 

  const handleSubmitSupplyRequest = async (e) => { // 
    e.preventDefault(); // 

    if (!selectedSupplier) { // 
      toast.error("Please select a supplier"); // 
      return; // 
    }

    const validItems = requestItems.filter((i) => i.quantity > 0); // 

    if (validItems.length === 0) { // 
      toast.error("Please enter quantity for at least one item"); // 
      return; // 
    }

    try {
      const payload = {
        supplier_id: selectedSupplier,
        note: note,
        title: title,
        items: validItems.map(item => ({
          inventory_item_id: item.id,
          quantity: item.quantity
        }))
      };
      await axios.post('/manager/supply', payload); // Connects to store method
      toast.success("📦 Supply request sent!"); // 
      setShowRequestModal(false); // 
      setSelectedSupplier(''); // 
      setNote(''); // 
      setTitle('');
      // Optionally re-fetch offers or update state if needed immediately
    } catch (error) {
      toast.error("Failed to send supply request.");
      console.error("Error sending supply request:", error);
    }
  };
  
  const handleQuantityChange = (e, idx) => {
    const qty = parseInt(e.target.value) || 0; // 
    setRequestItems((prev) => { // 
      const updated = [...prev]; // 
      updated[idx].quantity = qty; // 
      return updated; // 
    });
  };

  const [offers, setOffers] = useState([]); //  Will be fetched from API
  const [rejectingOffer, setRejectingOffer] = useState(null); // 
  const [rejectionReason, setRejectionReason] = useState(''); // 

  const handleAcceptOffer = async (id) => { // 
    try {
      await axios.post(`/manager/supply-offers/${id}/accept`); // Connects to acceptOffer method
      setOffers((prev) => // 
        prev.map((offer) => // 
          offer.id === id ? { ...offer, status: 'accepted' } : offer // 
        )
      );
      toast.success('✅ Offer accepted'); // 
    } catch (error) {
      toast.error("Failed to accept offer.");
      console.error("Error accepting offer:", error);
    }
  };

  const handleRejectOffer = async (id) => { // 
    try {
      await axios.post(`/manager/supply-offers/${id}/reject`, { reason: rejectionReason }); // Connects to rejectOffer method
      setOffers((prev) => // 
        prev.map((offer) => // 
          offer.id === id ? { ...offer, status: 'Rejected', reason: rejectionReason } : offer // 
        )
      );
      toast.info('❌ Offer rejected'); // 
      setRejectingOffer(null); // 
      setRejectionReason(''); // 
    } catch (error) {
      toast.error("Failed to reject offer.");
      console.error("Error rejecting offer:", error);
    }
  };
  
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [billDate, setBillDate] = useState('');
  const [bills, setBills] = useState([]); 

  const approvedOffers = offers.filter(o => o.status === 'accepted'); // 

  const handleSubmitBill = async (e) => { // 
    e.preventDefault(); // 

    const offer = approvedOffers.find(o => o.id.toString() === selectedOfferId); // 

    if (!offer || !billDate) { // 
      toast.error("Missing required fields"); // 
      return; // 
    }
    const itemCalculatedPricesArray = offer.items.map(item =>
      (item.quantity * item.unitPrice).toFixed(2) // ???????? ???? ?????????????? ???? 2 ????????
    );
    const itemCalculatedPricesString = itemCalculatedPricesArray.join(', '); // ?????????? ???????????? ????????????

    try {
      const payload = {
        supply_offer_id: offer.id,
        supplier_id: suppliers.find(s => s.name === offer.supplier)?.id, // Find supplier ID from state
        purchase_date: billDate,
        item_calculated_prices: itemCalculatedPricesString,
      };
      const response = await axios.post('/manager/supply-purchase-bill', payload); // Connects to storePurchaseBill method
      const newBillId = response.data.purchase_bill_id; 

      const newBill = { // 
        id: newBillId, // 
        offerId: offer.id, // 
        supplier: offer.supplier, // 
        items: offer.items, // 
        total: offer.totalPrice, // 
        date: billDate, // 
        itemCalculatedPrices: itemCalculatedPricesString,
      };
      setBills([...bills, newBill]); // 
      toast.success(<>🧾 Purchase Bill Saved! <br/> and Inventory Updated</>); // 
      setShowBillModal(false); // 
      setSelectedOfferId(''); // 
      setBillDate(''); // 
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save purchase bill.");
        console.error("Error saving purchase bill:", error);
      }
    }
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
            {loadingInventory ? (
              <p className={styles.emptyText}>Loading...</p>
            ) : (
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
                    <td>{item.expiry_date}</td>
                    <td>{item.threshold_level}</td>
                    <td>
                        <button className={styles.iconBtn}
                            onClick={() => {
                                setEditItem(item);
                                setItemName(item.name);
                                setQuantity(item.quantity);
                                setUnit(item.unit);
                                setExpiryDate(item.expiry_date);
                                setThreshold(item.threshold_level);
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
            )}
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
            <div className={`${styles.slideUpModal} ${styles.requestModal}`}>
            <h4>📝 New Supply Request</h4>
            <form onSubmit={handleSubmitSupplyRequest}>
                <label>🏷️ Request Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.titleInput}
                    placeholder="e.g. Weekly Ingredient Request"
                    required
                />
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

                <div className={styles.requestModalActions}>
                <button type="submit" className={styles.supplySaveBtn}>Send</button>
                <button
                    type="button"
                    className={styles.supplyCancelBtn}
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
            {loadingOffer ? (
              <p className={styles.emptyText}>Loading...</p>
            ) : offers.length === 0 ? (
              <p className={styles.emptyText}>No offers to display.</p>
            ) : (
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
                    {offer.status === 'pending' ? (
                        <>
                        <button className={styles.acceptBtn} onClick={() => handleAcceptOffer(offer.id)}>✅ Accept</button>
                        <button className={styles.rejectBtn} onClick={() => setRejectingOffer(offer)}>❌ Reject</button>
                        </>
                    ) : (
                        <span
                        className={`${styles.statusBadge} ${
                            offer.status === 'accepted' ? styles.statusApproved : styles.statusRejected
                        }`}
                        >
                        {offer.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                        </span>
                    )}
                </div>

                </div>
            ))}
            </div>
            )}
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
                  type="datetime-local"
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