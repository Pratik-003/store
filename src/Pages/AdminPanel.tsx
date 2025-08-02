"use client";

import React, { useEffect, useState, useRef } from "react";

// --- SVG Icons (No external library needed) ---
const IconPackage = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>);
const IconTag = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>);
const IconTrash = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const IconPlusCircle = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>);
const IconLoader = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);

// --- Reusable Form & UI Elements (Styled with Tailwind) ---
const FormInput = (props) => <input {...props} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />;
const FormTextarea = (props) => <textarea {...props} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />;
const FormSelect = ({ children, ...props }) => <select {...props} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}>{children}</select>;


// Helper component for managing Categories
const CategoryManager = ({ categories, fetchCategories }) => {
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef(null);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(categoryForm) });
    setCategoryForm({ name: "", description: "" });
    await fetchCategories();
    setIsSaving(false);
    dialogRef.current?.close();
  };

  const deleteCategory = async (id) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manage Categories</h3>
        <button onClick={() => dialogRef.current?.showModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <IconPlusCircle className="h-5 w-5" /> Add Category
        </button>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                    <td className="px-6 py-4">{cat.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="h-32 text-center text-gray-500 dark:text-gray-400">No categories found. Let's add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <dialog ref={dialogRef} className="p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-md">
        <form onSubmit={handleCategorySubmit} className="bg-white dark:bg-gray-800 rounded-lg">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold">New Category</h3>
            <p className="text-sm text-gray-500">Fill in the details below.</p>
          </div>
          <div className="p-6 space-y-4">
            <FormInput placeholder="Category Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
            <FormTextarea placeholder="Category Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center justify-center w-32 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {isSaving ? <IconLoader className="h-5 w-5 animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

// Helper component for managing Products
const ProductManager = ({ products, categories, fetchProducts }) => {
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock_quantity: "", image_url: "", category_id: "" });
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef(null);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(productForm) });
    setProductForm({ name: "", description: "", price: "", stock_quantity: "", image_url: "", category_id: "" });
    await fetchProducts();
    setIsSaving(false);
    dialogRef.current?.close();
  };

  const deleteProduct = async (id) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const getCategoryName = (id) => categories.find(cat => cat.id.toString() === id.toString())?.name || "N/A";
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manage Products</h3>
        <button onClick={() => dialogRef.current?.showModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <IconPlusCircle className="h-5 w-5" /> Add Product
        </button>
      </div>
       <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {prod.image_url ? <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-gray-500">{prod.name.substring(0, 2).toUpperCase()}</span>}
                        </div>
                        <div>
                          <div className="font-bold">{prod.name}</div>
                          <div className="text-xs text-gray-500">{getCategoryName(prod.category_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${prod.stock_quantity > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                        {prod.stock_quantity > 0 ? `${prod.stock_quantity} in stock` : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">₹{prod.price}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteProduct(prod.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="h-32 text-center text-gray-500 dark:text-gray-400">No products found. Add one to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <dialog ref={dialogRef} className="p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-lg">
        <form onSubmit={handleProductSubmit} className="bg-white dark:bg-gray-800 rounded-lg">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold">New Product</h3>
            <p className="text-sm text-gray-500">Fill in the product details below.</p>
          </div>
          <div className="p-6 space-y-4">
            <FormInput placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <FormTextarea placeholder="Product Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput placeholder="Price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
              <FormInput placeholder="Stock Quantity" type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} required />
            </div>
            <FormInput placeholder="Image URL" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} />
            <FormSelect value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} required>
              <option value="" disabled>Select a Category</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id.toString()}>{cat.name}</option>))}
            </FormSelect>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center justify-center w-32 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {isSaving ? <IconLoader className="h-5 w-5 animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};


// Main Admin Panel Component
export default function AdminPanel() {
  const [activeView, setActiveView] = useState("products");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchAllData = async () => {
    const [catRes, prodRes] = await Promise.all([fetch("/api/categories"), fetch("/api/products")]);
    const [catData, prodData] = await Promise.all([catRes.json(), prodRes.json()]);
    setCategories(catData);
    setProducts(prodData);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const viewTitles = { products: "Products Dashboard", categories: "Categories Dashboard" };
  const commonButtonClasses = "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors";
  const activeButtonClasses = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300";
  const inactiveButtonClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <aside className="w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hidden md:flex">
        <div className="flex items-center gap-2 mb-8">
          <IconPackage className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">MyPanel</h2>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveView("products")} className={`${commonButtonClasses} ${activeView === "products" ? activeButtonClasses : inactiveButtonClasses}`}>
            <IconPackage className="h-5 w-5" /> Products
          </button>
          <button onClick={() => setActiveView("categories")} className={`${commonButtonClasses} ${activeView === "categories" ? activeButtonClasses : inactiveButtonClasses}`}>
            <IconTag className="h-5 w-5" /> Categories
          </button>
        </nav>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
          <h1 className="text-xl font-semibold">{viewTitles[activeView]}</h1>
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">AD</div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {activeView === "products" && <ProductManager products={products} categories={categories} fetchProducts={fetchAllData} />}
          {activeView === "categories" && <CategoryManager categories={categories} fetchCategories={fetchAllData} />}
        </main>
      </div>
    </div>
  );
}