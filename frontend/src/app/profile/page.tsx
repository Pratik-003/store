'use client';

import React, { useEffect, FC } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import AddressManager from '@/components/AddressManager';

// --- TYPE DEFINITIONS ---
interface User {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at?: string; 
}

// --- SVG ICON COMPONENTS ---
const LogoutIcon: FC = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

// --- PROFILE SIDEBAR COMPONENT ---
const ProfileSidebar: FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const userInitials = user.username.substring(0, 2).toUpperCase();
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm h-full flex flex-col">
            <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">{userInitials}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="flex-grow"></div>
            <div className="mt-6">
                <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <LogoutIcon />
                    <span className="ml-4 font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

// --- PROFILE DETAILS CARD COMPONENT ---
const ProfileDetailsCard: FC<{ user: User }> = ({ user }) => {
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A';
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm font-medium text-gray-500">Username</span>
                    <span className="text-md font-semibold text-gray-800">{user.username}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm font-medium text-gray-500">Email Address</span>
                    <span className="text-md font-semibold text-gray-800">{user.email}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm font-medium text-gray-500">Role</span>
                    <span className="text-md font-semibold text-gray-800">{user.is_admin ? 'Administrator' : 'Customer'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Member Since</span>
                    <span className="text-md font-semibold text-gray-800">{memberSince}</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PROFILE PAGE COMPONENT ---
const ProfilePage: FC = () => {
    const { user, logoutUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><p>Loading Profile...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Account</h1>
                    <p className="text-md text-gray-600 mt-1">View and manage your account details and saved addresses.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 lg:sticky lg:top-8">
                        <ProfileSidebar user={user as User} onLogout={logoutUser} />
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <ProfileDetailsCard user={user as User} />
                        <AddressManager /> {/* Use the imported component here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;