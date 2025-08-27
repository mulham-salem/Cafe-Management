import React, { useState, useEffect, useContext, useMemo } from "react";
import styles from "../styles/InventorySupply.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faTruckLoading,
  faPlus,
  faEdit,
  faTrash,
  faBell,
  faFileInvoiceDollar,
  faPaperPlane,
  faTimes,
  faArrowRotateBack,
  faTrashCan,
  faClockRotateLeft,
  faSyncAlt,
  faArrowLeft,
  faCalendarAlt,
  faTag,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useActiveTab } from "../../context/ActiveTabContext";
import { SearchContext } from "./ManagerDashboard";
import { SupplierSearchContext } from "../Supplier/SupplierHome";
import { EmpSearchContext } from "../Employee/EmployeeHome";
import { usePermissions } from "../../context/PermissionsContext";

const token =
  sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";

const mockInventory = [
  {
    id: 1,
    name: "Flour",
    quantity: 150,
    unit: "kg",
    expiry_date: "2024-06-30",
    threshold_level: 50,
  },
  {
    id: 2,
    name: "Sugar",
    quantity: 30,
    unit: "kg",
    expiry_date: "2025-01-15",
    threshold_level: 30,
  },
  {
    id: 3,
    name: "Olive Oil",
    quantity: 45,
    unit: "liters",
    expiry_date: "2024-09-20",
    threshold_level: 15,
  },
  {
    id: 4,
    name: "Rice",
    quantity: 200,
    unit: "kg",
    expiry_date: "2024-12-10",
    threshold_level: 75,
  },
  {
    id: 5,
    name: "Tomato Paste",
    quantity: 120,
    unit: "cans",
    expiry_date: "2024-08-05",
    threshold_level: 40,
  },
  {
    id: 6,
    name: "Salt",
    quantity: 60,
    unit: "kg",
    expiry_date: "2026-03-01",
    threshold_level: 20,
  },
  {
    id: 7,
    name: "Black Pepper",
    quantity: 25,
    unit: "kg",
    expiry_date: "2024-11-15",
    threshold_level: 10,
  },
  {
    id: 8,
    name: "Chicken Breast",
    quantity: 35,
    unit: "kg",
    expiry_date: "2024-04-25",
    threshold_level: 15,
  },
  {
    id: 9,
    name: "Eggs",
    quantity: 180,
    unit: "pieces",
    expiry_date: "2024-04-30",
    threshold_level: 50,
  },
  {
    id: 10,
    name: "Milk",
    quantity: 30,
    unit: "liters",
    expiry_date: "2024-04-28",
    threshold_level: 10,
  },
];

