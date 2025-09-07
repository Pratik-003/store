"use client";

import React, { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import EachProduct from '@/Pages/Product/EachProduct'; // Import the modal component

//=========== INTERFACES ===========//
interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  stock_quantity: number;
  image: string;
  image_url?: string | null;
}

interface Category {
  name: string;
  products: Product[];
}

//=========== UTILITY FUNCTIONS ===========//
const resolveImageUrl = (path?: string | null): string => {
  const defaultImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1987&auto=format&fit=crop';
  if (!path) return defaultImage;
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  return `${base}${path}`;
};

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(parseFloat(amount));

//=========== ICONS ===========//
const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);


//=========== NEW COMPACT PRODUCT CARD ===========//
const ProductCard = ({ product, onCardClick }: { product: Product, onCardClick: () => void }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="w-full"
  >
    <div 
      onClick={onCardClick}
      className="group cursor-pointer w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={resolveImageUrl(product.image ?? product.image_url)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      {/* Content Area */}
      <div className="p-3 text-left">
        <p className="text-[11px] uppercase tracking-wide text-amber-700 font-semibold line-clamp-1">
          {product.category}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-bold text-gray-900">
          {formatCurrency(product.price)}
        </p>
      </div>
    </div>
  </motion.div>
);


// --- Main Component ---
const ShopByCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewedProduct, setViewedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<Category[]>('/api/products/categories/');
        setCategories(response.data);

        if (response.data && response.data.length > 0) {
          setSelectedCategory(response.data[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Couldn't load products. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  const activeCategory = categories.find(cat => cat.name === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
  };

  return (
    <>
      <div className="bg-slate-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-base font-semibold tracking-wider text-amber-600 uppercase">
            Explore Our Collection
          </h2>
          <p className="mt-2 text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
            Shop by Category
          </p>

          {/* Category Tabs */}
          <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-11 w-32 bg-slate-200 rounded-full animate-pulse"></div>
              ))
            ) : (
              categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                    ${selectedCategory === category.name
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>

          {/* Product Display Grid - UPDATED GRID CLASSES */}
          <motion.div
            key={selectedCategory}
            className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                // UPDATED SKELETON to match new card style
                <div key={i} className="rounded-2xl border border-slate-200 bg-white h-full overflow-hidden">
                  <div className="aspect-square w-full bg-slate-200 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-red-600 bg-red-100 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              activeCategory?.products.slice(0, 8).map((product) => ( // Show up to 8 products now
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onCardClick={() => setViewedProduct(product)} 
                />
              ))
            )}
          </motion.div>
          
          {/* "View All" Button Section */}
          <div className="mt-16">
            <Link href="/product" legacyBehavior>
                <a className="group inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Explore All Products
                    <ArrowRightIcon />
                </a>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Product Modal */}
      <AnimatePresence>
        {viewedProduct && (
          <EachProduct
            product={viewedProduct}
            onClose={() => setViewedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ShopByCategory;