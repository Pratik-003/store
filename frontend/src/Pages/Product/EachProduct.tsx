"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/utils/api";
import { useCart, useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

//=========== INTERFACES ===========//
interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  stock_quantity: number;
  image: string;
}

interface EachProductProps {
  product: Product | null;
  onClose: () => void;
}

//=========== UTILITY & CONFIG ===========//
const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(parseFloat(amount));

const API_BASE_URL = "http://127.0.0.1:8000";

//=========== ICONS ===========//
const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
  </svg>
);
const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
  </svg>
);
const ShoppingCartIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const LoaderIcon = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

//=========== MAIN COMPONENT (logic unchanged) ===========//
const EachProduct = ({ product, onClose }: EachProductProps) => {
  const { user } = useAuth();
  const { fetchCartCount } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    setMessage("");
    try {
      await api.post("/api/orders/cart/add/", {
        product_id: product.id,
        quantity: quantity,
      });
      setMessage("Added to cart!");
      await fetchCartCount();

      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setMessage("Failed to add. Try again.");
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  // Backdrop and modal variants
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  // On mobile: bottom sheet slide-up
  // On md+: centered modal scale/opacity
  const sheetVariants = {
    hidden: { y: "100%", opacity: 1 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 28 } },
    exit: { y: "100%", opacity: 1, transition: { duration: 0.2 } },
  };

  const desktopModalVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Mobile bottom sheet */}
          <motion.div
            className="absolute inset-x-0 bottom-0 md:hidden bg-slate-50 rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3">
              <span className="h-1.5 w-12 bg-slate-300 rounded-full" />
            </div>

            <div className="relative p-4">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 hover:bg-black/10 rounded-full p-2 transition"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="px-4 pb-4 overflow-y-auto">
              <div className="h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                  src={product.image ? `${API_BASE_URL}${product.image}` : "https://placehold.co/800/f5f5f5/333?text=Product"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="pt-4">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{product.category}</span>
                <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">{product.name}</h1>
                <p className="text-2xl text-gray-800 font-medium mt-2">{formatCurrency(product.price)}</p>
                <p className="text-gray-600 leading-relaxed mt-3">{product.description}</p>
                <div className="mt-3">
                  {product.stock_quantity > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      In Stock ({product.stock_quantity} available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-800">Quantity</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm">
                      <button onClick={() => handleQuantityChange(-1)} className="p-3 text-gray-600 hover:text-black">
                        <MinusIcon />
                      </button>
                      <span className="w-10 text-center text-lg font-semibold text-gray-900">{quantity}</span>
                      <button onClick={() => handleQuantityChange(1)} className="p-3 text-gray-600 hover:text-black">
                        <PlusIcon />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding || product.stock_quantity === 0}
                      className="flex items-center justify-center w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-black transition-all active:scale-[.99] disabled:bg-gray-400"
                    >
                      {isAdding ? <LoaderIcon /> : <ShoppingCartIcon />}
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </button>
                    <button className="w-full bg-transparent text-gray-900 font-semibold py-3 px-4 rounded-2xl border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                      Buy Now
                    </button>
                    {message && (
                      <p className={`text-center font-semibold ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Desktop centered modal */}
          <motion.div
            className="hidden md:flex absolute inset-0 items-center justify-center p-6"
            variants={desktopModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-900 hover:bg-black/10 rounded-full p-2 transition"
                aria-label="Close"
              >
                <XIcon />
              </button>

              <motion.div className="w-1/2 h-full" initial="hidden" animate="visible" variants={itemVariants}>
                <img
                  src={product.image ? `${API_BASE_URL}${product.image}` : "https://placehold.co/800/f5f5f5/333?text=Product"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>

              <div className="w-1/2 p-8 flex flex-col overflow-y-auto">
                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{product.category}</span>
                </motion.div>
                <motion.h1 className="text-4xl font-serif font-bold text-gray-900 mt-2" variants={itemVariants} initial="hidden" animate="visible">
                  {product.name}
                </motion.h1>
                <motion.p className="text-3xl text-gray-800 font-medium mt-4" variants={itemVariants} initial="hidden" animate="visible">
                  {formatCurrency(product.price)}
                </motion.p>
                <motion.hr variants={itemVariants} initial="hidden" animate="visible" className="my-6 border-slate-200" />
                <motion.p className="text-gray-600 leading-relaxed" variants={itemVariants} initial="hidden" animate="visible">
                  {product.description}
                </motion.p>
                <motion.div className="mt-4" variants={itemVariants} initial="hidden" animate="visible">
                  {product.stock_quantity > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      In Stock ({product.stock_quantity} available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </motion.div>

                <motion.div className="mt-auto pt-8" variants={itemVariants} initial="hidden" animate="visible">
                  <div className="flex items-center gap-4 mb-6">
                    <label className="font-semibold text-gray-800">Quantity</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm">
                      <button onClick={() => handleQuantityChange(-1)} className="p-3 text-gray-600 hover:text-black transition">
                        <MinusIcon />
                      </button>
                      <span className="w-10 text-center text-lg font-semibold text-gray-900">{quantity}</span>
                      <button onClick={() => handleQuantityChange(1)} className="p-3 text-gray-600 hover:text-black transition">
                        <PlusIcon />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding || product.stock_quantity === 0}
                      className="flex items-center justify-center w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-black transition-all duration-300 active:scale-[.99] disabled:bg-gray-400"
                    >
                      {isAdding ? <LoaderIcon /> : <ShoppingCartIcon />}
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </button>
                    <button className="w-full bg-transparent text-gray-900 font-semibold py-3 px-4 rounded-xl border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300">
                      Buy Now
                    </button>
                    {message && (
                      <p className={`mt-2 text-center font-semibold ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
                        {message}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EachProduct;