const InventorySupply = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Inventory & Supply";
  }, []);

  const { permissions, role } = usePermissions();
  const { activeTab, changeTab } = useActiveTab();

  useEffect(() => {
    if (role === "manager") {
      changeTab(null);
      return;
    }
    const hasInventory = permissions.includes("Inventory Management");
    const hasSupply = permissions.includes("Supply Management");

    if (hasInventory && hasSupply) {
      changeTab(null);
      if (activeTab === "inventory") changeTab("inventory");
      else if (activeTab === "supply") changeTab("supply");
      else if (activeTab === "offers") changeTab("offers");
      else if (activeTab === "purchaseBills") changeTab("purchaseBills");
      else if (activeTab === "supplyHistory") changeTab("supplyHistory");
    } else if (hasInventory) {
      changeTab("inventory");
    } else if (hasSupply) {
      changeTab("supply");
    }
  }, [permissions, role]);

  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const [inventory, setInventory] = useState([]);

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [threshold, setThreshold] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingOffer, setLoadingOffer] = useState(true);

  const managerContext = useContext(SearchContext);
  const supplierContext = useContext(SupplierSearchContext);
  const empContext = useContext(EmpSearchContext);
  const context =
    role === "manager"
      ? managerContext
      : role === "supplier"
      ? supplierContext
      : role === "employee"
      ? empContext
      : "";
  const { searchQuery, setSearchPlaceholder } = context;

  const fetchInventory = async () => {
    try {
      // const response = await axios.get("/manager/inventory");
      // setInventory(response.data.inventory_items);
      setInventory(mockInventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      //toast.error('Failed to load inventory items.');
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventory();
    }
  }, [activeTab]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(
      (item) =>
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.quantity.toString().includes(searchQuery)
    );
  }, [inventory, searchQuery]);

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

  const handleDelete = async (id) => {
    const item = inventory.find((item) => item.id === id);
    if (!item) return;

    try {
      await axios.delete(`/manager/inventory/${id}`);
      toast.info(`🗑️ ${item.name} deleted`);
      fetchInventory();
    } catch (error) {
      console.error("Error deleting item:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete item. Please try again.");
      }
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!itemName || !quantity || !unit || !expiryDate || !threshold) {
      toast.error("Please fill in all fields");
      return;
    }

    if (quantity <= 0 || threshold < 0) {
      toast.error("Quantity must be > 0 and Threshold ≥ 0");
      return;
    }

    const itemData = {
      name: itemName,
      quantity: parseFloat(quantity),
      unit: unit,
      expiry_date: expiryDate,
      threshold_level: parseFloat(threshold),
    };

    try {
      if (editItem) {
        const response = await axios.put(
          `/manager/inventory/${editItem.id}`,
          itemData
        );
        toast.success(`✏️ ${itemName} updated`);

        if (response.data.low_stock_alert) {
          toast.warning(response.data.low_stock_alert, { icon: "⚠️" });
        }
      } else {
        const response = await axios.post("/manager/inventory", itemData);
        toast.success(`✅ ${itemName} added`);

        if (response.data.low_stock_alert) {
          toast.warning(response.data.low_stock_alert, { icon: "⚠️" });
        }
      }
      setShowAddItemModal(false);
      setItemName("");
      setQuantity("");
      setUnit("");
      setExpiryDate("");
      setThreshold("");
      setEditItem(null);
      fetchInventory();
    } catch (error) {
      console.error("Error adding/updating item:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.errors
      ) {
        const errors = error.response.data.errors;
        for (const key in errors) {
          toast.error(errors[key][0]);
        }
      } else {
        toast.error("Failed to save item. Please try again.");
      }
    }
  };
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [requestItems, setRequestItems] = useState([]);

  const mockSupplyOffers = [
    {
      id: 1,
      title: "Monthly Grocery Supply",
      supplier: "ABC Food Distributors",
      totalPrice: 1250.75,
      deliveryDate: "2024-05-15",
      note: "Includes seasonal discounts",
      items: [
        {
          name: "Flour",
          quantity: 100,
          unit: "kg",
          unitPrice: 0.85,
        },
        {
          name: "Sugar",
          quantity: 50,
          unit: "kg",
          unitPrice: 1.2,
        },
      ],
    },
    {
      id: 2,
      title: "Beverage Order",
      supplier: "Beverage World Inc.",
      totalPrice: 980.5,
      deliveryDate: "2024-05-18",
      note: "",
      items: [
        {
          name: "Orange Juice",
          quantity: 30,
          unit: "liters",
          unitPrice: 3.5,
        },
        {
          name: "Mineral Water",
          quantity: 100,
          unit: "bottles",
          unitPrice: 0.75,
        },
      ],
    },
    {
      id: 3,
      title: "Meat Supply",
      supplier: "Prime Meats Co.",
      totalPrice: 2200.0,
      deliveryDate: "2024-05-20",
      note: "Halal certified",
      items: [
        {
          name: "Chicken Breast",
          quantity: 40,
          unit: "kg",
          unitPrice: 5.25,
        },
        {
          name: "Beef Steak",
          quantity: 25,
          unit: "kg",
          unitPrice: 8.75,
        },
      ],
    },
    {
      id: 4,
      title: "Cleaning Supplies",
      supplier: "CleanPro Solutions",
      totalPrice: 675.3,
      deliveryDate: "2024-05-22",
      note: "Next-day delivery available",
      items: [
        {
          name: "Disinfectant",
          quantity: 20,
          unit: "liters",
          unitPrice: 4.25,
        },
        {
          name: "Paper Towels",
          quantity: 50,
          unit: "rolls",
          unitPrice: 1.15,
        },
      ],
    },
    {
      id: 5,
      title: "Emergency Restock",
      supplier: "QuickSupply LLC",
      totalPrice: 1500.0,
      deliveryDate: "2024-05-10",
      note: "Urgent order - expedited shipping",
      items: [
        {
          name: "Eggs",
          quantity: 200,
          unit: "dozens",
          unitPrice: 2.4,
        },
        {
          name: "Milk",
          quantity: 60,
          unit: "liters",
          unitPrice: 1.1,
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // const suppliersResponse = await axios.get("/manager/suppliers");
        // setSuppliers(suppliersResponse.data);

        // const offersResponse = await axios.get("/manager/supply");
        // setOffers(
        //   offersResponse.data.map((offer) => ({
        //     id: offer.id,
        //     title: offer.title,
        //     supplier: offer.supplier_name,
        //     totalPrice: offer.total_price,
        //     deliveryDate: offer.delivery_date.split(" ")[0],
        //     note: offer.note,
        //     status: offer.status,
        //     items: offer.items.map((item) => ({
        //       name: item.item_name,
        //       quantity: item.quantity,
        //       unit: item.unit,
        //       unitPrice: item.unit_price,
        //     })),
        //   }))
        // );
        setOffers(mockSupplyOffers);
      } catch (error) {
        // toast.error("Failed to fetch initial data.");
        console.error("Error fetching initial data:", error);
      } finally {
        setLoadingOffer(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showRequestModal && inventory.length > 0) {
      const initial = inventory.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: 0,
      }));
      setRequestItems(initial);
    }
  }, [showRequestModal, inventory]);

  const handleSubmitSupplyRequest = async (e) => {
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

    try {
      const payload = {
        supplier_id: selectedSupplier,
        note: note,
        title: title,
        items: validItems.map((item) => ({
          inventory_item_id: item.id,
          quantity: item.quantity,
        })),
      };
      await axios.post("/manager/supply", payload);
      toast.success("📦 Supply request sent!");
      setShowRequestModal(false);
      setSelectedSupplier("");
      setNote("");
      setTitle("");
    } catch (error) {
      toast.error("Failed to send supply request.");
      console.error("Error sending supply request:", error);
    }
  };

  const handleQuantityChange = (e, idx) => {
    const qty = parseInt(e.target.value) || 0;
    setRequestItems((prev) => {
      const updated = [...prev];
      updated[idx].quantity = qty;
      return updated;
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchResults = requestItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      searchTerm.length > 0
  );

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleItemClick = (item) => {
    const itemIndex = requestItems.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      const fakeEvent = { target: { value: "1" } };
      handleQuantityChange(fakeEvent, itemIndex);
    }
    setSearchTerm("");
    setShowSearchResults(false);
  };

  const selectedItems = requestItems.filter((item) => item.quantity > 0);

  const updateQuantity = (itemId, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity) || 0);
    const itemIndex = requestItems.findIndex((i) => i.id === itemId);
    if (itemIndex !== -1) {
      const fakeEvent = { target: { value: qty.toString() } };
      handleQuantityChange(fakeEvent, itemIndex);
    }
  };

  const increaseQuantity = (itemId) => {
    const item = requestItems.find((i) => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = requestItems.find((i) => i.id === itemId);
    if (item) {
      updateQuantity(itemId, Math.max(0, item.quantity - 1));
    }
  };

  const [offers, setOffers] = useState([]);
  const [rejectingOffer, setRejectingOffer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredOffer = useMemo(() => {
    return offers.filter(
      (offer) =>
        searchQuery === "" ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [offers, searchQuery]);

  const handleAcceptOffer = async (id) => {
    try {
      await axios.post(`/manager/supply-offers/${id}/accept`);
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id ? { ...offer, status: "accepted" } : offer
        )
      );
      toast.success("✅ Offer accepted");
    } catch (error) {
      toast.error("Failed to accept offer.");
      console.error("Error accepting offer:", error);
    }
  };

  const handleRejectOffer = async (id) => {
    try {
      await axios.post(`/manager/supply-offers/${id}/reject`, {
        reason: rejectionReason,
      });
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id
            ? { ...offer, status: "Rejected", reason: rejectionReason }
            : offer
        )
      );
      toast.info("❌ Offer rejected");
      setRejectingOffer(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject offer.");
      console.error("Error rejecting offer:", error);
    }
  };

  const mockBills = [
    {
      id: 1,
      date: "2025-08-10 10:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 2,
      date: "2022-08-09 10:20",
      supplier: "Supplier B",
      items: [
        { name: "Sugar", quantity: 5, unit: "kg", unitPrice: 8.0 },
        { name: "Tea Leaves", quantity: 7, unit: "kg", unitPrice: 12.3 },
      ],
      total: 5 * 8.0 + 7 * 12.3,
    },
    {
      id: 3,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 4,
      date: "2020-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 5,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 6,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 7,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 8,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 9,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 10,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 11,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
    {
      id: 12,
      date: "2025-08-10 14:35",
      supplier: "Supplier A",
      items: [
        { name: "Coffee Beans", quantity: 10, unit: "kg", unitPrice: 15.5 },
        { name: "Milk", quantity: 20, unit: "liters", unitPrice: 1.2 },
      ],
      total: 10 * 15.5 + 20 * 1.2,
    },
  ];

  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [billDate, setBillDate] = useState("");
  const [bills, setBills] = useState(mockBills);
  const [approvedOffers, setApprovedOffers] = useState([]);
  const [billedOfferIds, setBilledOfferIds] = useState([]);
  const [loadingBill, setLoadingBill] = useState(true);

  const fetchBills = async () => {
    try {
      // const res = await fetch("/api/purchase-bills");
      // const data = await res.data;
      // setBills(data);
    } catch (err) {
      toast.error("Error fetching bills:", err);
    } finally {
      setLoadingBill(false);
    }
  };

  useEffect(() => {
    if (activeTab === "purchaseBills") {
      fetchBills();
    }
  }, [activeTab]);

  const filteredBills = useMemo(() => {
    return bills.filter(
      (bill) => searchQuery === "" || bill.date.toString().includes(searchQuery)
    );
  }, [bills, searchQuery]);

  useEffect(() => {
    setApprovedOffers(
      offers.filter(
        (o) => o.status === "accepted" && !billedOfferIds.includes(o.id)
      )
    );
  }, [offers, billedOfferIds]);

  const handleSubmitBill = async (e) => {
    e.preventDefault();

    const offer = approvedOffers.find(
      (o) => o.id.toString() === selectedOfferId
    );

    if (!offer || !billDate) {
      toast.error("Missing required fields");
      return;
    }
    const itemCalculatedPricesArray = offer.items.map((item) =>
      (item.quantity * item.unitPrice).toFixed(2)
    );
    const itemCalculatedPricesString = itemCalculatedPricesArray.join(", ");

    try {
      const payload = {
        supply_offer_id: offer.id,
        supplier_id: suppliers.find((s) => s.name === offer.supplier)?.id,
        purchase_date: billDate,
        item_calculated_prices: itemCalculatedPricesString,
      };
      const response = await axios.post(
        "/manager/supply-purchase-bill",
        payload
      );
      const newBillId = response.data.purchase_bill_id;

      const newBill = {
        id: newBillId,
        offerId: offer.id,
        supplier: offer.supplier,
        items: offer.items,
        total: offer.totalPrice,
        date: billDate,
        itemCalculatedPrices: itemCalculatedPricesString,
      };
      setBills([...bills, newBill]);
      setBilledOfferIds((prev) => [...prev, offer.id]);
      toast.success(
        <div className="purchase-custom-toast">
          🧾 Purchase Bill Saved! and Inventory Updated
        </div>
      );
      setBilledOfferIds([...billedOfferIds, offer.id]);
      setSelectedOfferId("");
      setBillDate("");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
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

  const mockSupplyHistory = [
    {
      id: 1,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2024-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 2,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 3,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
    {
      id: 4,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2024-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 5,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 6,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
    {
      id: 7,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2023-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 8,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 9,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
    {
      id: 10,
      title: "Coffee Beans Supply",
      type: "supply offer",
      status: "accepted",
      supplyDate: "2022-08-08T14:30:00Z",
      items: [
        { name: "Arabica Coffee", quantity: 50, unit: "kilo" },
        { name: "Robusta Coffee", quantity: 30, unit: "kilo" },
      ],
      totalPrice: 450.75,
      rejectionReason: "",
    },
    {
      id: 11,
      title: "Cleaning Supplies Request",
      type: "supply request",
      status: "pending",
      supplyDate: "2025-08-09T10:00:00Z",
      items: [
        { name: "Table Cleaner", quantity: 20, unit: "kilo" },
        { name: "Paper Towels", quantity: 100, unit: "kilo" },
      ],
      totalPrice: 120.0,
      rejectionReason: "",
    },
    {
      id: 12,
      title: "Milk Supply",
      type: "supply offer",
      status: "rejected",
      supplyDate: "2025-08-05T09:15:00Z",
      items: [{ name: "Full Cream Milk", quantity: 100, unit: "kilo" }],
      totalPrice: 200.5,
      rejectionReason: "Requested quantity is not available",
    },
  ];
  const [supplyHistory, setSupplyHistory] = useState(mockSupplyHistory);
  const [loadingSupplyHistory, setLoadingSupplyHistory] = useState(true);

  const fetchSupplyHistory = async () => {
    try {
      // const response = await axios.get("/api/supply-history");
      // setSupplyHistory(response.data);
    } catch (err) {
      toast.error("Error fetching supply records:", err);
    } finally {
      setLoadingSupplyHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "supplyHistory") {
      fetchSupplyHistory();
    }
  }, [activeTab]);

  const filteredSupplyHistory = useMemo(() => {
    return supplyHistory.filter(
      (record) =>
        searchQuery === "" || record.supplyDate.toString().includes(searchQuery)
    );
  }, [supplyHistory, searchQuery]);

  useEffect(() => {
    if (activeTab === "inventory") {
      setSearchPlaceholder("Search by item or quantity..."); //inventory
    } else if (activeTab === "offers") {
      setSearchPlaceholder("Search by offer title..."); //offer
    } else if (activeTab === "purchaseBills" || activeTab === "supplyHistory") {
      setSearchPlaceholder("Search by date..."); //supplyHistory + bills
    }
  }, [activeTab, setSearchPlaceholder]);

  const [expandedRecords, setExpandedRecords] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRecords((prev) => (prev === id ? null : id));
  };

  const hasInventory = permissions.includes("Inventory Management");
  const hasSupply = permissions.includes("Supply Management");

  const showBackBtn = (hasInventory && hasSupply) || role === "manager";

  return (
    <div className="pageWrapper">
      <ToastContainer />
      {activeTab === null && (
        <div className={`backgroundFull ${loaded ? styles.visible : ""}`}>
          <div className={styles.bcgOverlay}>
            <div className={styles.backgroundContent}>
              <h2>Welcome to Inventory & Supply</h2>
              <p>Choose a section to get started</p>
              <div className={styles.tabs}>
                <button
                  className={styles.tabBtn}
                  onClick={() => changeTab("inventory")}
                >
                  <FontAwesomeIcon
                    icon={faBoxes}
                    className={styles.iconTabBtn}
                  />{" "}
                  Inventory Management
                </button>
                <button
                  className={styles.tabBtn}
                  onClick={() => changeTab("supply")}
                >
                  <FontAwesomeIcon
                    icon={faTruckLoading}
                    className={styles.iconTabBtn}
                  />{" "}
                  Supply Management
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={styles.tabContent}>
        {activeTab === "inventory" && (
          <section className="inventortSection">
            <h3 className={styles.inventortSectionTitle}>📦 Inventory Items</h3>
            <div className={styles.headerContainer}>
              <div className="headerButtons">
                <button
                  className={styles.addBtn}
                  onClick={() => setShowAddItemModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Item
                </button>
                {showBackBtn && (
                  <button
                    className={styles.backBtn}
                    onClick={() => changeTab(null)}
                  >
                    <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
                  </button>
                )}
              </div>
            </div>
            {loadingInventory ? (
              <div className={styles.loadingOverlay}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : (
              <>
                {filteredInventory.length === 0 ? (
                  <p className={styles.noResults}>
                    {searchQuery
                      ? `No inventory items found matching "${searchQuery}"`
                      : "No inventory items available"}
                  </p>
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
                      {filteredInventory.map((item) => (
                        <tr
                          key={item.id}
                          className={
                            item.threshold_level >= item.quantity
                              ? styles.warningRow
                              : ""
                          }
                        >
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.expiry_date}</td>
                          <td>{item.threshold_level}</td>
                          <td>
                            <button
                              className={styles.iconBtn}
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
                              <FontAwesomeIcon
                                icon={faEdit}
                                data-action="Edit"
                                title="Edit"
                              />
                            </button>
                            <button
                              className={styles.iconBtn}
                              onClick={() => handleDelete(item.id)}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                data-action="Delete"
                                title="Delete"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
            {showAddItemModal && (
              <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
                <div className={`${styles.modal} ${styles.slideUpModal}`}>
                  <h4>{editItem ? "Edit Item" : "Add New Item"}</h4>
                  <form onSubmit={handleAddItem}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Threshold"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      required
                    />
                    <div className={styles.modalActions}>
                      <button type="submit" className={styles.saveBtn}>
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowAddItemModal(false);
                          setEditItem(null);
                        }}
                        className={styles.cancelBtn}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "supply" && (
          <section className="supplySection">
            <h3 className={styles.supplySectionTitle}>📑 Supply Section</h3>
            <button className={styles.backBtn2} onClick={() => changeTab(null)}>
              <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
            </button>
            <div className={styles.cardGrid}>
              <div className={styles.card}>
                <h4>
                  <FontAwesomeIcon icon={faPaperPlane} /> Send Supply Request
                </h4>
                <p>
                  Request materials with specific quantities from suppliers.
                </p>
                <button
                  className={styles.cardBtn}
                  onClick={() => setShowRequestModal(true)}
                >
                  + New Request
                </button>
              </div>
              <div className={styles.card}>
                <h4>
                  <FontAwesomeIcon icon={faBell} /> Review Supply Offers
                </h4>
                <p>Check offers from suppliers and accept or reject them.</p>
                <button
                  className={styles.cardBtn}
                  onClick={() => changeTab("offers")}
                >
                  Go to Offers
                </button>
              </div>

              <div className={styles.card}>
                <h4>
                  <FontAwesomeIcon icon={faFileInvoiceDollar} /> Manage Purchase
                  Bill
                </h4>
                <p>
                  View past pirchase bill or create new ones for accepted supply
                  offers.
                </p>
                <button
                  className={styles.cardBtn}
                  onClick={() => changeTab("purchaseBills")}
                >
                  Manage Bills
                </button>
              </div>
              <div className={styles.card}>
                <h4>
                  <FontAwesomeIcon icon={faClockRotateLeft} /> Supply History
                </h4>
                <p>
                  View previous supply records or track new supply-related
                  activities.
                </p>
                <button
                  className={styles.cardBtn}
                  onClick={() => changeTab("supplyHistory")}
                >
                  Go to History
                </button>
              </div>
            </div>
          </section>
        )}

        {showRequestModal && (
          <div className={styles.overlayRequest}>
            <div className={styles.modalContainer}>
              <div className={styles.modalHeader}>📋 New Supply Request</div>

              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label>🏷️ Request Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.titleInput}
                    placeholder="e.g. Weekly Ingredient Request"
                    required
                  />
                </div>

                <div className={styles.searchSection}>
                  <label>🔍 Search Items:</label>
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      className={styles.searchInput}
                      placeholder="Search for items to add..."
                    />

                    {showSearchResults && searchResults.length > 0 && (
                      <div className={styles.searchResults}>
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            onMouseDown={() => handleItemClick(item)}
                            className={styles.searchItem}
                          >
                            <span>{item.name}</span>
                            <button type="button" className={styles.addItemBtn}>
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.selectedSection}>
                  <div className={styles.selectedHeader}>
                    <span>📦 Selected Items</span>
                    <span className={styles.itemCount}>
                      {selectedItems.length} items
                    </span>
                  </div>

                  <div className={styles.selectedItems}>
                    {selectedItems.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📦</div>
                        <div>No items selected</div>
                        <small>Use the search above to add items</small>
                      </div>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.id} className={styles.selectedItem}>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                          </div>

                          <div className={styles.quantityControls}>
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              className={styles.quantityBtn}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, e.target.value)
                              }
                              className={styles.quantityInput}
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              className={styles.quantityBtn}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 0)}
                              className={styles.removeBtn}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.formGroup}>
                  <label>👤 Select Supplier:</label>
                  <select
                    className={styles.selectInput}
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>🗒️ Notes (optional):</label>
                  <textarea
                    className={styles.requestTextArea}
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Additional instructions..."
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    onClick={handleSubmitSupplyRequest}
                    className={styles.requestSubmitBtn}
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className={styles.requestCancelBtn}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <section className="supplyOfferSection">
            <div className="supplyOfferHeader">
              <h3 className={styles.supplyOffersTitle}>📦 Supply Offers</h3>
              <button
                className={styles.backBtn3}
                onClick={() => changeTab("supply")}
              >
                <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
              </button>
            </div>
            {loadingOffer ? (
              <div className={styles.loadingOverlay}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : filteredOffer.length === 0 ? (
              <p className={styles.noResults}>
                {searchQuery
                  ? `No Offer found matching "${searchQuery}"`
                  : "No offers to display."}
              </p>
            ) : (
              <div className={`${styles.offerList} ${styles.fadeInOverlay}`}>
                {filteredOffer.map((offer) => (
                  <div key={offer.id} className={styles.offerCard}>
                    <h4 className={styles.offerTitle}>{offer.title}</h4>
                    <p>
                      <strong>Supplier:</strong> {offer.supplier}
                    </p>
                    <p>
                      <strong>Total Price:</strong> $
                      {offer.totalPrice.toFixed(2)}
                    </p>
                    <p>
                      <strong>Delivery Date:</strong> {offer.deliveryDate}
                    </p>
                    <p>
                      <strong>Note:</strong> {offer.note}
                    </p>
                    <div className={styles.offerItems}>
                      {offer.items.map((item, idx) => (
                        <div key={idx} className={styles.offerItem}>
                          • {item.name} - {item.quantity} - {item.unit} - $
                          {item.unitPrice}
                        </div>
                      ))}
                    </div>
                    <div className={styles.offerActions}>
                      {offer.status === "pending" ? (
                        <>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => handleAcceptOffer(offer.id)}
                          >
                            ✅ Accept
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => setRejectingOffer(offer)}
                          >
                            ❌ Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={`${styles.statusBadge} ${
                            offer.status === "accepted"
                              ? styles.statusApproved
                              : styles.statusRejected
                          }`}
                        >
                          {offer.status === "accepted"
                            ? "✅ Accepted"
                            : "❌ Rejected"}
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
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "purchaseBills" && (
          <section className="purchaseBillsSection">
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>
                  <span className={styles.historyIcon}>🧾</span>
                  Purchase Bills
                </h2>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.backBtn4}
                  onClick={() => changeTab("supply")}
                >
                  <FontAwesomeIcon icon={faArrowRotateBack} /> Back to Main
                </button>
                <button
                  className={styles.newBillBtn}
                  onClick={() => setShowBillModal(true)}
                >
                  + Create New Bill
                </button>
              </div>
            </div>

            {loadingBill ? (
              <div className={styles.loadingOverlay}>
                <p className={styles.emptyText}>Loading...</p>
              </div>
            ) : filteredBills.length === 0 ? (
              <p className={styles.noResults}>
                {searchQuery
                  ? `No Purchase Bill found matching "${searchQuery}"`
                  : "📭 No Purchase Bills yet."}
              </p>
            ) : (
              <table className={styles.billsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bill No</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill, index) => (
                    <tr key={bill.id}>
                      <td>{index + 1}</td>
                      <td>{bill.id}</td>
                      <td>{bill.date}</td>
                      <td>{bill.supplier}</td>
                      <td>
                        {bill.items.map((item, idx) => (
                          <div key={idx} className={styles.billItemRowData}>
                            {item.name}: {item.quantity} {item.unit} × $
                            {item.unitPrice} = ${item.quantity * item.unitPrice}
                          </div>
                        ))}
                      </td>
                      <td className={styles.billTotalPrice}>
                        ${bill.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {showBillModal && (
              <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
                <div className={`${styles.slideUpModal} ${styles.billModal}`}>
                  <h4 className={styles.billModalTitle}>
                    🧾 Create Purchase Bill
                  </h4>
                  <form onSubmit={handleSubmitBill}>
                    <label className={styles.inputLabel}>
                      📦 Select Approved Offer:
                    </label>
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

                    <label className={styles.inputLabel}>
                      📅 Purchase Date:
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.dateInput}
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      required
                    />

                    {selectedOfferId && (
                      <div className={styles.billDetails}>
                        <h5 className={styles.sectionSubTitle}>
                          Offer Details
                        </h5>
                        {approvedOffers
                          .find((o) => o.id.toString() === selectedOfferId)
                          .items.map((item, idx) => (
                            <div key={idx} className={styles.billItemRow}>
                              • {item.name}: {item.quantity} {item.unit} × $
                              {item.unitPrice} = $
                              {item.quantity * item.unitPrice}
                            </div>
                          ))}
                        <p className={styles.totalPrice}>
                          Total: $
                          {approvedOffers
                            .find((o) => o.id.toString() === selectedOfferId)
                            .totalPrice.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <div className={styles.billModalActions}>
                      <button type="submit" className={styles.billSaveBtn}>
                        Save Bill
                      </button>
                      <button
                        type="button"
                        className={styles.billCancelBtn}
                        onClick={() => {
                          setShowBillModal(false);
                          setSelectedOfferId("");
                          setBillDate("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "supplyHistory" && (
          <section className="supplyHistorySection">
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>
                  <span className={styles.historyIcon}>📋</span>
                  Supply History
                </h2>
                <p className={styles.pageSubtitle}>
                  View all past supply records
                </p>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={`${styles.actionButton} ${styles.backButton}`}
                  onClick={() => changeTab("supply")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Back to Main
                </button>
                <button
                  className={`${styles.actionButton} ${styles.refreshButton}`}
                  onClick={fetchSupplyHistory}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> Refresh
                </button>
              </div>
            </div>

            {loadingSupplyHistory ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading supply records...</p>
              </div>
            ) : filteredSupplyHistory.length === 0 ? (
              <p className={styles.noResults}>
                {searchQuery ? (
                  `No Offer found matching "${searchQuery}"`
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📭</div>
                    <h3>No Supply Records Found</h3>
                    <p>There are no historical supply records to display</p>
                  </div>
                )}
              </p>
            ) : (
              <div className={styles.recordsGrid}>
                {filteredSupplyHistory.map((record) => (
                  <div
                    key={record.id}
                    className={`${styles.recordCard} ${
                      record.type === "supply offer"
                        ? styles.offerCardRecord
                        : styles.requestCardRecord
                    }`}
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        <h3>#{String(record.id).padStart(3, "0")}</h3>
                        <p className={styles.recordTitle}>{record.title}</p>
                      </div>
                      <span
                        className={`${styles.statusBadgeRecord} ${
                          styles[record.status]
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </span>
                    </div>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>
                          {new Date(record.supplyDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faTag} />
                        <span>
                          {record.type === "supply offer" ? "Offer" : "Request"}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <FontAwesomeIcon icon={faDollarSign} />
                        <span>${record.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {expandedRecords === record.id && (
                      <div className={styles.expandedContent}>
                        <div className={styles.itemsSection}>
                          <h4>Items Details</h4>
                          <ul className={styles.itemsList}>
                            {record.items.map((item, idx) => (
                              <li key={idx}>
                                <span className={styles.itemNameRecord}>
                                  {item.name}
                                </span>
                                <span className={styles.itemQuantity}>
                                  {item.quantity} {item.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {record.status === "rejected" &&
                          record.rejectionReason && (
                            <div className={styles.rejectionSection}>
                              <h4>Rejection Reason</h4>
                              <p>{record.rejectionReason}</p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default InventorySupply;
