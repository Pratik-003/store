'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  UserCircle,
  Menu,
  DollarSign,
  Users,
  ShoppingCart,
  FolderPlus,
  LogOut, // <-- Import LogOut icon
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import AddCategoryForm from '@/components/AddCategoryForm';
import AddProductForm from '@/components/AddProductForm';
import ProductsViewModify from '@/components/ProductsView';
import CategoriesViewEdit from '@/components/CategoriesViewEdit';

function StatCard({ icon, title, value, change }) { /* ... no changes ... */ }
function Header({ toggleSidebar, pageTitle }) { /* ... no changes ... */ }

// =================================================================
//  Sidebar Component - MODIFIED
// =================================================================
function Sidebar({ isSidebarOpen, setActiveView, activeView }) {
  const { user, logoutUser } = useAuth(); // <-- Use the auth context

  const menuItems = [
    { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { name: 'Add Product', view: 'addProduct', icon: PlusCircle },
    { name: 'Add Category', view: 'addCategory', icon: FolderPlus },
    { name: 'Products', view: 'products', icon: Package },
    { name: 'Categories', view: 'categories', icon: Package },
    { name: 'Settings', view: 'settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } sm:translate-x-0`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
        <div>
          <div className="p-4 mb-4">
            <h1 className="text-2xl font-semibold whitespace-nowrap">AdminPanel</h1>
          </div>
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveView(item.view)}
                  className={`flex items-center p-2 rounded-lg w-full text-left hover:bg-gray-700 group ${
                    activeView === item.view ? 'bg-gray-700' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 text-gray-400 transition duration-75 group-hover:text-white" />
                  <span className="ms-3">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Info and Logout Button */}
        <div className="mt-auto pt-4">
          <div className="flex items-center p-2 rounded-lg bg-gray-900/50 mb-2">
            <UserCircle className="w-8 h-8 text-gray-400 flex-shrink-0" />
            <div className="ms-3 overflow-hidden">
              <p className="text-sm font-semibold truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">
                {user ? user.email : "Loading..."}
              </p>
            </div>
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center p-2 rounded-lg w-full text-left text-red-400 hover:bg-red-500 hover:text-white group transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="ms-3 font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}


function DashboardView() { /* ... no changes ... */ }
function SettingsView() { /* ... no changes ... */ }


// =================================================================
//  Main Admin Page Component
// =================================================================
export default function AdminPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const viewTitles = {
    dashboard: 'Dashboard',
    addProduct: 'Add New Product',
    addCategory: 'Add New Category',
    products: 'Manage Products',
    categories: 'Manage Categories', // Corrected typo from 'cachesories'
    settings: 'Settings',
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'addProduct':
        return <AddProductForm />;
      case 'addCategory':
        return <AddCategoryForm />;
      case 'products':
        return <ProductsViewModify />
      case 'categories':
        return <CategoriesViewEdit />
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setActiveView={setActiveView}
        activeView={activeView}
      />

      <div className="sm:ml-64">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        <Header toggleSidebar={toggleSidebar} pageTitle={viewTitles[activeView]} />
        <main className="p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}