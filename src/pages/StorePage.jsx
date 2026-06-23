import React, { useState, useEffect, useMemo } from "react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { pocketbaseClient as pb } from "@/lib/pocketbaseClient";
import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Lock,
  CheckCircle2,
  Filter,
  Tag,
  X,
  Star,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  Gift,
} from "lucide-react";
import brandedPoloImg from "@/assets/images/branded_polo.png";

// Seeding default categories
const DEFAULT_CATEGORIES = [
  "All Products",
  "Polo Shirts",
  "Tools & Equipment",
  "Safety Apparel",
  "Accessories"
];

// Seeding default products
const getDefaultProducts = () => [
  {
    id: "prod-polo",
    name: "Atlanta TV Mount PRO Branded Polo",
    category: "Polo Shirts",
    customerPrice: 19.99,
    techPrice: 10.00,
    description: "Premium dry-fit branded polo shirt required for technicians on client premises. Features Atlanta TV Mount PRO chest logo.",
    image: brandedPoloImg,
    stock: 120,
    isPolo: true,
    rating: 4.9,
    reviewsCount: 54,
    specs: {
      Material: "100% Recycled Polyester Dry-Fit",
      Fit: "Standard athletic fit",
      Weight: "5.3 oz / 180 g",
      Care: "Machine wash cold, tumble dry low",
    },
    reviews: [
      { author: "Marcus T.", rating: 5, date: "2026-06-12", comment: "Outstanding quality. Super breathable during hot summer mounting jobs." },
      { author: "Devin R.", rating: 4, date: "2026-06-08", comment: "Comfortable and looks professional. Fits true to size." },
    ]
  },
  {
    id: "prod-stud",
    name: "Professional Electronic Stud Finder",
    category: "Tools & Equipment",
    customerPrice: 29.99,
    techPrice: 29.99,
    description: "Heavy-duty electronic stud finder with deep sensing, LCD display, and wire warning detection. Ideal for safe mounting.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80",
    stock: 45,
    rating: 4.7,
    reviewsCount: 32,
    specs: {
      "Sensing Depth": "Up to 1.5 inches (38mm)",
      Display: "Backlit graphical LCD",
      Battery: "9V battery (not included)",
      Calibration: "Automatic on-stud calibration",
    },
    reviews: [
      { author: "Steve H.", rating: 5, date: "2026-06-15", comment: "Incredibly accurate. Must-have tool if you are mounting heavy TVs." },
    ]
  },
  {
    id: "prod-wristband",
    name: "Magnetic Wristband for Screws & Tools",
    category: "Accessories",
    customerPrice: 12.99,
    techPrice: 12.99,
    description: "Embedded with super strong magnets for holding screws, nails, drill bits, and small tools. Speeds up installation.",
    image: "https://images.unsplash.com/photo-1620331357332-9f79c23577d6?w=500&q=80",
    stock: 80,
    rating: 4.8,
    reviewsCount: 89,
    specs: {
      Material: "1680D Ballistic Nylon",
      Magnets: "15 strong neodymium magnets",
      Size: "One size fits most (adjustable Velcro)",
      Weight: "3.2 oz",
    },
    reviews: [
      { author: "Clara M.", rating: 5, date: "2026-06-18", comment: "This has saved me from dropping screws off ladders a hundred times." },
    ]
  },
  {
    id: "prod-vest",
    name: "High-Visibility Safety Reflective Vest",
    category: "Safety Apparel",
    customerPrice: 14.99,
    techPrice: 14.99,
    description: "High visibility neon yellow safety vest with multi-functional pockets and premium reflective stripes.",
    image: "https://images.unsplash.com/photo-1598151551608-d227f67f5b33?w=500&q=80",
    stock: 35,
    rating: 4.6,
    reviewsCount: 18,
    specs: {
      Material: "Highly breathable polyester mesh",
      Standard: "ANSI/ISEA 107-2020 Class 2 compliant",
      Reflective: "2-inch wide silver strips",
      Pockets: "5 utility pockets including ID holder",
    },
    reviews: [
      { author: "Alex B.", rating: 4, date: "2026-06-10", comment: "Lightweight and bright. Pockets are very handy for storing markers and tape." },
    ]
  }
];

