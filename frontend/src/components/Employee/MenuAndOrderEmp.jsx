import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/MenuAndOrderEmp.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faMinus,
  faPlus,
  faBars,
  faThumbsUp,
  faFire,
  faCalendarAlt,
  faGift,
  faCrown,
  faTruck,
  faClock,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { EmpSearchContext } from "../Employee/EmployeeHome";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { motion } from "framer-motion";

const mockMenu = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 8.99,
    category: "snacks",
    imageUrl: "https://example.com/images/burger.jpg",
    available: true,
  },
  {
    id: 2,
    name: "Mojito",
    description: "Refreshing mint lime cocktail with rum",
    price: 7.5,
    category: "drinks",
    imageUrl: "https://example.com/images/mojito.jpg",
    available: true,
  },
  {
    id: 3,
    name: "French Fries",
    description: "Crispy golden fries with sea salt",
    price: 3.99,
    category: "snacks",
    imageUrl: "https://example.com/images/fries.jpg",
    available: true,
  },
  {
    id: 4,
    name: "Iced Coffee",
    description: "Cold brewed coffee with milk and ice",
    price: 4.25,
    category: "drinks",
    imageUrl: "https://example.com/images/iced-coffee.jpg",
    available: true,
  },
  {
    id: 5,
    name: "Chicken Wings",
    description: "Spicy buffalo wings with blue cheese dip",
    price: 6.75,
    category: "snacks",
    imageUrl: "https://example.com/images/wings.jpg",
    available: true,
  },
  {
    id: 6,
    name: "Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 3.5,
    category: "drinks",
    imageUrl: "https://example.com/images/orange-juice.jpg",
    available: true,
  },
  {
    id: 7,
    name: "Nachos",
    description: "Tortilla chips with melted cheese and jalapeños",
    price: 5.99,
    category: "snacks",
    imageUrl: "https://example.com/images/nachos.jpg",
    available: true,
  },
  {
    id: 8,
    name: "Craft Beer",
    description: "Local IPA with citrus notes",
    price: 6.0,
    category: "drinks",
    imageUrl: "https://example.com/images/beer.jpg",
    available: true,
  },
  {
    id: 9,
    name: "Caesar Salad",
    description: "Romaine lettuce with croutons and parmesan",
    price: 7.25,
    category: "snacks",
    imageUrl: "https://example.com/images/salad.jpg",
    available: true,
  },
  {
    id: 10,
    name: "Mineral Water",
    description: "Sparkling water with lemon slice",
    price: 2.0,
    category: "drinks",
    imageUrl: "https://example.com/images/water.jpg",
    available: true,
  },
];

const mockPromo = [
  {
    id: 1,
    title: "Summer Drinks Discount",
    discount: "20%",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    description:
      "Cool down this summer with refreshing drinks at a special discount!",
    products: ["Craft Beer", "Chicken Wings", "French Fries"],
  },
  {
    id: 2,
    title: "Weekend Pastry Deal",
    discount: "15%",
    startDate: "2025-08-15",
    endDate: "2025-09-01",
    description:
      "Enjoy our freshly baked pastries with a sweet weekend discount.",
    products: ["Croissant", "Cheesecake", "Chocolate Muffin"],
  },
  {
    id: 3,
    title: "Breakfast Combo Offer",
    discount: "30%",
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    description:
      "Start your day right with our complete breakfast combo at a great price!",
    products: ["Breakfast Sandwich", "Fresh Orange Juice", "Yogurt Parfait"],
  },
  {
    id: 4,
    title: "Happy Hour Special",
    discount: "25%",
    startDate: "2025-08-20",
    endDate: "2025-09-15",
    description:
      "Join us during happy hours for exclusive discounts on select beverages.",
    products: ["Craft Beer", "House Wine", "Signature Cocktail"],
  },
  {
    id: 5,
    title: "Family Meal Deal",
    discount: "35%",
    startDate: "2025-09-10",
    endDate: "2025-10-10",
    description:
      "Perfect for family gatherings - enjoy a complete meal at a special price.",
    products: ["Family Pizza", "Garlic Bread", "Caesar Salad", "Soft Drinks"],
  },
  {
    id: 6,
    title: "Coffee Lovers Bundle",
    discount: "40%",
    startDate: "2025-08-25",
    endDate: "2025-09-25",
    description:
      "For true coffee enthusiasts - get your favorite blends at an amazing discount.",
    products: ["Espresso", "Cappuccino", "Americano", "Flat White"],
  },
  {
    id: 7,
    title: "Student Discount",
    discount: "15%",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    description:
      "Exclusive discount for students with valid ID on all menu items.",
    products: ["All Menu Items"],
  },
  {
    id: 8,
    title: "Lunch Time Promo",
    discount: "20%",
    startDate: "2025-08-15",
    endDate: "2025-10-15",
    description: "Special lunch offers available from 12 PM to 3 PM daily.",
    products: ["Sandwich Combo", "Soup of the Day", "Fresh Salad"],
  },
  {
    id: 9,
    title: "Summer Drinks Discount",
    discount: "20%",
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    description:
      "Cool down this summer with refreshing drinks at a special discount!",
    products: ["Iced Latte", "Cold Brew", "Mocha Frappe"],
  },
  {
    id: 10,
    title: "Weekend Pastry Deal",
    discount: "15%",
    startDate: "2025-08-15",
    endDate: "2025-09-01",
    description:
      "Enjoy our freshly baked pastries with a sweet weekend discount.",
    products: ["Croissant", "Cheesecake", "Chocolate Muffin"],
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
      mass: 0.6,
      duration: 0.6,
    },
  },
};

