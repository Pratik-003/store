"use client"
import React from 'react';

// --- Mock Data ---
// Replace this with data fetched from your backend API.
const bestSellingProducts = [
  {
    id: 1,
    name: 'Madagascar Vanilla Extract',
    category: 'Essence & Extracts',
    price: '₹850',
    image: 'https://images.unsplash.com/photo-1631601992233-0c13df136c0a?q=80&w=1887&auto=format&fit=crop',
    rating: 4.9,
    reviews: 132,
  },
  {
    id: 2,
    name: 'Dark Chocolate Callets (70%)',
    category: 'Chocolates & Cocoa',
    price: '₹450',
    image: 'https://images.unsplash.com/photo-1623872413334-a3c5b52b31a8?q=80&w=1887&auto=format&fit=crop',
    rating: 4.8,
    reviews: 98,
  },
  {
    id: 3,
    name: 'Gel Food Color Kit (12 Pack)',
    category: 'Food Coloring',
    price: '₹999',
    image: 'https://images.unsplash.com/photo-1587338428241-b05dc125156a?q=80&w=1887&auto=format&fit=crop',
    rating: 4.9,
    reviews: 210,
  },
  {
    id: 4,
    name: 'Premium Almond Flour',
    category: 'Flours & Mixes',
    price: '₹750',
    image: 'https://images.unsplash.com/photo-1607427563720-83f18a6c8c43?q=80&w=1887&auto=format&fit=crop',
    rating: 4.7,
    reviews: 76,
  },
  {
    id: 5,
    name: 'Edible Gold Dust',
    category: 'Food Coloring',
    price: '₹500',
    image: 'https://images.unsplash.com/photo-1619920835184-9a4c00922579?q=80&w=1887&auto=format&fit=crop',
    rating: 4.8,
    reviews: 154,
  },
];

// --- Star Rating Component ---
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
      {halfStar && <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  );
};


// --- Best Seller Card Component ---
const BestSellerCard = ({ product, index }) => (
  <div
    className="group flex-shrink-0 w-72 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:!opacity-100 hover:scale-105"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className="relative h-56">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x250/FFF0E0/333333?text=Best+Seller'; }}
      />
      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        BEST SELLER
      </div>
    </div>
    <div className="p-5">
      <p className="text-sm text-gray-500">{product.category}</p>
      <h3 className="mt-1 text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">{product.price}</p>
        <div className="flex items-center gap-1">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
      </div>
      <button className="mt-4 w-full bg-gray-800 text-white font-semibold py-2.5 rounded-lg transform transition-all duration-300
                       opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0
                       hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
        Add to Cart
      </button>
    </div>
  </div>
);


// --- Main Component ---
const BestSellingItems = () => {
  return (
    <div className="bg-stone-50 py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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

        {/* Horizontal Scrolling Product List */}
        <div className="flex gap-8 pb-8 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden group">
          {bestSellingProducts.map((product, index) => (
            <div key={product.id} className="animate-fadeInUp opacity-0 transition-opacity duration-500 group-hover:opacity-70">
              <BestSellerCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Animation styles (same as before, for consistency) */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BestSellingItems;
