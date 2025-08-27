'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useCart } from '@/app/context/AuthContext';

// --- NEW: Cart Icon Component ---
const CartIcon = () => (
    <svg className="h-6 w-6 flex-shrink-0 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const { cartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Site Title */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-black transition-colors">
              Baker's Pantry
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Home</Link>
            <Link href="/product" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Products</Link>
            
            {user ? (
              <>
                {user.is_admin && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Admin</Link>
                )}
                <Link href="/profile" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Hello, {user.username}!</Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-black transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Login</Link>
                <Link href="/sign-up" className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-black transition-colors">Sign Up</Link>
              </>
            )}

            {/* Cart Link with Count */}
            <div className="ml-4 flow-root lg:ml-6 border-l pl-6 border-gray-200">
                <Link href="/cart" className="group -m-2 flex items-center p-2 relative">
                    <CartIcon />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-2 text-xs font-bold text-white bg-amber-600 rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {cartItemCount}
                        </span>
                    )}
                    <span className="sr-only">items in cart, view bag</span>
                </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             {/* Mobile Cart Icon */}
             <Link href="/cart" className="group -m-2 flex items-center p-2 relative mr-2">
                <CartIcon />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-2 text-xs font-bold text-white bg-amber-600 rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                    </span>
                )}
             </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link href="/product" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Products</Link>
            {user ? (
              <>
                {user.is_admin && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Admin</Link>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Hello, {user.username}!</Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left text-gray-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Login</Link>
                <Link href="/sign-up" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

