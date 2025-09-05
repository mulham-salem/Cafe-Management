import { useState, useEffect, useContext, useMemo } from "react";
import styles from "../styles/PromotionManagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faEdit,
  faPercentage,
  faCalendarAlt,
  faTags,
  faTimes,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from "axios";
import { SearchContext } from "./ManagerDashboard";
import { EmpSearchContext } from "../Employee/EmployeeHome";
import { usePermissions } from "../../context/PermissionsContext";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

const mockPromotions = [
  {
    id: 1,
    title: "Early Bird Special",
    discount_percentage: 20,
    start_date: "2023-11-01",
    end_date: "2023-11-30",
    description: "All coffee orders before 8AM",
    products: "Espresso, Americano, Latte, Cappuccino",
  },
  {
    id: 2,
    title: "Happy Hour",
    discount_percentage: 10,
    start_date: "2023-11-01",
    end_date: "2023-12-31",
    description: "3PM-5PM daily on selected drinks",
    products: "Iced Coffee, Cold Brew, Lemonade",
  },
  {
    id: 3,
    title: "Weekend Brunch",
    discount_percentage: 20,
    start_date: "2023-11-04",
    end_date: "2023-11-05",
    description: "With any large coffee purchase",
    products: "Croissant, Muffin, Danish",
  },
  {
    id: 4,
    title: "Student Discount",
    discount_percentage: 15,
    start_date: "2023-09-01",
    end_date: "2024-06-30",
    description: "Valid with student ID",
    products: "All drinks, All food items",
  },
  {
    id: 5,
    title: "Loyalty Reward",
    discount_percentage: 40,
    start_date: "2023-01-01",
    end_date: "2023-12-31",
    description: "After 10 stamps on loyalty card",
    products: "Any regular sized drink",
  },
  {
    id: 6,
    title: "Pumpkin Spice Season",
    discount_percentage: 10,
    start_date: "2023-10-01",
    end_date: "2023-11-15",
    description: "Special autumn flavors",
    products: "Pumpkin Spice Latte, Pumpkin Muffin",
  },
  {
    id: 7,
    title: "Takeaway Tuesday",
    discount_percentage: 95,
    start_date: "2023-11-07",
    end_date: "2023-11-07",
    description: "All takeaway orders",
    products: "Coffee, Sandwiches, Salads",
  },
  {
    id: 8,
    title: "New Product Launch",
    discount_percentage: 80,
    start_date: "2023-11-15",
    end_date: "2023-11-17",
    description: "Try our new winter special",
    products: "Peppermint Mocha, Gingerbread Cookie",
  },
  {
    id: 9,
    title: "Black Friday",
    discount_percentage: 50,
    start_date: "2023-11-24",
    end_date: "2023-11-24",
    description: "From opening until 10AM only",
    products: "All drinks, All bakery items",
  },
  {
    id: 10,
    title: "Christmas Countdown",
    discount_percentage: 30,
    start_date: "2023-12-01",
    end_date: "2023-12-24",
    description: "Different offer each day until Christmas",
    products: "Seasonal drinks, Holiday treats",
  },
];