/* Divider reveal variant (scaleX pop) */
const dividerVariants = {
  hidden: { opacity: 0, scaleX: 0.0, transformOrigin: "left center" },
  visible: {
    opacity: 1,
    scaleX: 1,
    transformOrigin: "left center",
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const MenuAndOrderEmp = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Menu & Orders";
  }, []);

  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderItems, setOrderItems] = useState([]);
  const [note, setNote] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("dineIn");
  const [whenType, setWhenType] = useState("asap");
  const [scheduledTime, setScheduledTime] = useState("");

  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:8000/api";
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers.put["Content-Type"] = "application/json";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // const response = await axios.get('/user/employee/menuitem');
        // if (response.data.data) {
        //   setMenu(response.data.data.map(item => ({
        if (mockMenu) {
          setMenu(
            mockMenu.map((item) => ({
              ...item,
              id: item.id,
              imageUrl: item.image,
              category: item.category,
              available: item.available,
            }))
          );
          setFilteredMenu(
            mockMenu.map((item) => ({
              ...item,
              id: item.id,
              imageUrl: item.image,
              category: item.category,
              available: item.available,
            }))
          );

          // setFilteredMenu(response.data.data.map(item => ({
          //   ...item,
          //   id: item.id,
          //   imageUrl: item.image,
          //   category: item.category,
          //   available: item.available
          // })));
        } else {
          toast.info(response.data.message);
          setMenu([]);
          setFilteredMenu([]);
        }
      } catch (error) {
        toast.error("Failed to load menu items.");
        console.error("Error fetching menu items:", error);
        setMenu([]);
        setFilteredMenu([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filterMenu = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredMenu(menu);
    } else {
      const filtered = menu.filter((item) => {
        return item.category === category.toLowerCase();
      });
      setFilteredMenu(filtered);
    }
  };

  const { searchQuery, setSearchPlaceholder } = useContext(EmpSearchContext);
  setSearchPlaceholder("Search by item name...");

  const filteredMenuItem = useMemo(() => {
    return filteredMenu.filter(
      (item) => searchQuery === "" || item.name.includes(searchQuery)
    );
  }, [filteredMenu, searchQuery]);

  const addToOrder = (item) => {
    if (!item.available) {
      toast.error(`${item.name} is not available!`);
      return;
    }

    setOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (orderItem) => orderItem.id === item.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
          price:
            (updatedItems[existingItemIndex].quantity + 1) *
            updatedItems[existingItemIndex].unitPrice,
        };
        return updatedItems;
      } else {
        return [
          ...prevItems,
          { ...item, quantity: 1, unitPrice: item.price, price: item.price },
        ];
      }
    });

    const cartIcon = document.querySelector(`.${styles.cartIcon}`);
    const target = cartIcon.getBoundingClientRect();
    const source = document
      .getElementById(`menu-item-${item.id}`)
      .getBoundingClientRect();

    const flying = document.createElement("div");
    flying.className = styles.flyingImage;
    flying.style.backgroundImage = `url(/${item.imageUrl})`;
    flying.style.left = `${source.left}px`;
    flying.style.top = `${source.top}px`;
    document.body.appendChild(flying);

    setTimeout(() => {
      flying.style.left = `${target.left}px`;
      flying.style.top = `${target.top}px`;
      flying.style.transform = "scale(0.2)";
      flying.style.opacity = "0.1";
    }, 100);

    setTimeout(() => {
      flying.remove();
    }, 800);

    toast.success(`${item.name} added to order`);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to create an order.");
      return;
    }

    if (!fulfillmentMethod) {
      toast.error("Please select a receive method.");
      return;
    }

    if (whenType === "schedule" && !scheduledTime) {
      toast.error("Please select a scheduled time.");
      return;
    }

    const itemsForBackend = orderItems.map((item) => ({
      menuItem_id: item.id,
      quantity: item.quantity,
      note: item.note,
    }));

    try {
      let toastMessage;
      if (editMode && orderToEdit) {
        const response = await axios.put(
          `/user/employee/orders/${orderToEdit.id}/edit`,
          {
            items: itemsForBackend,
            note: note.trim(),
            fulfillmentMethod,
            whenType,
            scheduledTime: whenType === "schedule" ? scheduledTime : null,
          }
        );
        toastMessage = response.data.message;
      } else {
        const response = await axios.post("/user/employee/orders/create", {
          items: itemsForBackend,
          note: note.trim(),
          fulfillmentMethod,
          whenType,
          scheduledTime: whenType === "schedule" ? scheduledTime : null,
        });
        toastMessage = response.data.message;
      }

      toast.success(toastMessage);
      setOrderItems([]);
      setNote("");
      setShowOverlay(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create order.");
      }
      console.error("Error creating order:", error);
    }
  };

  const location = useLocation();
  const editMode = location.state?.editMode || false;
  const orderToEdit = location.state?.orderToEdit || null;

  useEffect(() => {
    if (editMode && orderToEdit) {
      const fetchOrderForEdit = async () => {
        try {
          const response = await axios.get(
            `/user/employee/orders/${orderToEdit.id}/edit`
          );
          const fetchedOrder = response.data;

          const formattedItems = fetchedOrder.items.map((item) => ({
            id: item.menuItem_id,
            name: item.name,
            price: item.price,
            unitPrice: item.price / item.quantity,
            quantity: item.quantity,
            imageUrl: item.image,
            available: true,
          }));

          setOrderItems(formattedItems || []);
          setNote(fetchedOrder.note || "");
          setFulfillmentMethod(fetchedOrder.receiptMethod || "DineIn"); 
          setScheduledTime(fetchedOrder.receiptTime || "ASAP");
          setShowOverlay(true);
        } catch (error) {
          toast.error("Failed to load order for editing.");
          console.error("Error fetching order for edit:", error);
        }
      };
      fetchOrderForEdit();
    }
  }, [editMode, orderToEdit]);

  const increaseQty = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemToUpdate = updatedItems[index];

      updatedItems[index] = {
        ...itemToUpdate,
        quantity: itemToUpdate.quantity + 1,
        price: (itemToUpdate.quantity + 1) * itemToUpdate.unitPrice,
      };
      return updatedItems;
    });
  };

  const decreaseQty = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemToUpdate = updatedItems[index];

      if (itemToUpdate.quantity > 1) {
        updatedItems[index] = {
          ...itemToUpdate,
          quantity: itemToUpdate.quantity - 1,
          price: (itemToUpdate.quantity - 1) * itemToUpdate.unitPrice,
        };
      } else {
        updatedItems.splice(index, 1);
      }
      return updatedItems;
    });
  };

  const [activeSection, setActiveSection] = useState("menu-section");
  const scrollToSection = (id) => {
    if (showOverlay) return;
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const [offers, setOffers] = useState([]);
  // fetch promotions
  async function fetchOffers() {
    try {
      const res = await axios.get("/api/promotions", { withCredentials: true });
      setOffers(res.data);
      toast.success("Promotions loaded successfully!");
    } catch (error) {
      console.error(error);
      setOffers(mockPromo);
      //toast.error("Failed to fetch promotions. Showing demo data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  // Helper function to format dates
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleUseOffer = (offer) => {
    if (offer.products && offer.products.length > 0) {
      // التأكد من أن هناك منتجات في العرض
      let itemsAddedCount = 0;

      // حلقة تكرارية على جميع المنتجات في العرض
      offer.products.forEach((productName) => {
        // البحث عن العنصر المقابل في قائمة المنيو
        const correspondingMenuItem = menu.find(
          (item) => item.name === productName
        );

        if (correspondingMenuItem) {
          // تطبيق تأثير الطيران وإضافة العنصر للسلة
          const cartIcon = document.querySelector(`.${styles.cartIcon}`);
          const target = cartIcon.getBoundingClientRect();

          // استخدام id كرت العرض الترويجي كمصدر
          const source = document
            .getElementById(`promo-card-${offer.id}`)
            .getBoundingClientRect();

          const flying = document.createElement("div");
          flying.className = styles.flyingImage;
          flying.style.backgroundImage = `url(/${correspondingMenuItem.imageUrl})`;
          flying.style.left = `${source.left}px`;
          flying.style.top = `${source.top}px`;
          document.body.appendChild(flying);

          // تأثير الطيران لكل عنصر
          setTimeout(() => {
            flying.style.left = `${target.left}px`;
            flying.style.top = `${target.top}px`;
            flying.style.transform = "scale(0.2)";
            flying.style.opacity = "0.1";
          }, 100);

          setTimeout(() => {
            flying.remove();
          }, 800);

          // إضافة العنصر إلى السلة
          addToOrder(correspondingMenuItem);
          itemsAddedCount++;
        } else {
          toast.error(
            `Could not find the product '${productName}' in the menu.`
          );
        }
      });

      if (itemsAddedCount > 0) {
        toast.success(
          `${itemsAddedCount} items from the '${offer.title}' promotion have been added to your order!`
        );
      }
    } else {
      toast.error("This promotion doesn't specify any products.");
    }
  };

  const [bestSellers, setBestSellers] = useState(mockMenu);

  useEffect(() => {
    // كود لجلب البيانات الأكثر مبيعًا من API
    const fetchBestSellers = async () => {
      try {
        // const response = await fetch("/api/bestsellers");
        // const data = await response.json();
        // setBestSellers(data);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        //toast.error("Error fetching best sellers data");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  function generateAvailableSlots() {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = 9; // من 9 الصبح
    const endHour = 22; // فرضاً لحد 10 بالليل

    for (let hour = startHour; hour <= endHour; hour++) {
      // ما نحط إلا الساعات يلي لسا ما اجت
      if (hour > currentHour) {
        // تحويل من نظام 24 ساعة إلى نظام 12 ساعة
        let hour12 = hour % 12;
        if (hour12 === 0) hour12 = 12; // الساعة 12 بتكون 12 وليس 0
        const period = hour >= 12 ? "PM" : "AM";
        const time24 = `${hour.toString().padStart(2, "0")}:00`;
        const time12 = `${hour12}:00 ${period}`;

        slots.push({ time24, time12 });
      }
    }

    return slots;
  }

  useEffect(() => {
    setAvailableSlots(generateAvailableSlots());
  }, []);

  return (
    <SimpleBar
      ref={containerRef}
      className={`${styles.menuOrdersPage} ${
        isScrolled ? styles.scrolled : ""
      }`}
    >
      <div className={styles.menuHero}>
        <div className={styles.overlay}>
          <h1 className={styles.menuTitle}>DISCOVER OUR MENU</h1>
          <p className={styles.menuSubtitle}>
            Explore the finest drinks & snacks made just for you.
          </p>
        </div>
      </div>

      <div className={styles.navWrapper}>
        <button
          onClick={() => scrollToSection("menu-section")}
          className={
            activeSection === "menu-section" ? styles.activeNavButton : ""
          }
          aria-pressed={activeSection === "menu-section"}
        >
          <span className={styles.btnIcon}>
            <FontAwesomeIcon icon={faBars} />
          </span>
          Menu List
        </button>
        <button
          onClick={() => scrollToSection("promotions-section")}
          className={
            activeSection === "promotions-section" ? styles.activeNavButton : ""
          }
          aria-pressed={activeSection === "promotions-section"}
        >
          <span className={styles.btnIcon}>
            <FontAwesomeIcon icon={faFire} />
          </span>
          Promotions
        </button>
        <button
          onClick={() => scrollToSection("bestsellers-section")}
          className={
            activeSection === "bestsellers-section"
              ? styles.activeNavButton
              : ""
          }
          aria-pressed={activeSection === "bestsellers-section"}
        >
          <span className={styles.btnIcon}>
            <FontAwesomeIcon icon={faThumbsUp} />
          </span>
          Best Sellers
        </button>
      </div>

      <div className={styles.cartButtonWrapper}>
        <div
          className={styles.cartIcon}
          onClick={(e) => {
            e.stopPropagation(); // منع انتشار الحدث
            e.preventDefault(); // منع السلوك الافتراضي
            setShowOverlay(true);
          }}
        >
          🛒 {orderItems.length}
        </div>
      </div>

      {showOverlay && (
        <div
          className={styles.overlayForm}
          onClick={() => setShowOverlay(false)}
        >
          <div
            className={styles.formContainer}
            onClick={(e) => e.stopPropagation()} // منع الإغلاق عند النقر داخل الفورم
          >
            <div class={styles.formHeader}>
              <h2>Your Order</h2>
            </div>
            {/* Order Items */}
            {orderItems.map((item, index) => (
              <div key={index} className={`${styles.orderItemPreview} ${index === orderItems.length - 1 ? styles.lastItem: ''}`}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQuantity}>× {item.quantity}</span>
                </div>
                <div className={styles.itemPriceActions}>
                  <strong className={styles.itemPrice}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </strong>
                  {editMode && (
                    <div className={styles.editQty}>
                      <button onClick={() => decreaseQty(index)}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <button onClick={() => increaseQty(index)}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Order Total */}
            <div className={styles.orderTotal}>
              <div className={styles.totalLine}></div>
              <div className={styles.totalContainer}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>
                  $
                  {orderItems
                    .reduce(
                      (total, item) =>
                        total + parseFloat(item.price) * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
            </div>
            {/* ✅ Receive Method */}
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                <FontAwesomeIcon icon={faTruck} className={styles.fieldIcon} />
                Receive Method:
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="fulfillmentMethod"
                    value="DineIn"
                    checked={fulfillmentMethod === "DineIn"}
                    onChange={(e) => setFulfillmentMethod(e.target.value)}
                  />
                  DineIn
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="fulfillmentMethod"
                    value="Takeaway"
                    checked={fulfillmentMethod === "Takeaway"}
                    onChange={(e) => setFulfillmentMethod(e.target.value)}
                  />
                  Takeaway
                </label>
              </div>
            </div>

            {/* ✅ Receipt Time */}
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                <FontAwesomeIcon icon={faClock} className={styles.fieldIcon} />
                Receipt Time:
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="whenType"
                    value="ASAP"
                    checked={whenType === "ASAP"}
                    onChange={() => {
                      setWhenType("ASAP");
                    }}
                  />
                  <span className={styles.radioCustom}></span>
                  ASAP
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="whenType"
                    value="Schedule"
                    checked={whenType === "Schedule"}
                    onChange={() => setWhenType("Schedule")}
                  />
                  <span className={styles.radioCustom}></span>
                  Schedule
                </label>
              </div>

              {whenType === "Schedule" && (
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={styles.timeSelect}
                >
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                      <option key={index} value={slot.time24}>
                        {slot.time12}
                      </option>
                    ))
                  ) : (
                    <option disabled>No available slots</option>
                  )}
                </select>
              )}
            </div>

            {/* Note Field */}
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                <FontAwesomeIcon
                  icon={faStickyNote}
                  className={styles.fieldIcon}
                />
                Add a note (optional):
              </label>
              <textarea
                placeholder="Any special requests or instructions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={styles.noteTextarea}
              />
            </div>
            {/* Form Actions */}
            <div className={styles.formActions}>
              <button className={styles.confirmBtn} onClick={handleCreateOrder}>
                {editMode ? "Update Order" : "Confirm Order"} • $
                {orderItems
                  .reduce(
                    (total, item) =>
                      total + parseFloat(item.price) * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowOverlay(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.section
        id="menu-section"
        className={styles.section}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.18 }} // triggers when 18% visible, re-triggers on scroll in/out
      >
        <h2 className={styles.sectionTitle}>
          <span>
            <FontAwesomeIcon icon={faBars} />
          </span>
          Menu List
        </h2>
        {filteredMenuItem.length > 0 && (
          <div className={styles.menuTabs}>
            <button
              onClick={() => filterMenu("All")}
              className={selectedCategory === "All" ? styles.active : ""}
            >
              All
            </button>
            <button
              onClick={() => filterMenu("Drinks")}
              className={selectedCategory === "Drinks" ? styles.active : ""}
            >
              Drinks
            </button>
            <button
              onClick={() => filterMenu("Snacks")}
              className={selectedCategory === "Snacks" ? styles.active : ""}
            >
              Snacks
            </button>
          </div>
        )}
        <div className={styles.menuContent}>
          {loading ? (
            <div className={styles.loadingSpinner}></div>
          ) : filteredMenuItem.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {searchQuery
                  ? `No menu item match "${searchQuery}"`
                  : "No menu items available right now."}
              </p>
            </div>
          ) : (
            <div className={styles.menuGrid}>
              {filteredMenuItem.map((item) => (
                <div
                  className={styles.menuCard}
                  key={item.id}
                  id={`menu-item-${item.id}`}
                >
                  <img src={`/${item.imageUrl}`} alt={item.name} />
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className={styles.cardFooter}>
                    <span>${parseFloat(item.price).toFixed(2)}</span>
                    {!item.available && (
                      <span className={styles.notAvailable}>❌</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToOrder(item)}
                    disabled={!item.available}
                  >
                    <FontAwesomeIcon icon={faCartPlus} /> Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.div
        className={styles.sectionDivider}
        variants={dividerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        <div className={styles.shimmer} />
      </motion.div>

      <motion.section
        id="promotions-section"
        className={styles.section}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.18 }}
      >
        <h2 className={styles.sectionTitle}>
          <span>
            <FontAwesomeIcon icon={faFire} />
          </span>
          Active Promotions
        </h2>
        {loading ? (
          <div className={styles.loadingSpinner}></div>
        ) : offers.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyPromo}>No promotions available</p>
            <p className={styles.emptySubtext}>Please check back later</p>
          </div>
        ) : (
          <div className={styles.promoCardsGrid}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={styles.promoCard}
                id={`promo-card-${offer.id}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.discountBadge}>{offer.discount}</div>
                  <div className={styles.ribbon}>
                    <FontAwesomeIcon
                      icon={faCrown}
                      className={styles.crownIcon}
                    />
                    Exclusive
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{offer.title}</h3>
                  <div className={styles.dateRange}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className={styles.calendarIcon}
                    />
                    <span>
                      {formatDate(offer.startDate)} -{" "}
                      {formatDate(offer.endDate)}
                    </span>
                  </div>
                  <p className={styles.description}>{offer.description}</p>

                  <div className={styles.products}>
                    <h4 className={styles.productsTitle}>
                      <FontAwesomeIcon
                        icon={faGift}
                        className={styles.giftIcon}
                      />
                      Included Products
                    </h4>
                    <ul className={styles.productsList}>
                      {offer.products.map((product, index) => (
                        <li key={index} className={styles.productItem}>
                          {product}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={styles.promoCardFooter}>
                  <button
                    className={styles.ctaButton}
                    onClick={() => handleUseOffer(offer)}
                  >
                    Use Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.div
        className={styles.sectionDivider}
        variants={dividerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        <div className={styles.shimmer} />
      </motion.div>

      <motion.section
        id="bestsellers-section"
        className={styles.section}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.18 }}
      >
        <h2 className={styles.sectionTitle}>
          <span>
            <FontAwesomeIcon icon={faThumbsUp} />
          </span>
          Best-Selling Items
        </h2>

        {loading ? (
          <div className={styles.loadingSpinner}></div>
        ) : bestSellers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No best-selling items available right now.</p>
          </div>
        ) : (
          <div className={styles.menuGrid}>
            {bestSellers.map((item, index) => (
              <div
                className={`${styles.menuCard} ${styles.bestsellerCard}`}
                key={item.id}
                id={`bestseller-item-${item.id}`}
              >
                <div className={styles.bestsellerBadge}>
                  #{index + 1} Best Seller
                </div>
                <img src={`/${item.imageUrl}`} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span>${parseFloat(item.price).toFixed(2)}</span>
                  {!item.available && (
                    <span className={styles.notAvailable}>❌</span>
                  )}
                </div>
                <button
                  onClick={() => addToOrder(item)}
                  disabled={!item.available}
                >
                  <FontAwesomeIcon icon={faCartPlus} /> Add to Order
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </SimpleBar>
  );
};

export default MenuAndOrderEmp;
