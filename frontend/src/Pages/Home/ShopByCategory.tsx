"use client"
import React from 'react';
import { useState } from 'react';

// --- Mock Data ---
// In a real application, you would fetch this data from your backend.
// I've created some sample data that matches the structure you described.
const categoriesData = [
  {
    name: 'Chocolates & Cocoa',
    products: [
      { id: 1, name: 'Dark Chocolate Callets', price: '₹450', image: 'https://images.unsplash.com/photo-1623872413334-a3c5b52b31a8?q=80&w=1887&auto=format&fit=crop' },
      { id: 2, name: 'Premium Cocoa Powder', price: '₹320', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1987&auto=format&fit=crop' },
      { id: 3, name: 'White Chocolate Chips', price: '₹480', image: 'https://images.unsplash.com/photo-1610921204693-8b9e658e466b?q=80&w=1887&auto=format&fit=crop' },
    ],
  },
  {
    name: 'Flours & Mixes',
    products: [
      { id: 4, name: 'Almond Flour', price: '₹750', image: 'https://images.unsplash.com/photo-1607427563720-83f18a6c8c43?q=80&w=1887&auto=format&fit=crop' },
      { id: 5, name: 'Red Velvet Cake Mix', price: '₹250', image: 'https://images.unsplash.com/photo-1604413191066-4dd44bedf130?q=80&w=1887&auto=format&fit=crop' },
      { id: 6, name: 'Whole Wheat Flour', price: '₹180', image: 'https://images.unsplash.com/photo-1627485695229-a11a2f6b0b5c?q=80&w=1887&auto=format&fit=crop' },
    ],
  },
  {
    name: 'Food Coloring',
    products: [
      { id: 7, name: 'Gel Food Color Kit', price: '₹999', image: 'https://images.unsplash.com/photo-1587338428241-b05dc125156a?q=80&w=1887&auto=format&fit=crop' },
      { id: 8, name: 'Liquid Neon Colors', price: '₹650', image: 'https://images.unsplash.com/photo-1558342288-ea6f3c15559d?q=80&w=1887&auto=format&fit=crop' },
      { id: 9, name: 'Edible Gold Dust', price: '₹500', image: 'https://images.unsplash.com/photo-1619920835184-9a4c00922579?q=80&w=1887&auto=format&fit=crop' },
    ],
  },
  {
    name: 'Sprinkles & Toppings',
    products: [
      { id: 10, name: 'Rainbow Sprinkles', price: '₹150', image: 'https://images.unsplash.com/photo-1507066274291-ce37ab7bcf87?q=80&w=1887&auto=format&fit=crop' },
      { id: 11, name: 'Edible Glitter Stars', price: '₹220', image: 'https://images.unsplash.com/photo-1599599810694-b5b38354c038?q=80&w=1887&auto=format&fit=crop' },
      { id: 12, name: 'Roasted Almond Flakes', price: '₹300', image: 'https://images.unsplash.com/photo-1601924352323-876e4c5b6f7a?q=80&w=1887&auto=format&fit=crop' },
    ],
  },
  {
    name: 'Essence & Extracts',
    products: [
      { id: 13, name: 'Madagascar Vanilla Extract', price: '₹850', image: 'https://images.unsplash.com/photo-1631601992233-0c13df136c0a?q=80&w=1887&auto=format&fit=crop' },
      { id: 14, name: 'Rose Essence', price: '₹200', image: 'https://images.unsplash.com/photo-1559529322-3f26d625b59a?q=80&w=1887&auto=format&fit=crop' },
      { id: 15, name: 'Orange Zest Extract', price: '₹280', image: 'https://images.unsplash.com/photo-1619539265238-1e3a2491a35a?q=80&w=1887&auto=format&fit=crop' },
    ],
  },
];

// --- Product Card Component ---
const ProductCard = ({ product }) => (
  <div className="group relative overflow-hidden rounded-lg shadow-lg">
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-4">
      <h3 className="text-white text-lg font-semibold">{product.name}</h3>
      <p className="text-amber-300 mt-1 font-bold">{product.price}</p>
    </div>
    <div className="absolute top-0 right-0 m-3 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
    </div>
  </div>
);


// --- Main Component ---
const ShopByCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState(categoriesData[0].name);

  const activeCategory = categoriesData.find(cat => cat.name === selectedCategory);

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Title */}
        <h2 className="text-base font-semibold tracking-wider text-amber-600 uppercase">
          Explore Our Collection
        </h2>
        <p className="mt-2 text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
          Shop by Category
        </p>

        {/* Category Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-4">
          {categoriesData.map((category) => (
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
          ))}
        </div>

        {/* Product Display Grid */}
        <div 
          key={selectedCategory} // This key is crucial for re-triggering the animation
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeInUp"
        >
          {activeCategory && activeCategory.products.map((product, index) => (
            <div 
              key={product.id}
              // Staggered animation delay for each card
              style={{ animationDelay: `${index * 100}ms` }}
              className="opacity-0" // Initially hidden, animation will make it visible
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      
      {/* We need to define the animation in a style tag or global CSS */}
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
