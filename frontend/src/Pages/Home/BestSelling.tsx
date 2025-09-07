"use client";

import React, { useState, useEffect } from 'react';
import api from '@/app/utils/api'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";


interface ModalProduct {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  stock_quantity: number;
  image: string;
  image_url?: string | null;
}

interface EachProductProps {
  product: ModalProduct | null;
  onClose: () => void;
}

//=========== MODAL ICONS ===========//
const XIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" /></svg>
);
const MinusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
);
const ShoppingCartIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const LoaderIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);


const EachProduct = ({ product, onClose }: EachProductProps) => {
    const { user } = useAuth();
    const { fetchCartCount } = useCart();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState("");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(parseFloat(amount));

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

    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
    const sheetVariants = {
        hidden: { y: "100%" }, visible: { y: 0, transition: { type: "spring", stiffness: 260, damping: 28 } }, exit: { y: "100%", transition: { duration: 0.2 } },
    };
    const desktopModalVariants = {
        hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } }, exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: "easeIn" } },
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit"
            onClick={onClose}
        >
            {/* Mobile bottom sheet */}
            <motion.div
                className="absolute inset-x-0 bottom-0 md:hidden bg-slate-50 rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
                variants={sheetVariants}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Content for mobile... */}
                <div className="flex justify-center pt-3"><span className="h-1.5 w-12 bg-slate-300 rounded-full" /></div>
                <div className="relative p-4"><button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 p-2 rounded-full transition" aria-label="Close"><XIcon /></button></div>
                <div className="px-4 pb-4 overflow-y-auto">
                    <div className="h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <img src={product?.image ? `${API_BASE_URL}${product.image}` : "#"} alt={product?.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="pt-4">
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{product?.category}</span>
                        <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">{product?.name}</h1>
                        <p className="text-2xl text-gray-800 font-medium mt-2">{formatCurrency(product?.price || '0')}</p>
                        <p className="text-gray-600 leading-relaxed mt-3">{product?.description}</p>
                        <div className="mt-5 flex items-center justify-between">
                            <label className="font-semibold text-gray-800">Quantity</label>
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm">
                                <button onClick={() => handleQuantityChange(-1)} className="p-3"><MinusIcon /></button>
                                <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="p-3"><PlusIcon /></button>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <button onClick={handleAddToCart} disabled={isAdding || product?.stock_quantity === 0} className="flex items-center justify-center w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-black transition disabled:bg-gray-400">
                                {isAdding ? <LoaderIcon /> : <><ShoppingCartIcon /> {isAdding ? "Adding..." : "Add to Cart"}</>}
                            </button>
                            {message && <p className={`text-center font-semibold ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>{message}</p>}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Desktop centered modal */}
            <motion.div
                className="hidden md:flex relative bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
                variants={desktopModalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Content for desktop... */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-900 p-2 rounded-full transition" aria-label="Close"><XIcon /></button>
                <div className="w-1/2 h-full"><img src={product?.image ? `${API_BASE_URL}${product.image}` : "#"} alt={product?.name} className="h-full w-full object-cover" /></div>
                <div className="w-1/2 p-8 flex flex-col overflow-y-auto">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{product?.category}</span>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mt-2">{product?.name}</h1>
                    <p className="text-3xl text-gray-800 font-medium mt-4">{formatCurrency(product?.price || '0')}</p>
                    <hr className="my-6 border-slate-200" />
                    <p className="text-gray-600 leading-relaxed">{product?.description}</p>
                    <div className="mt-auto pt-8">
                        <div className="flex items-center gap-4 mb-6">
                            <label className="font-semibold text-gray-800">Quantity</label>
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm">
                                <button onClick={() => handleQuantityChange(-1)} className="p-3 transition"><MinusIcon /></button>
                                <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="p-3 transition"><PlusIcon /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={handleAddToCart} disabled={isAdding || product?.stock_quantity === 0} className="flex items-center justify-center w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-black transition duration-300 disabled:bg-gray-400">
                                {isAdding ? <LoaderIcon /> : <><ShoppingCartIcon /> {isAdding ? "Adding..." : "Add to Cart"}</>}
                            </button>
                            {message && <p className={`mt-2 text-center font-semibold ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>{message}</p>}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


//==================================================================//
//=========== 2. BEST SELLING ITEMS COMPONENT (UPDATED) ============//
//==================================================================//

//=========== LISTING INTERFACES ===========//
interface Product {
  id: number;
  name: string;
  category: string;
  price: string; 
  description: string;
  stock_quantity: number;
  image: string;
  image_url?: string | null;
  rating: number;
  reviews: number;
}

interface Category {
  name: string;
  products: Product[];
}

//=========== LISTING UTILITY FUNCTIONS ===========//
const resolveImageUrl = (path?: string | null): string => {
  const defaultImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1987&auto=format&fit=crop';
  if (!path) return defaultImage;
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  return `${base}${path}`;
};

const shuffleAndPick = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

//=========== LISTING SUB-COMPONENTS ===========//
const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        ))}
      </div>
    );
};