const StorePage = () => {
  const { user, isTech } = useClientAuth();
  
  // Catalog states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [activeProductId, setActiveProductId] = useState(null); // Null = grid view, ID = product page
  
  // Cart & checkout states
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code: 'WELCOME15', rate: 0.15 }
  
  // Detailed checkout options
  const [checkoutStep, setCheckoutStep] = useState("cart"); // cart, checkout, success
  const [isFirstTimeCustomer, setIsFirstTimeCustomer] = useState(true);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [saveDetails, setSaveDetails] = useState(true);

  // Forms
  const [billingForm, setBillingForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [paymentAddressForm, setPaymentAddressForm] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [cardForm, setCardForm] = useState({
    number: "",
    expiry: "",
    cvc: "",
    nameOnCard: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Selected Product Detail Options
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Initialize and Seed Store Data
  useEffect(() => {
    // Categories
    const storedCats = localStorage.getItem("atltv_store_categories");
    if (storedCats) {
      setCategories(JSON.parse(storedCats));
    } else {
      localStorage.setItem("atltv_store_categories", JSON.stringify(DEFAULT_CATEGORIES));
      setCategories(DEFAULT_CATEGORIES);
    }

    // Products
    const storedProds = localStorage.getItem("atltv_store_products");
    if (storedProds) {
      setProducts(JSON.parse(storedProds));
    } else {
      const defaults = getDefaultProducts();
      localStorage.setItem("atltv_store_products", JSON.stringify(defaults));
      setProducts(defaults);
    }

    // Check first-time customer status
    checkFirstTimeStatus();
  }, []);

  // Sync user info
  useEffect(() => {
    if (user) {
      setBillingForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
      checkFirstTimeStatus();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkFirstTimeStatus = async () => {
    try {
      const emailToCheck = user?.email || billingForm.email;
      if (emailToCheck) {
        const records = await pb.collection("atltv_store_orders").getList(1, 1, {
          filter: `email="${emailToCheck.toLowerCase()}"`
        });
        setIsFirstTimeCustomer(records.totalItems === 0);
      } else {
        setIsFirstTimeCustomer(true);
      }
    } catch (err) {
      console.warn("Failed to check customer history in PocketBase, using local storage cache:", err);
      try {
        const orders = JSON.parse(localStorage.getItem("atltv_store_orders") || "[]");
        const emailToCheck = user?.email || billingForm.email;
        if (emailToCheck) {
          const userOrders = orders.filter((o) => o.customerDetails.email.toLowerCase() === emailToCheck.toLowerCase());
          setIsFirstTimeCustomer(userOrders.length === 0);
        } else {
          setIsFirstTimeCustomer(true);
        }
      } catch {
        setIsFirstTimeCustomer(true);
      }
    }
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All Products") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const activeProduct = useMemo(() => {
    if (!activeProductId) return null;
    return products.find((p) => p.id === activeProductId);
  }, [products, activeProductId]);

  // Helper to resolve price dynamically
  const getProductPrice = (product) => {
    return isTech ? product.techPrice : product.customerPrice;
  };

  // Add to cart
  const handleAddToCart = (product, qty = 1, size = "L") => {
    setCart((prev) => {
      const cartKey = product.isPolo ? `${product.id}-${size}` : product.id;
      const existing = prev.find((item) => item.cartKey === cartKey);
      
      if (existing) {
        const totalQty = existing.quantity + qty;
        if (totalQty > product.stock) {
          toast.error("Cannot add more. Out of stock.");
          return prev;
        }
        toast.success(`Increased ${product.name} quantity.`);
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: totalQty }
            : item
        );
      }
      
      toast.success(`Added ${product.name} to cart.`);
      return [...prev, { cartKey, product, quantity: qty, size: product.isPolo ? size : null }];
    });
  };

  // Update quantity in cart
  const updateCartQuantity = (cartKey, delta) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartKey === cartKey);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.cartKey !== cartKey);
      }
      if (newQty > item.product.stock) {
        toast.error("Requested quantity exceeds available stock.");
        return prev;
      }
      return prev.map((i) =>
        i.cartKey === cartKey ? { ...i, quantity: newQty } : i
      );
    });
  };

  // Remove from cart
  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));
    toast.success("Item removed from cart.");
  };

  // Apply promo codes
  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code === "WELCOME15" || code === "FIRST15" || code === "PRO15") {
      setAppliedPromo({ code, rate: 0.15 });
      toast.success(`Promo code "${code}" (15% off) applied successfully!`);
      setPromoCodeInput("");
    } else {
      toast.error("Invalid promo code.");
    }
  };

  // Pricing calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + getProductPrice(item.product) * item.quantity, 0);
  }, [cart, isTech]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto first-time customer discount (15% off) or applied promo code
  const discountRate = useMemo(() => {
    if (isFirstTimeCustomer) return 0.15; // 15% off first time auto
    if (appliedPromo) return appliedPromo.rate;
    return 0;
  }, [isFirstTimeCustomer, appliedPromo]);

  const discountAmount = useMemo(() => {
    return cartSubtotal * discountRate;
  }, [cartSubtotal, discountRate]);

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (shippingMethod === "standard") return 4.99;
    if (shippingMethod === "next_day") return 14.99;
    return 24.99;
  }, [cart, shippingMethod]);

  const tax = useMemo(() => {
    return (cartSubtotal - discountAmount) * 0.08;
  }, [cartSubtotal, discountAmount]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + shippingFee + tax);
  }, [cartSubtotal, discountAmount, shippingFee, tax]);

  // Handle forms change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 6) {
        formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
    }

    setBillingForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handlePaymentAddressChange = (e) => {
    const { name, value } = e.target;
    setPaymentAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "number") {
      const digits = value.replace(/\D/g, "").slice(0, 19);
      formattedValue = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      if (digits.length >= 3) {
        formattedValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        formattedValue = digits;
      }
    } else if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Submit checkout
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!billingForm.name || !billingForm.email || !billingForm.phone || !billingForm.address || !billingForm.city || !billingForm.state || !billingForm.zip) {
      toast.error("Please fill in all shipping details.");
      return;
    }
    if (!sameAsShipping && (!paymentAddressForm.address || !paymentAddressForm.city || !paymentAddressForm.state || !paymentAddressForm.zip)) {
      toast.error("Please fill in billing address details.");
      return;
    }
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.nameOnCard) {
      toast.error("Please fill in card payment details.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingForm.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const cleanCard = cardForm.number.replace(/\s/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 19 || !/^\d+$/.test(cleanCard)) {
      toast.error("Please enter a valid 15-19 digit card number.");
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryRegex.test(cardForm.expiry)) {
      toast.error("Please enter a valid card expiry date (MM/YY).");
      return;
    }

    const cleanCVC = cardForm.cvc.trim();
    if (cleanCVC.length < 3 || cleanCVC.length > 4 || !/^\d+$/.test(cleanCVC)) {
      toast.error("Please enter a valid 3 or 4 digit CVC security code.");
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      // Create new order record
      const orderId = `order_${Date.now()}`;
      const newOrder = {
        id: orderId,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          size: item.size,
          pricePaid: getProductPrice(item.product),
        })),
        customerDetails: {
          ...billingForm,
          isTech: !!isTech,
        },
        billingAddress: sameAsShipping ? null : paymentAddressForm,
        isGift,
        giftNote: isGift ? giftNote : null,
        newsletterOptIn,
        subtotal: cartSubtotal,
        discountApplied: discountAmount,
        shippingFee,
        tax,
        total: cartTotal,
        shippingMethod,
        timestamp: Date.now(),
        status: "Pending",
      };

      // Save order to PocketBase (and fallback cache to local storage)
      try {
        await pb.collection("atltv_store_orders").create({
          items: newOrder.items,
          total: newOrder.total,
          status: newOrder.status,
          address: JSON.stringify({
            shipping: newOrder.customerDetails,
            billing: newOrder.billingAddress,
            giftNote: newOrder.giftNote,
            newsletterOptIn: newOrder.newsletterOptIn
          }),
          email: newOrder.customerDetails.email,
          name: newOrder.customerDetails.name,
          paymentMethod: "card",
          shippingSpeed: newOrder.shippingMethod
        });
      } catch (pbErr) {
        console.warn("PocketBase store order creation failed, fallback to local storage:", pbErr);
      }

      try {
        const storedOrders = JSON.parse(localStorage.getItem("atltv_store_orders") || "[]");
        storedOrders.push(newOrder);
        localStorage.setItem("atltv_store_orders", JSON.stringify(storedOrders));

        // Deduct stock levels
        const updatedProducts = products.map((p) => {
          const cartItemsForProduct = cart.filter((item) => item.product.id === p.id);
          const totalDeducted = cartItemsForProduct.reduce((sum, i) => sum + i.quantity, 0);
          if (totalDeducted > 0) {
            return { ...p, stock: Math.max(0, p.stock - totalDeducted) };
          }
          return p;
        });
        localStorage.setItem("atltv_store_products", JSON.stringify(updatedProducts));
        setProducts(updatedProducts);

        setCompletedOrder(newOrder);
        setCart([]);
        setCheckoutStep("success");
        setIsFirstTimeCustomer(false);
        toast.success("Order processed successfully!");
      } catch (err) {
        console.error(err);
        toast.error("An error occurred during checkout.");
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Banner/Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <ShoppingBag className="text-primary w-8 h-8 animate-bounce" />
              Atlanta TV Mount PRO Apparel & Gear
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Get official team uniforms, specialized tools, safety gear, and accessories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isTech && (
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                <Tag size={12} /> Registered Technician Account (Polo Discount Active)
              </span>
            )}
            {isFirstTimeCustomer && (
              <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Tag size={12} /> First-time Customer (15% Off Auto-Applied)
              </span>
            )}
            <Button
              onClick={() => {
                setCheckoutStep("cart");
                setCartOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground relative flex items-center gap-2 font-semibold h-10 px-4 transition-all"
            >
              <ShoppingCart size={16} />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold border-2 border-background">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ── VIEW: PRODUCT DETAIL PAGE ── */}
        {activeProduct ? (
          <div className="space-y-8 animate-fade-in">
            {/* Breadcrumbs & Back link */}
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                <button onClick={() => setActiveProductId(null)} className="hover:text-primary transition-colors">Store</button>
                <span>/</span>
                <span className="text-muted-foreground">{activeProduct.category}</span>
                <span>/</span>
                <span className="font-semibold text-foreground truncate max-w-[200px]">{activeProduct.name}</span>
              </nav>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveProductId(null)}
                className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground"
              >
                <ArrowLeft size={14} /> Back to Catalog
              </Button>
            </div>

            {/* Product details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-card border border-border p-6 lg:p-8 rounded-3xl shadow-sm">
              
              {/* Product Image Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center relative">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="object-cover w-full h-full"
                  />
                  {activeProduct.stock <= 0 && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full uppercase tracking-wider">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-square bg-muted border border-primary/20 rounded-xl overflow-hidden cursor-pointer p-0.5">
                    <img src={activeProduct.image} alt="detail 1" className="object-cover w-full h-full rounded-lg" />
                  </div>
                  <div className="aspect-square bg-muted border border-border rounded-xl overflow-hidden cursor-not-allowed opacity-50">
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Angle 2</div>
                  </div>
                  <div className="aspect-square bg-muted border border-border rounded-xl overflow-hidden cursor-not-allowed opacity-50">
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Lifestyle</div>
                  </div>
                </div>
              </div>

              {/* Product Info Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {activeProduct.category}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                    {activeProduct.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill={i < Math.floor(activeProduct.rating || 5) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{activeProduct.rating || 5.0}</span>
                    <span className="text-xs text-muted-foreground">({activeProduct.reviewsCount || 0} reviews)</span>
                  </div>
                </div>

                <div className="border-y border-border py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Pricing</p>
                    <div className="flex items-baseline gap-2.5 mt-1">
                      <span className="text-3xl font-extrabold text-primary">
                        ${getProductPrice(activeProduct).toFixed(2)}
                      </span>
                      {activeProduct.isPolo && isTech && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${activeProduct.customerPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      activeProduct.stock > 10 ? "text-emerald-500" : activeProduct.stock > 0 ? "text-amber-500" : "text-red-500"
                    }`}>
                      <CheckCircle2 size={14} /> {activeProduct.stock > 10 ? "In Stock & Ready" : activeProduct.stock > 0 ? `Only ${activeProduct.stock} Left` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeProduct.description}
                </p>

                {/* Polo Sizing selection */}
                {activeProduct.isPolo && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="font-bold text-foreground">Select Shirt Size</Label>
                      <span className="text-muted-foreground underline cursor-pointer">Sizing Guide</span>
                    </div>
                    <div className="flex gap-2">
                      {["S", "M", "L", "XL", "XXL"].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`w-12 h-12 rounded-xl border text-xs font-bold transition-all ${
                            selectedSize === sz
                              ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-105"
                              : "border-border text-foreground hover:bg-muted hover:border-foreground/45"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selector */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Quantity</Label>
                    <div className="flex items-center border border-border rounded-xl p-1 bg-muted/30">
                      <button
                        onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg hover:bg-muted text-foreground flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{selectedQuantity}</span>
                      <button
                        onClick={() => setSelectedQuantity(prev => Math.min(activeProduct.stock, prev + 1))}
                        className="w-8 h-8 rounded-lg hover:bg-muted text-foreground flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 pt-5">
                    <Button
                      onClick={() => handleAddToCart(activeProduct, selectedQuantity, selectedSize)}
                      disabled={activeProduct.stock <= 0}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} /> Add to Cart — ${(getProductPrice(activeProduct) * selectedQuantity).toFixed(2)}
                    </Button>
                  </div>
                </div>

                {/* Spec sheets */}
                <div className="bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-3 text-xs">
                  <h3 className="font-bold text-foreground">Specifications</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                    {Object.entries(activeProduct.specs || {}).map(([key, val]) => (
                      <React.Fragment key={key}>
                        <span className="text-muted-foreground font-medium">{key}</span>
                        <span className="text-foreground text-right font-semibold truncate">{val}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer reviews block */}
            <div className="bg-card border border-border p-6 lg:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-bold text-base text-foreground">Customer Reviews</h3>
              <div className="space-y-4">
                {(activeProduct.reviews || []).map((rev, idx) => (
                  <div key={idx} className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{rev.author}</span>
                      <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill={i < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related products showcase */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">You May Also Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {products
                  .filter((p) => p.id !== activeProduct.id)
                  .slice(0, 3)
                  .map((prod) => {
                    const price = getProductPrice(prod);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setActiveProductId(prod.id);
                          setSelectedQuantity(1);
                        }}
                        className="bg-card border border-border rounded-2xl overflow-hidden p-4 shadow-sm hover:border-primary/40 hover:shadow transition-all cursor-pointer space-y-3 text-xs"
                      >
                        <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden">
                          <img src={prod.image} alt={prod.name} className="object-cover w-full h-full" />
                        </div>
                        <h4 className="font-bold text-foreground truncate">{prod.name}</h4>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-muted-foreground">{prod.category}</span>
                          <span className="font-bold text-primary">${price.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          /* ── VIEW: CATALOG GRID VIEW ── */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Category Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <Filter size={15} className="text-primary" />
                  Categories
                </h2>
                <nav className="flex flex-col gap-1.5">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    const count = cat === "All Products" 
                      ? products.length 
                      : products.filter(p => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 text-xs text-muted-foreground leading-relaxed">
                <h3 className="font-bold text-foreground mb-1.5">Atlanta TV Mount PRO Uniform Policy</h3>
                All field technicians are required to wear clean, branded polo shirts and their custom engraved name tag on site. New recruits receive their first 3 shirts + name tag via paycheck deduction onboarding.
              </div>
            </div>

            {/* Right Product Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-3xl p-8">
                  <p className="text-muted-foreground">No products found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => {
                    const price = getProductPrice(prod);
                    const showDiscount = prod.isPolo && isTech;
                    const outOfStock = prod.stock <= 0;

                    return (
                      <div
                        key={prod.id}
                        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/35 transition-all duration-300 flex flex-col group cursor-pointer"
                        onClick={() => {
                          setActiveProductId(prod.id);
                          setSelectedQuantity(1);
                        }}
                      >
                        {/* Product Image */}
                        <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          {prod.stock < 10 && !outOfStock && (
                            <span className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Low Stock ({prod.stock})
                            </span>
                          )}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
                                Out of Stock
                              </span>
                            </div>
                          )}
                          {prod.isPolo && (
                            <span className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                              Official Uniform
                            </span>
                          )}
                        </div>

                        {/* Product Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {prod.category}
                            </span>
                            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {prod.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col">
                              {showDiscount && (
                                <span className="text-[10px] text-muted-foreground line-through">
                                  ${prod.customerPrice.toFixed(2)}
                                </span>
                              )}
                              <span className="font-bold text-lg text-primary flex items-center gap-1.5">
                                ${price.toFixed(2)}
                                {showDiscount && (
                                  <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                                    Tech Rate
                                  </span>
                                )}
                              </span>
                            </div>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (prod.isPolo) {
                                  setActiveProductId(prod.id);
                                  setSelectedQuantity(1);
                                } else {
                                  handleAddToCart(prod);
                                }
                              }}
                              disabled={outOfStock}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-xs px-3.5 font-semibold rounded-lg"
                            >
                              {prod.isPolo ? "Select Size" : "Add to Cart"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Checkout Slide-Over Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-[2px] animate-fade-in flex justify-end">
          <div className="w-full max-w-lg bg-card h-full flex flex-col shadow-2xl relative animate-slide-left border-l border-border">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <ShoppingCart className="text-primary w-5 h-5" />
                Shopping Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {checkoutStep === "cart" && (
                <div className="space-y-6">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                        <ShoppingCart size={24} />
                      </div>
                      <p className="text-muted-foreground text-xs">Your cart is empty.</p>
                      <Button onClick={() => setCartOpen(false)} variant="outline" className="text-xs">
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items List */}
                      <div className="space-y-3.5">
                        {cart.map((item) => {
                          const price = getProductPrice(item.product);
                          return (
                            <div
                              key={item.cartKey}
                              className="flex items-center gap-4 bg-muted/30 border border-border p-3 rounded-xl"
                            >
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs text-foreground truncate">
                                  {item.product.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
                                    {item.product.category}
                                  </p>
                                  {item.size && (
                                    <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded font-extrabold">
                                      Size {item.size}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-primary font-bold mt-1">
                                  ${price.toFixed(2)}
                                </p>
                              </div>

                              {/* Quantity selection */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateCartQuantity(item.cartKey, -1)}
                                  className="w-6 h-6 border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center rounded-md transition-colors"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.cartKey, 1)}
                                  className="w-6 h-6 border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center rounded-md transition-colors"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.cartKey)}
                                className="p-1.5 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Promo Code area */}
                      <div className="space-y-2 border-t border-border pt-4">
                        <Label className="text-xs font-semibold text-foreground">Promo Code</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. WELCOME15"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            className="text-xs h-9 bg-muted/40"
                          />
                          <Button onClick={handleApplyPromo} variant="outline" className="h-9 text-xs">
                            Apply
                          </Button>
                        </div>
                        {appliedPromo && (
                          <div className="text-[10px] text-green-500 font-semibold flex items-center gap-1 mt-1">
                            <Tag size={10} /> Code "{appliedPromo.code}" active (15% discount applied).
                          </div>
                        )}
                      </div>

                      {/* Shipping speed selection */}
                      <div className="space-y-2 border-t border-border pt-4">
                        <Label className="text-xs font-semibold text-foreground">Select Shipping Method</Label>
                        <select
                          value={shippingMethod}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="w-full bg-muted/40 border border-border text-foreground h-9 rounded-md px-3 text-xs focus:border-primary focus:outline-none"
                        >
                          <option value="standard">Standard Delivery (3-5 days) — $4.99</option>
                          <option value="next_day">Next Day Delivery — $14.99</option>
                          <option value="same_day">Same Day Delivery — $24.99</option>
                        </select>
                      </div>

                      {/* Summary */}
                      <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>${cartSubtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-green-500 font-semibold">
                            <span>
                              {isFirstTimeCustomer ? "First-time Customer (15% off)" : `Promo Code (${appliedPromo?.code})`}
                            </span>
                            <span>−${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>Shipping Fee</span>
                          <span>${shippingFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Estimated Tax (8%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-2 border-t border-border text-foreground">
                          <span>Total Amount</span>
                          <span className="text-primary">${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setCheckoutStep("checkout")}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 flex items-center justify-center gap-1.5"
                      >
                        Proceed to Checkout <ChevronRight size={14} />
                      </Button>
                    </>
                  )}
                </div>
              )}

              {checkoutStep === "checkout" && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  {/* Summary row */}
                  <div className="flex justify-between items-center p-3.5 bg-primary/10 rounded-xl border border-primary/10 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Checkout Total</p>
                      <p className="text-lg font-bold text-primary">${cartTotal.toFixed(2)}</p>
                      {discountAmount > 0 && (
                        <p className="text-[9px] text-green-500">15% discount applied across the board</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCheckoutStep("cart")}
                      className="text-xs text-muted-foreground h-8"
                    >
                      Edit Cart
                    </Button>
                  </div>

                  {/* Billing Details */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Shipping Details</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="cust-name" className="text-xs">Full Name</Label>
                      <Input
                        id="cust-name"
                        name="name"
                        value={billingForm.name}
                        onChange={handleBillingChange}
                        required
                        placeholder="John Doe"
                        className="bg-muted/40 border-border text-xs h-9"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-email" className="text-xs">Email Address</Label>
                        <Input
                          id="cust-email"
                          name="email"
                          type="email"
                          value={billingForm.email}
                          onChange={handleBillingChange}
                          required
                          placeholder="john@example.com"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-phone" className="text-xs">Phone Number</Label>
                        <Input
                          id="cust-phone"
                          name="phone"
                          value={billingForm.phone}
                          onChange={handleBillingChange}
                          required
                          placeholder="(555) 123-4567"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cust-address" className="text-xs">Street Address</Label>
                      <Input
                        id="cust-address"
                        name="address"
                        value={billingForm.address}
                        onChange={handleBillingChange}
                        required
                        placeholder="123 Main St"
                        className="bg-muted/40 border-border text-xs h-9"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-city" className="text-xs">City</Label>
                        <Input
                          id="cust-city"
                          name="city"
                          value={billingForm.city}
                          onChange={handleBillingChange}
                          required
                          placeholder="Atlanta"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-state" className="text-xs">State</Label>
                        <Input
                          id="cust-state"
                          name="state"
                          value={billingForm.state}
                          onChange={handleBillingChange}
                          required
                          placeholder="GA"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-zip" className="text-xs">Zip Code</Label>
                        <Input
                          id="cust-zip"
                          name="zip"
                          value={billingForm.zip}
                          onChange={handleBillingChange}
                          required
                          placeholder="30301"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing address toggle */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="same-as-shipping"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
                      />
                      <Label htmlFor="same-as-shipping" className="text-xs cursor-pointer select-none">
                        Billing address is the same as shipping address
                      </Label>
                    </div>

                    {!sameAsShipping && (
                      <div className="bg-muted/20 border border-border p-4 rounded-xl space-y-3 animate-fade-in text-xs">
                        <h4 className="font-bold text-[10px] text-muted-foreground uppercase">Billing Address</h4>
                        <div className="space-y-1.5">
                          <Label htmlFor="bill-address" className="text-xs">Street Address</Label>
                          <Input
                            id="bill-address"
                            name="address"
                            value={paymentAddressForm.address}
                            onChange={handlePaymentAddressChange}
                            required
                            placeholder="456 Oak Ave"
                            className="bg-background text-xs h-9"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="bill-city" className="text-xs">City</Label>
                            <Input
                              id="bill-city"
                              name="city"
                              value={paymentAddressForm.city}
                              onChange={handlePaymentAddressChange}
                              required
                              placeholder="Atlanta"
                              className="bg-background text-xs h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="bill-state" className="text-xs">State</Label>
                            <Input
                              id="bill-state"
                              name="state"
                              value={paymentAddressForm.state}
                              onChange={handlePaymentAddressChange}
                              required
                              placeholder="GA"
                              className="bg-background text-xs h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="bill-zip" className="text-xs">Zip Code</Label>
                            <Input
                              id="bill-zip"
                              name="zip"
                              value={paymentAddressForm.zip}
                              onChange={handlePaymentAddressChange}
                              required
                              placeholder="30302"
                              className="bg-background text-xs h-9"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gift Options */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-gift"
                        checked={isGift}
                        onChange={(e) => setIsGift(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
                      />
                      <Label htmlFor="is-gift" className="text-xs cursor-pointer select-none flex items-center gap-1.5">
                        <Gift size={13} className="text-primary" /> This is a gift order
                      </Label>
                    </div>

                    {isGift && (
                      <div className="space-y-1.5 animate-fade-in">
                        <Label htmlFor="gift-note" className="text-xs">Gift Message</Label>
                        <textarea
                          id="gift-note"
                          rows={2}
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          placeholder="Enter a friendly message for the recipient..."
                          className="w-full bg-muted/40 border border-border text-foreground rounded-md p-3 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Payment Details (Stripe Sandbox)</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="card-number" className="text-xs">Card Number</Label>
                      <Input
                        id="card-number"
                        name="number"
                        maxLength={19}
                        value={cardForm.number}
                        onChange={handleCardChange}
                        required
                        placeholder="4242 4242 4242 4242"
                        className="bg-muted/40 border-border text-xs h-9"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="card-expiry" className="text-xs">Expiry Date (MM/YY)</Label>
                        <Input
                          id="card-expiry"
                          name="expiry"
                          maxLength={5}
                          value={cardForm.expiry}
                          onChange={handleCardChange}
                          required
                          placeholder="12/28"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="card-cvc" className="text-xs">CVC</Label>
                        <Input
                          id="card-cvc"
                          name="cvc"
                          maxLength={3}
                          value={cardForm.cvc}
                          onChange={handleCardChange}
                          required
                          placeholder="123"
                          className="bg-muted/40 border-border text-xs h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="card-name" className="text-xs">Name on Card</Label>
                      <Input
                        id="card-name"
                        name="nameOnCard"
                        value={cardForm.nameOnCard}
                        onChange={handleCardChange}
                        required
                        placeholder="John Doe"
                        className="bg-muted/40 border-border text-xs h-9"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="newsletter"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
                      />
                      <Label htmlFor="newsletter" className="text-xs cursor-pointer select-none">
                        Keep me updated on Atlanta TV Mount PRO news and special offers
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="save-details"
                        checked={saveDetails}
                        onChange={(e) => setSaveDetails(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer"
                      />
                      <Label htmlFor="save-details" className="text-xs cursor-pointer select-none">
                        Save this shipping and billing information for my next order
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                        <span>Processing secure checkout...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Pay ${cartTotal.toFixed(2)}</span>
                      </>
                    )}
                  </Button>
                </form>
              )}

              {checkoutStep === "success" && completedOrder && (
                <div className="py-8 text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-2 text-xs">
                    <h3 className="text-xl font-bold text-foreground">Order Placed Successfully!</h3>
                    <p className="text-xs text-muted-foreground">
                      Your payment of <strong className="text-foreground">${completedOrder.total.toFixed(2)}</strong> has been processed via Stripe.
                    </p>
                  </div>

                  <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 text-left text-xs space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between border-b border-border/60 pb-1.5">
                      <span className="text-muted-foreground">Order Reference:</span>
                      <span className="font-mono font-bold text-foreground">{completedOrder.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-1.5">
                      <span className="text-muted-foreground">Delivery Speed:</span>
                      <span className="capitalize font-semibold text-foreground">{completedOrder.shippingMethod}</span>
                    </div>
                    {completedOrder.isGift && (
                      <div className="border-b border-border/60 pb-1.5 space-y-1">
                        <span className="text-muted-foreground font-bold flex items-center gap-1"><Gift size={11} className="text-primary" /> Gift Note Included:</span>
                        <span className="italic block bg-card p-2 rounded border border-border/50 text-[11px] text-foreground">"{completedOrder.giftNote}"</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Shipping Address:</span>
                      <span className="text-foreground leading-relaxed block">
                        {completedOrder.customerDetails.address}, {completedOrder.customerDetails.city}, {completedOrder.customerDetails.state} {completedOrder.customerDetails.zip}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        setCheckoutStep("cart");
                        setCartOpen(false);
                        setActiveProductId(null);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      Continue Browsing Store
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
