// in /app/profile/page.tsx

'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const ProfilePage = () => {
  const { user, logoutUser } = useAuth(); // Destructure logoutUser
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Show a loading or placeholder state while user object is being populated
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // Format the date to be more readable
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            My Profile
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-lg font-semibold text-gray-900">{user.username}</p>
            </div>
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.is_admin ? 'Administrator' : 'User'}
              </p>
            </div>
            <div className="p-4 border-t border-b border-gray-200">
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">{memberSince}</p>
            </div>
          </div>
          
          <div>
            {/* --- NEW: Logout Button --- */}
            <button
              onClick={logoutUser}
              type="button"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="text-center">
             <Link href="/" className="font-medium text-brand-brown hover:text-brand-brown-dark">
                ← Back to Home
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;