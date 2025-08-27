"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/utils/api';
import { useCart, useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

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
const XIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" /></svg>;
const MinusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>;
const ShoppingCartIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const LoaderIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


//=========== MAIN COMPONENT ===========//
const EachProduct = ({ product, onClose }: EachProductProps) => {
  const { user } = useAuth();
  const { fetchCartCount } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
        router.push('/login');
        return;
    }

    setIsAdding(true);
    setMessage('');
    try {
      await api.post('/api/orders/cart/add/', {
        product_id: product.id,
        quantity: quantity,
      });
      setMessage('Added to cart!');
      await fetchCartCount();
      
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Failed to add to cart:", error);
      setMessage('Failed to add. Try again.');
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  // Animation variants
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 }};
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { when: "beforeChildren", staggerChildren: 0.1, duration: 0.3, ease: "easeOut" }},
    exit: { opacity: 0, scale: 0.95, transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1, duration: 0.2, ease: "easeIn" }}
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="relative bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-900 hover:bg-black/10 rounded-full p-2 transition-all" aria-label="Close"><XIcon/></button>
            <motion.div className="w-full md:w-1/2 h-80 md:h-auto" variants={itemVariants}>
              <img src={product.image ? `${API_BASE_URL}${product.image}` : 'https://placehold.co/800/f5f5f5/333?text=Product'} alt={product.name} className="w-full h-full object-cover"/>
            </motion.div>
            <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <motion.div variants={itemVariants}><span className="text-sm font-semibold text-amber-600 uppercase tracking-widest">{product.category}</span></motion.div>
              <motion.h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-2" variants={itemVariants}>{product.name}</motion.h1>
              <motion.p className="text-3xl text-gray-800 font-light mt-4" variants={itemVariants}>{formatCurrency(product.price)}</motion.p>
              <motion.hr variants={itemVariants} className="my-6 border-slate-200" />
              <motion.p className="text-gray-600 leading-relaxed" variants={itemVariants}>{product.description}</motion.p>
              <motion.div className="mt-4" variants={itemVariants}>
                {product.stock_quantity > 0 ? (<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">In Stock ({product.stock_quantity} available)</span>) : (<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Out of Stock</span>)}
              </motion.div>
              <motion.div className="mt-auto pt-8" variants={itemVariants}>
                  <div className="flex items-center gap-4 mb-6">
                      <label className="font-semibold text-gray-700">Quantity:</label>
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                          <button onClick={() => handleQuantityChange(-1)} className="p-3 text-gray-500 hover:text-black transition"><MinusIcon/></button>
                          <span className="w-10 text-center text-lg font-semibold text-gray-800">{quantity}</span>
                          <button onClick={() => handleQuantityChange(1)} className="p-3 text-gray-500 hover:text-black transition"><PlusIcon/></button>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                      <button onClick={handleAddToCart} disabled={isAdding || product.stock_quantity === 0} className="flex items-center justify-center w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-black transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 shadow-lg disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed">
                          {isAdding ? <LoaderIcon /> : <ShoppingCartIcon />}
                          {isAdding ? 'Adding...' : 'Add to Cart'}
                      </button>
                      <button className="w-full bg-transparent text-gray-800 font-bold py-3 px-4 rounded-lg border-2 border-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">Buy Now</button>
                  </div>
                   {message && (<p className={`mt-4 text-center font-semibold ${message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>)}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EachProduct;
