import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/MenuAndOrder.module.css";
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
  faEllipsisV,
  faHeart,
  faMagic,
  faSortAmountDownAlt,
  faRotate,
  faUndo,
  faTimes,
  faTruck,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faMugHot,
} from "@fortawesome/free-solid-svg-icons";
import { SparkleIcon } from "lucide-react";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { CusSearchContext } from "./CustomerHome";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { motion, AnimatePresence } from "framer-motion";

const mockMenu = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 8.99,
    category: "snacks",
    imageUrl: "Snacks/turkey-sandwich.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 2,
    name: "Mojito",
    description: "Refreshing mint lime cocktail with rum",
    price: 7.5,
    category: "drinks",
    imageUrl: "Drinks/Chocolate-Milkshake.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 3,
    name: "French Fries",
    description: "Crispy golden fries with sea salt",
    price: 3.99,
    category: "snacks",
    imageUrl: "https://example.com/images/fries.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 4,
    name: "Iced Coffee",
    description: "Cold brewed coffee with milk and ice",
    price: 4.25,
    category: "drinks",
    imageUrl: "https://example.com/images/iced-coffee.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 5,
    name: "Chicken Wings",
    description: "Spicy buffalo wings with blue cheese dip",
    price: 6.75,
    category: "snacks",
    imageUrl: "https://example.com/images/wings.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 6,
    name: "Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 3.5,
    category: "drinks",
    imageUrl: "https://example.com/images/orange-juice.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 7,
    name: "Nachos",
    description: "Tortilla chips with melted cheese and jalapeños",
    price: 5.99,
    category: "snacks",
    imageUrl: "https://example.com/images/nachos.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 8,
    name: "Craft Beer",
    description: "Local IPA with citrus notes",
    price: 6.0,
    category: "drinks",
    imageUrl: "https://example.com/images/beer.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 9,
    name: "Caesar Salad",
    description: "Romaine lettuce with croutons and parmesan",
    price: 7.25,
    category: "snacks",
    imageUrl: "https://example.com/images/salad.jpg",
    available: true,
    isFavorite: false,
  },
  {
    id: 10,
    name: "Mineral Water",
    description: "Sparkling water with lemon slice",
    price: 2.0,
    category: "drinks",
    imageUrl: "https://example.com/images/water.jpg",
    available: true,
    isFavorite: false,
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

const dividerVariants = {
  hidden: { opacity: 0, scaleX: 0.0, transformOrigin: "left center" },
  visible: {
    opacity: 1,
    scaleX: 1,
    transformOrigin: "left center",
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const MenuAndOrder = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Menu & Orders";
  }, []);

  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderItems, setOrderItems] = useState([]);
  const [note, setNote] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef(null);
  const [loadingFav, setLoadingFav] = useState(false);
  const [burstKey, setBurstKey] = useState(0); // re-trigger particle burst
  const cardRef = useRef(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const [view, setView] = useState("menu");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("dineIn"); // dineIn | takeaway | delivery
  const [whenType, setWhenType] = useState("asap"); // asap | schedule
  const [scheduledTime, setScheduledTime] = useState(""); // الوقت المجدول
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    city: "",
    phone: "",
  });
  const [deliveryFee, setDeliveryFee] = useState(0); // كلفة التوصيل (UC-51)
  const [etaText, setEtaText] = useState("N/A");

  const token =
    sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:8000/api";
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers.put["Content-Type"] = "application/json";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        //const response = await axios.get("/user/customer/menuitem");
        // if (response.data.data) {
        //   setMenu(
        //     response.data.data.map((item) => ({
        //       ...item,
        //       id: item.id,
        //       imageUrl: item.image,
        //       category: item.category,
        //       available: item.available,
        //       isFavorite: item.isFavorite,
        //     }))
        //   );
        //   setFilteredMenu(
        //     response.data.data.map((item) => ({
        //       ...item,
        //       id: item.id,
        //       imageUrl: item.image,
        //       category: item.category,
        //       available: item.available,
        //       isFavorite: item.isFavorite,
        //     }))
        //   );
          if (mockMenu) {
            setMenu(
              mockMenu.map((item) => ({
                ...item,
                id: item.id,
                imageUrl: item.imageUrl,
                category: item.category,
                available: item.available,
                isFavorite: item.isFavorite,
              }))
            );
            setFilteredMenu(
              mockMenu.map((item) => ({
                ...item,
                id: item.id,
                imageUrl: item.imageUrl,
                category: item.category,
                available: item.available,
                isFavorite: item.isFavorite,
              }))
            );
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
        setLoadingMenu(false);
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

  const { searchQuery, setSearchPlaceholder } = useContext(CusSearchContext);
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

    // validation for delivery info
    if (fulfillmentMethod === "delivery") {
      if (!deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.phone) {
        toast.error("Please provide full delivery information.");
        return;
      }
    }

    if (whenType === "schedule" && !scheduledTime) {
      toast.error("Please select a scheduled time.");
      return;
    }

    const itemsForBackend = orderItems.map((item) => ({
      menuItem_id: item.id,
      quantity: item.quantity,
    }));

    try {
      let toastMessage;
      if (fulfillmentMethod === "delivery") {
        try {
          const estimateRes = await axios.post(
            "/user/customer/orders/estimate",
            {
              items: itemsForBackend,
              address: deliveryInfo.address,
              city: deliveryInfo.city,
              phone: deliveryInfo.phone,
            }
          );

          if (estimateRes.data.success) {
            setDeliveryFee(estimateRes.data.deliveryFee || 0);
            setEtaText(
              estimateRes.data.eta
                ? new Date(estimateRes.data.eta).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"
            );
          } else {
            toast.error("Delivery is not available for your address.");
            return;
          }
        } catch (e) {
          toast.error("Could not fetch delivery estimate.");
          return;
        }
      }

      if (editMode && orderToEdit) {
        const response = await axios.put(
          `/user/customer/orders/${orderToEdit.id}/edit`,
          {
            items: itemsForBackend,
            note: note.trim(),
            fulfillmentMethod,
            deliveryInfo:
              fulfillmentMethod === "delivery" ? deliveryInfo : null,
            whenType,
            scheduledTime: whenType === "schedule" ? scheduledTime : null,
          }
        );
        toastMessage = response.data.message;
      } else {
        const response = await axios.post("/user/customer/orders/create", {
          items: itemsForBackend,
          note: note.trim(),
          fulfillmentMethod,
          deliveryInfo: fulfillmentMethod === "delivery" ? deliveryInfo : null,
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
            `/user/customer/orders/${orderToEdit.id}/edit`
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

          // إذا طريقة الاستلام Delivery، نضبط بيانات التوصيل
          if (fetchedOrder.receiptMethod === "Delivery") {
            setDeliveryInfo({
              address: fetchedOrder.deliveryInfo?.address || "",
              city: fetchedOrder.deliveryInfo?.city || "",
              phone: fetchedOrder.deliveryInfo?.phone || "",
            });
            setDeliveryFee(fetchedOrder.deliveryFee || 0);
            setEtaText(fetchedOrder.etaText || "N/A");
          } else {
            // لو مش Delivery نعيد القيم الافتراضية
            setDeliveryInfo({ address: "", city: "", phone: "" });
            setDeliveryFee(0);
            setEtaText("N/A");
          }

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
      setLoadingPromo(false);
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
    const fetchBestSellers = async () => {
      try {
        // const response = await fetch("/api/bestsellers");
        // const data = await response.json();
        // setBestSellers(data);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        //toast.error("Error fetching best sellers data");
      } finally {
        setLoadingBest(false);
      }
    };

    fetchBestSellers();
  }, []);

  // API call: toggle favorite (optimistic UI)
  async function toggleFavoriteApi(itemId, newState) {
    const payload = { item_id: itemId };
    if (newState)
      return axios.post("/api/favorites", payload, { withCredentials: true });
    else return axios.delete(`/api/favorites/${itemId}`);
  }

  const handleFavClick = async (e, itemId) => {
    e.stopPropagation();
    if (loadingFav) return;

    const targetItem = menu.find((it) => it.id === itemId);
    if (!targetItem) return;

    const prev = targetItem.isFavorite;
    const newState = !prev;

    // optimistic UI
    setLoadingFav(true);

    // If activating -> trigger burst animation
    if (newState) {
      // increment key to retrigger AnimatePresence/particles
      setBurstKey((k) => k + 1);
    }

    try {
      // await toggleFavoriteApi(item.id, newState);
      setMenu((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, isFavorite: newState } : it
        )
      );
      setFilteredMenu((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, isFavorite: newState } : it
        )
      );
      toast.success(newState ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      // revert on error
      console.error("fav error:", err);
      toast.error("Failed to update favorite. Try again.", {});
    } finally {
      setLoadingFav(false);
    }
  };

  // star scale/boom animation variants
  const starTapVariants = {
    idle: { scale: 1, rotate: 0 },
    active: {
      scale: [0, 1.2, 0.8, 1],
      rotate: [0, 90, -45, 0],
      transition: {
        duration: 0.8,
        times: [0, 0.3, 0.7, 1],
        ease: "circOut",
      },
    },
  };

  // create burst particles with angles
  const particleCount = 18;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      return { i, x, y, angle };
    });
  }, [burstKey, particleCount]);

  // close dropdown when clicking/tapping outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  const handleSelect = (type) => {
    setOpen(false);
    if (type === "favorites") {
      setView("favorites");
      // هون استدعاء API تجيب المفضلة
      axios
        .get("/api/favorites", { withCredentials: true })
        .then((res) => {
          setFilteredMenu(res.data); // نفس filteredMenuItem الحالي بس محطوط فيه المفضلة
          toast.success("Favorites loaded");
        })
        .catch((err) => {
          toast.error("Failed to load favorites");
          console.error(err);
        });
    } else if (type === "menu") {
      setView("menu");
      setFilteredMenu(menu); // رجّع المنيو الطبيعي
    }
  };

  async function checkNewPromotion() {
    try {
      const res = await axios.get("/api/promotions/latest");
      // assuming your endpoint returns the latest promotion

      if (res.data) {
        toast.success("🎉 A new promotion is available!");
      }
    } catch (err) {
      //console.error("Error fetching promotion:", err);
      //toast.error("Failed to fetch promotions.");
    }
  }

  useEffect(() => {
    checkNewPromotion();
  }, []);

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

  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    setAvailableSlots(generateAvailableSlots());
  }, []);

  const canSubmit =
    orderItems.length > 0 &&
    fulfillmentMethod &&
    (fulfillmentMethod !== "delivery" ||
      (deliveryInfo.address && deliveryInfo.city && deliveryInfo.phone)) &&
    (whenType !== "schedule" || scheduledTime);

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
            <div className={styles.formHeader}>
              <h2>
                <FontAwesomeIcon icon={faMugHot} className={styles.mugIcon} />{" "}
                Your Order
              </h2>
              <FontAwesomeIcon
                icon={faTimes}
                className={styles.closeIcon}
                onClick={() => setShowOverlay(false)}
              />
            </div>

            {/* Order Items */}
            <div className={styles.orderItems}>
              {orderItems.map((item, index) => (
                <div key={index} className={styles.orderItemPreview}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemDetails}>
                    ×{" "}
                    <strong className={styles.itemQuantity}>
                      {item.quantity}
                    </strong>
                    <span className={styles.itemPrice}>
                      (${parseFloat(item.price).toFixed(2)})
                    </span>
                  </span>
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
              ))}

              <div className={styles.orderTotal}>
                <div className={styles.totalDivider}></div>
                <div className={styles.totalRow}>
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
            </div>

            {/* Fulfillment Method */}
            <div className={styles.fieldRow}>
              <label>Receive Method</label>
              <select
                value={fulfillmentMethod}
                onChange={(e) => setFulfillmentMethod(e.target.value)}
              >
                <option value="dineIn">Dine In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {/* Delivery Info */}
            {fulfillmentMethod === "delivery" && (
              <div className={styles.deliveryFields}>
                <div className={styles.fieldRow}>
                  <label>Address</label>
                  <input
                    type="text"
                    value={deliveryInfo.address}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        address: e.target.value,
                      })
                    }
                    placeholder="Street and number"
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label>City</label>
                  <input
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) =>
                      setDeliveryInfo({ ...deliveryInfo, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>
                <div className={styles.fieldRow}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) =>
                      setDeliveryInfo({
                        ...deliveryInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+31XXXXXXXXX"
                  />
                </div>

                {/* Delivery Summary */}
                <div className={styles.summaryRow}>
                  <span>
                    <FontAwesomeIcon icon={faTruck} /> Delivery Fee: $
                    {deliveryFee.toFixed(2)}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faClock} /> ETA: {etaText}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.whenRow}>
              <label className={styles.inline}>
                <input
                  type="radio"
                  checked={whenType === "asap"}
                  onChange={() => setWhenType("asap")}
                />{" "}
                ASAP
              </label>
              <label className={styles.inline}>
                <input
                  type="radio"
                  checked={whenType === "schedule"}
                  onChange={() => setWhenType("schedule")}
                />{" "}
                Schedule
              </label>

              {whenType === "schedule" && (
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={styles.slotSelect}
                >
                  <option value="">Select time</option>
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

            {/* Note */}
            <textarea
              placeholder="Any special requests or instructions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.noteField}
            />
            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                onClick={handleCreateOrder}
                disabled={!canSubmit}
                className={styles.confirmBtn}
              >
                {editMode ? "Update Order" : "Confirm Order"}{" "}
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowOverlay(false)}
              >
                Cancel <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.section
        id="menu-section"
        ref={rootRef}
        className={styles.section}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.18 }} // triggers when 18% visible, re-triggers on scroll in/out
      >
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>
            <span>
              <FontAwesomeIcon icon={view === "favorites" ? faHeart : faBars} />
            </span>
            {view === "favorites" ? "Favorites" : "Menu List"}
          </h2>

          <div className={styles.controls}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Section actions"
              className={styles.dotsBtn}
              onClick={() => setOpen((v) => !v)}
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            <AnimatePresence>
              {open && (
                <motion.ul
                  className={styles.dropdown}
                  initial={{ opacity: 0, scale: 0.97, translateY: -6 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.98, translateY: -6 }}
                  transition={{ duration: 0.14 }}
                  role="menu"
                  aria-label="Section actions list"
                >
                  {view !== "favorites" && (
                    <li
                      role="menuitem"
                      tabIndex={0}
                      className={styles.dropdownItem}
                      onClick={() => handleSelect("favorites")}
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={styles.favIcon}
                      />
                      Show favorites
                    </li>
                  )}
                  {view === "favorites" && (
                    <li
                      role="menuitem"
                      tabIndex={0}
                      className={styles.dropdownItem}
                      onClick={() => handleSelect("menu")}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      Back to Menu
                    </li>
                  )}
                  <li
                    role="menuitem"
                    tabIndex={0}
                    className={styles.dropdownItem}
                  >
                    <FontAwesomeIcon
                      icon={faMagic}
                      className={styles.recomendedIcon}
                    />
                    Recommended
                  </li>

                  <li
                    role="menuitem"
                    tabIndex={0}
                    className={styles.dropdownItem}
                  >
                    <SparkleIcon className={styles.arrivalsIcon} />
                    New Arrivals
                  </li>

                  <li
                    role="menuitem"
                    tabIndex={0}
                    className={styles.dropdownItem}
                  >
                    <FontAwesomeIcon
                      icon={faSortAmountDownAlt}
                      className={styles.sortIcon}
                    />
                    Sort by Price
                  </li>
                  <li
                    role="menuitem"
                    tabIndex={0}
                    className={styles.dropdownItem}
                  >
                    <FontAwesomeIcon
                      icon={faRotate}
                      className={styles.resetIcon}
                    />
                    Reset
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
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
          {loadingMenu ? (
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
                <motion.div
                  className={styles.menuCard}
                  key={item.id}
                  animate={
                    item.isFavorite ? { scale: [1, 1.04, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  id={`menu-item-${item.id}`}
                  ref={cardRef}
                >
                  <motion.button
                    aria-label={
                      item.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    className={`${styles.favoriteBtn} ${
                      item.isFavorite ? styles.alwaysVisible : ""
                    }`}
                    onClick={(e) => handleFavClick(e, item.id)}
                    whileTap={{ scale: 0.9 }}
                    initial="idle"
                    animate={item.isFavorite ? "active" : "idle"}
                    variants={starTapVariants}
                    disabled={loadingFav}
                  >
                    <span className={styles.iconInner}>
                      <FontAwesomeIcon
                        icon={item.isFavorite ? faStarSolid : faStarRegular}
                      />
                    </span>

                    {/* burst particles (only render when newly activated) */}
                    <AnimatePresence>
                      {item.isFavorite && burstKey > 0 && (
                        <motion.span
                          key={`burst-root-${burstKey}`}
                          className={styles.particlesRoot}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {particles.map((p) => (
                            <motion.i
                              key={p.i}
                              className={styles.particle}
                              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                              animate={{
                                x: p.x,
                                y: p.y,
                                scale: [0, 1.1, 0.8],
                                opacity: [1, 1, 0],
                              }}
                              transition={{
                                duration: 0.7 + Math.random() * 0.18,
                                ease: "circOut",
                              }}
                            />
                          ))}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
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
                </motion.div>
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
        {loadingPromo ? (
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

        {loadingBest ? (
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

export default MenuAndOrder;
