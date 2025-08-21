// /app/admin/page.jsx

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
  FolderPlus, // Import a new icon for categories
} from 'lucide-react';




import AddCategoryForm from '@/components/AddCategoryForm';
import AddProductForm from '@/components/AddProductForm';
import ProductsViewModify from '@/components/ProductsView';
// =================================================================
//  Reusable Components (StatCard, Header) - NO CHANGES NEEDED
// =================================================================
function StatCard({ icon, title, value, change }) { /* ... no changes ... */ }
function Header({ toggleSidebar, pageTitle }) { /* ... no changes ... */ }


// =================================================================
//  Sidebar Component - MODIFIED
// =================================================================
function Sidebar({ isSidebarOpen, setActiveView, activeView }) {
  const menuItems = [
    { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { name: 'Add Product', view: 'addProduct', icon: PlusCircle },
    { name: 'Add Category', view: 'addCategory', icon: FolderPlus }, // <-- ADD THIS
    { name: 'Products', view: 'products', icon: Package },
    { name: 'Settings', view: 'settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } sm:translate-x-0`}
      aria-label="Sidebar"
    >
        {/* ... rest of the sidebar is unchanged ... */}
         <div className="h-full px-3 py-4 overflow-y-auto">
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
             <div className="absolute bottom-0 w-full p-4 left-0">
                 <div className="flex items-center p-2 rounded-lg bg-gray-700">
                     <UserCircle className="w-8 h-8 text-gray-400" />
                     <div className="ms-3">
                         <p className="text-sm font-semibold">Admin User</p>
                         <p className="text-xs text-gray-400">admin@example.com</p>
                     </div>
                 </div>
             </div>
         </div>
    </aside>
  );
}

// =================================================================
//  View Components - NO CHANGES NEEDED
// =================================================================
function DashboardView() { /* ... no changes ... */ }
function ProductsView() { /* ... no changes ... */ }
function SettingsView() { /* ... no changes ... */ }


// =================================================================
//  Main Admin Page Component - MODIFIED
// =================================================================
export default function AdminPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const viewTitles = {
    dashboard: 'Dashboard',
    addProduct: 'Add New Product',
    addCategory: 'Add New Category', // <-- ADD THIS
    products: 'Manage Products',
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
        return <ProductsViewModify/>
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