// Your existing ProductsPage.tsx file

"use client"

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/app/utils/api'; 
import Navbar from '@/components/Navbar';
import EachProduct from '@/Pages/Product/EachProduct'; // <--- 1. IMPORT THE MODAL

//=========== INTERFACES (Corrected to match backend JSON) ===========//
interface Product {
  id: number;
  name: string;
  price: string;
  category: string; // This will be added later
  description: string;
  stock_quantity: number; // Added field
  image: string; // Corrected from image_url
  image_url?: string | null; // Keep for legacy if needed, but 'image' is primary
}

interface CategoryResponse { // This is what your API sends
  id: number;
  name: string;
  products: Product[];
}

//=========== UTILITY FUNCTIONS ===========//
const formatCurrency = (amount: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(parseFloat(amount));

// Use your actual backend URL here for images
const API_BASE_URL = "http://127.0.0.1:8000"; 

//=========== COMPONENTS ===========//

// --- 2. UPDATE ProductCard to use the correct image field ---
const ProductCard = ({ product, onClick }: { product: Product, onClick: () => void }) => (
  <div 
    className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
    onClick={onClick}
  >
    <img
      src={product.image ? `${API_BASE_URL}${product.image}` : 'https://placehold.co/600x400/FFF/333?text=Image'}
      alt={product.name}
      className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
    />
    {/* ... rest of the ProductCard component is fine ... */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-6">
      <h3 className="text-white text-xl font-bold">{product.name}</h3>
      <p className="text-amber-400 mt-1 text-lg font-semibold">{formatCurrency(product.price)}</p>
    </div>
    <div className="absolute top-4 right-4 h-12 w-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    </div>
  </div>
);


// --- Main Page Component ---
const ProductsPage = () => {
  // The state 'categories' is fine, but we'll use a specific type for the API response
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Ensure the API call is typed correctly
        const response = await api.get<CategoryResponse[]>('/api/products/categories/');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Couldn't load products. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);
  
  // This logic is good, it correctly flattens products and adds the category name
  const allProducts = useMemo(() => categories.flatMap(cat => cat.products.map(p => ({...p, category: cat.name}))), [categories]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'All') {
      return allProducts;
    }
    return allProducts.filter(product => product.category === activeFilter);
  }, [activeFilter, allProducts]);
  
  const categoryNames = useMemo(() => ['All', ...categories.map(c => c.name)], [categories]);

  return (
    <>
      <Navbar/>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* ... Your header and filter buttons are fine ... */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-gray-900 tracking-tight">Our Artisanal Collection</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Handcrafted with love. Discover our range of delicious cakes, pastries, and breads.
            </p>
          </div>
          <div className="mb-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>)
            ) : (
              categoryNames.map(name => (
                <button
                  key={name}
                  onClick={() => setActiveFilter(name)}
                  className={`px-5 py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:scale-105
                    ${activeFilter === name
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                >
                  {name}
                </button>
              ))
            )}
          </div>

          {/* Product Grid */}
          <div 
            key={activeFilter}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 animate-fadeIn"
          >
            {/* ... Your loading and error states are fine ... */}
            {isLoading ? (
             [...Array(6)].map((_, i) => (
               <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse"></div>
             ))
           ) : error ? (
             <div className="sm:col-span-2 lg:col-span-3 text-center text-red-600 bg-red-50 p-6 rounded-lg">
               <p className="font-semibold">Oops! Something went wrong.</p>
               <p>{error}</p>
             </div>
           ) : (
             filteredProducts.map((product, index) => (
               <div 
                 key={`${product.id}-${product.name}`} // Use a more unique key
                 style={{ animationDelay: `${index * 80}ms` }}
                 className="opacity-0 animate-fadeInUp"
               >
                 <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
               </div>
             ))
           )}
          </div>
        </div>

        {/* --- 3. UNCOMMENT AND ENABLE THE MODAL --- */}
        <EachProduct 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
        
        {/* Your keyframes styles are fine */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductsPage;