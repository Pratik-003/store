'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useCart } from '@/app/context/AuthContext';


const CartIcon = () => (
    <svg className="h-6 w-6 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const MenuIcon = () => (
    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
);
const CloseIcon = () => (
    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);


const UserAvatar = ({ username }) => {
    const initial = username ? username.charAt(0).toUpperCase() : '?';
    return (
        <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
            {initial}
        </div>
    );
};


const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const { cartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200";

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                BakeBasket
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              <Link href="/" className={navLinkClasses}>Home</Link>
              <Link href="/product" className={navLinkClasses}>Products</Link>
              {user?.is_admin && <Link href="/admin" className={navLinkClasses}>Admin</Link>}
            </div>

            {/* Right side items container */}
            <div className="flex items-center space-x-4">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <UserAvatar username={user.username} />
                      <span className="text-sm font-medium text-gray-700">Hi, {user.username}</span>
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Login</Link>
                    <Link href="/sign-up" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-sm">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart (Visible on all screen sizes) - MOVED HERE */}
              <div className="flex items-center">
                <Link href="/cart" className="group -m-2 flex items-center p-2 relative">
                  <CartIcon />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-2 text-xs font-bold text-white bg-amber-500 rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-gray-700">
                  <MenuIcon />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      {/* Overlay */}
      <div 
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-bold text-lg">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md text-gray-500 hover:text-gray-700">
                <CloseIcon />
            </button>
        </div>
        <div className="p-4">
            <div className="space-y-2">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Home</Link>
                <Link href="/product" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Products</Link>
                {user?.is_admin && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Admin</Link>
                )}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
            {user ? (
                <>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                    <UserAvatar username={user.username} />
                    <span>Profile ({user.username})</span>
                </Link>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                    Logout
                </button>
                </>
            ) : (
                <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Login</Link>
                <Link href="/sign-up" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Sign Up
                </Link>
                </>
            )}
            </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;