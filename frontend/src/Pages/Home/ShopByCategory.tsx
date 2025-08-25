"use client"

import React from 'react';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api'; // Assuming your api utility is here

//=========== INTERFACES ===========//
// To ensure type safety with the data from your API
interface Product {
  id: number;
  name: string;
  price: string; // API sends price as a string like "450.00"
  image?: string | null;
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
  
  // Resolve relative backend URL (e.g., /media/...) to an absolute one
  const base = (api as any)?.defaults?.baseURL as string | undefined;
  if (base) {
    const origin = new URL(base).origin;
    return `${origin}${path}`;
  }
  return path;
};

const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(parseFloat(amount));


//=========== COMPONENTS ===========//

const ProductCard = ({ product }) => (
  <div className="group relative overflow-hidden rounded-lg shadow-lg">
    <img
      src={resolveImageUrl(product.image ?? product.image_url)}
      alt={product.name}
      className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-4">
      <h3 className="text-white text-lg font-semibold">{product.name}</h3>
      <p className="text-amber-300 mt-1 font-bold">{formatCurrency(product.price)}</p>
    </div>
    <div className="absolute top-0 right-0 m-3 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
    </div>
  </div>
);

// --- Main Component ---
const ShopByCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch all categories, assuming each comes with its products nested
        const response = await api.get<Category[]>('/api/products/categories/');
        setCategories(response.data);

        // Set the first category as the default selected one
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

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-base font-semibold tracking-wider text-amber-600 uppercase">
          Explore Our Collection
        </h2>
        <p className="mt-2 text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
          Shop by Category
        </p>

        {/* Category Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-4">
          {isLoading ? (
             // Skeleton loaders for tabs while loading
            [...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-40 bg-gray-200 rounded-full animate-pulse"></div>
            ))
          ) : (
            categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                  ${selectedCategory === category.name
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))
          )}
        </div>

        {/* Product Display Grid */}
        <div 
          key={selectedCategory} 
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeInUp"
        >
          {isLoading ? (
             // Skeleton loaders for product cards
            [...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))
          ) : error ? (
            <div className="sm:col-span-2 lg:col-span-3 text-red-600 bg-red-100 p-4 rounded-lg">
                {error}
            </div>
          ) : (
            activeCategory && activeCategory.products.map((product, index) => (
              <div 
                key={product.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="opacity-0"
              >
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp > * {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ShopByCategory;