const mockProducts = [
  { id: 1, name: "Espresso" },
  { id: 2, name: "Cappuccino" },
  { id: 3, name: "Latte" },
  { id: 4, name: "Mocha" },
  { id: 5, name: "Americano" },
  { id: 6, name: "Macchiato" },
  { id: 7, name: "Iced Coffee" },
  { id: 8, name: "Hot Chocolate" },
  { id: 9, name: "Green Tea" },
  { id: 10, name: "Croissant" },
];

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPromo, setEditPromo] = useState(null);

  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [productsList, setProductsList] = useState([]); // من API
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]); // المنتجات المختارة

  const [loading, setLoading] = useState(true);
  const { permissions, role } = usePermissions();

  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if (!role) return null;
    return (
      sessionStorage.getItem(`${role}Token`) ||
      localStorage.getItem(`${role}Token`)
    );
  }

  const token = getCurrentToken();
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
      const response = await axiosInstance.get("/admin/promotion");
      const formattedPromotions = response.data.promotions.map((promo) => ({
        ...promo,
        products: promo.products
          .map((p) => `${p.name} (x${p.quantity})`)
          .join(", "),
        productObjects: promo.products, // نخزن المنتجات كأوبجكتات للتعديل
      }));

      setPromotions(formattedPromotions);

      // استخرج المنتجات كلها
      setProductsList(response.data.products);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load promotions. mockData will be displayed");
      setPromotions(mockPromotions);
      setProductsList(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إضافة المنتج المختار مع الكمية
  const addProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = productsList.find(
      (p) => p.id === parseInt(selectedProduct)
    );
    if (!product) return;

    // إذا المنتج مضاف مسبقاً نحدث الكمية
    const existing = selectedProducts.find((p) => p.id === product.id);
    if (existing) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p
        )
      );
    } else {
      setSelectedProducts((prev) => [...prev, { ...product, quantity }]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  // 🔹 حذف المنتج
  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !discount ||
      !startDate ||
      !endDate ||
      selectedProducts.length === 0
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    const promoData = {
      title,
      discount_percentage: parseFloat(discount),
      start_date: startDate,
      end_date: endDate,
      description,
      products: selectedProducts.map((p) => ({
        product_id: p.id,
        quantity: p.quantity,
      })),
    };

    try {
      if (editPromo) {
        const response = await axiosInstance.put(
          `/admin/promotion/${editPromo.id}`,
          promoData
        );
        toast.success(response.data.message || "✅ Promotion updated");
      } else {
        const response = await axiosInstance.post(
          "/admin/promotion",
          promoData
        );
        toast.success(response.data.message || "✅ Promotion added");
      }
      fetchPromotions();
      clearForm();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach(([msg]) =>
          toast.error(msg)
        );
      } else {
        toast.error("Failed to save promotion.");
      }
    }
  };

  const handleDelete = async (id) => {
    const promo = promotions.find((p) => p.id === id);
    if (!promo) return;

    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>
            Are you sure you want to delete <strong>{promo.title}</strong>?
          </p>
          <div className="toast-buttons">
            <button
              onClick={async () => {
                try {
                  await axiosInstance.delete(`/admin/promotion/${id}`);
                  toast.success(`Promotion "${promo.title}" deleted`);
                  fetchPromotions();
                } catch (error) {
                  toast.error("Failed to delete promotion.");
                }
                closeToast();
              }}
            >
              Yes
            </button>
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
    setSelectedProducts(promo.productObjects || []);
    setShowModal(true);
  };

  const clearForm = () => {
    setTitle("");
    setDiscount("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setSelectedProduct("");
    setSelectedProducts([]); // مهم
    setEditPromo(null);
    setShowModal(false);
  };

  const managerContext = useContext(SearchContext);
  const empContext = useContext(EmpSearchContext);
  const context = role === "manager" ? managerContext : empContext;
  const { searchQuery, setSearchPlaceholder } = context;

  const filteredPromotions = useMemo(() => {
    return promotions.filter(
      (promo) =>
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
        <h2 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faGift} /> Promotion List
        </h2>
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
                <p>
                  <FontAwesomeIcon icon={faPercentage} />{" "}
                  {promo.discount_percentage}%
                </p>
                <p>
                  <FontAwesomeIcon icon={faCalendarAlt} /> {promo.start_date} ➜{" "}
                  {promo.end_date}
                </p>

                <p>
                  <strong>Products:</strong> {promo.products}
                </p>
                <p className={styles.desc}>{promo.description}</p>
                <div className={styles.cardActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => startEdit(promo)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(promo.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {showModal && (
        <div className={`${styles.overlay} ${styles.fadeInOverlay}`}>
          <SimpleBar className={`${styles.modal} ${styles.slideUpModal}`}>
            <h4>{editPromo ? "Edit Promotion" : "Add New Promotion"}</h4>
            <form onSubmit={(e) => handleSave(e, selectedProducts)}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Discount %"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
              />
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              {/* 🔹 اختيار المنتجات */}
              <div className={styles.productSelector}>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Select a Product</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
                <button type="button" onClick={addProduct}>
                  Add
                </button>
              </div>

              {/* 🔹 جدول المنتجات المختارة */}
              {selectedProducts.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.productsTable}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.quantity}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeProduct(p.id)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={clearForm}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            </form>
          </SimpleBar>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
