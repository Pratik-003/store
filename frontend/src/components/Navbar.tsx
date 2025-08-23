'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      // The logoutUser function in your context already handles redirection
    } catch (error) {
      console.error("Failed to logout:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Site Title */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-brand-brown-dark hover:text-brand-brown transition-colors">
              Baker's Pantry
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-gray-600 hover:text-brand-brown-dark transition-colors font-medium">
              Home
            </Link>
            <Link href="/recipes" className="text-gray-600 hover:text-brand-brown-dark transition-colors font-medium">
              Recipes
            </Link>
            {user ? (
              <>
                {user.is_admin && (
                  <Link href="/admin" className="text-gray-600 hover:text-brand-brown-dark transition-colors font-medium">
                    Admin
                  </Link>
                )}
                <span className="text-gray-700">Hello, {user.email}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-brown rounded-lg hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-brand-brown-dark transition-colors font-medium">
                  Login
                </Link>
                <Link href="/sign-up" className="ml-4 px-4 py-2 text-sm font-medium text-white bg-brand-brown rounded-lg hover:bg-brand-brown-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-brown"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu open/close */}
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link href="/recipes" className="text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark block px-3 py-2 rounded-md text-base font-medium">
              Recipes
            </Link>
            {user ? (
              <>
                {user.is_admin && (
                  <Link href="/admin" className="text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark block px-3 py-2 rounded-md text-base font-medium">
                    Admin
                  </Link>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                 <span className="text-gray-700 block px-3 py-2 text-base font-medium">Hello, {user.email}!</span>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link href="/login" className="text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark block px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link href="/sign-up" className="text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark block px-3 py-2 rounded-md text-base font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