// ** UPDATED BestSellerCard to be clickable **
const BestSellerCard = ({ product, index, onCardClick }: { product: Product, index: number, onCardClick: () => void }) => (
  <div
    onClick={onCardClick}
    className="group flex-shrink-0 w-72 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:!opacity-100 hover:scale-105 cursor-pointer"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className="relative h-56">
      <img
        src={resolveImageUrl(product.image ?? product.image_url)}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        BEST SELLER
      </div>
    </div>
    <div className="p-5">
      <p className="text-sm text-gray-500">{product.category}</p>
      <h3 className="mt-1 text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">₹{parseFloat(product.price).toFixed(2)}</p>
        <div className="flex items-center gap-1">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
      </div>
       {/* "Add to Cart" button is in the modal now, so this can be simplified or removed */}
      <div className="mt-4 text-center text-gray-800 font-semibold py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        View Details
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-72 bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-56 bg-gray-200"></div>
    <div className="p-5">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="mt-2 h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-7 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);


//=========== MAIN COMPONENT (WITH MODAL LOGIC) ===========//
const BestSellingItems = () => {
  const [products, setProducts] = useState<Product[]>([]);
  // ** NEW STATE to manage which product is in the modal **
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<Category[]>('/api/products/categories/');
        const allProducts = response.data.flatMap(category => 
          category.products.map(product => ({
            ...product,
            rating: parseFloat((Math.random() * (5.0 - 3.8) + 3.8).toFixed(1)),
            reviews: Math.floor(Math.random() * (250 - 20) + 20),
          }))
        );
        const randomBestSellers = shuffleAndPick(allProducts, 8);
        setProducts(randomBestSellers);
      } catch (err) {
        console.error("Failed to fetch best selling items:", err);
        setError("Couldn't load our top picks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcessProducts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return [...Array(4)].map((_, index) => <SkeletonCard key={index} />);
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-semibold">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      );
    }

    return products.map((product, index) => (
      <div key={product.id} className="animate-fadeInUp opacity-0 transition-opacity duration-500 group-hover:opacity-70">
        <BestSellerCard 
            product={product} 
            index={index} 
            // ** PASS a function to set the clicked product as the one to be viewed **
            onCardClick={() => setViewedProduct(product)}
        />
      </div>
    ));
  };

  return (
    <>
      <div className="bg-stone-50 py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeInUp opacity-0" style={{ animationDelay: '100ms' }}>
            <h2 className="text-base font-semibold tracking-wider text-amber-600 uppercase">
              Our Top Picks
            </h2>
            <p className="mt-2 text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
              Best Selling Items
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Discover the products our community loves the most. Handpicked for their exceptional quality and taste.
            </p>
          </div>
          <div className="flex gap-8 pb-8 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden group">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* ** RENDER the modal conditionally using AnimatePresence ** */}
      <AnimatePresence>
        {viewedProduct && (
          <EachProduct
            product={viewedProduct}
            onClose={() => setViewedProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </>
  );
};

export default BestSellingItems;