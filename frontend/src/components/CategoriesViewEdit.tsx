"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import api from "@/app/utils/api";
import {
  Tag,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  X,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

//=========== INTERFACES ===========//

interface Product {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  products?: Product[]; // products are optional in the main list view
}

interface CategoryDetail extends Category {
  products: Product[]; // products are required in the detail view
}

// --- NEW: Interface for paginated API responses ---
interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface Status {
  message: string;
  type: "success" | "error";
}

//=========== EDIT/CREATE MODAL COMPONENT ===========//

interface CategoryModalProps {
  category: Category | null; // null for creating, Category object for editing
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedCategory: Category) => void;
}

const CategoryModal = ({
  category,
  isOpen,
  onClose,
  onSave,
}: CategoryModalProps) => {
  const [name, setName] = useState("");
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = category !== null;

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setAssignedSearch("");
    setAvailableSearch("");

    if (isEditing && category) {
      setName(category.name);
      setIsDetailsLoading(true);

      const fetchCategoryDetails = async () => {
        try {
          // Fetch both category details and all products in parallel
          const [catDetailsRes, allProductsRes] = await Promise.all([
            api.get<CategoryDetail>(`/api/products/categories/${category.id}/`),
            // --- MODIFIED: Expect a PaginatedResponse, not a direct array ---
            api.get<PaginatedResponse<Product>>("/api/products/"),
          ]);

          const categoryDetails = catDetailsRes.data;
          // --- MODIFIED: Extract products from the 'results' key ---
          const allProducts = allProductsRes.data.results;

          const assignedIds = new Set(
            categoryDetails.products.map((p) => p.id)
          );

          setAssignedProducts(categoryDetails.products);
          setAvailableProducts(
            allProducts.filter((p) => !assignedIds.has(p.id))
          );
        } catch (err) {
          console.error("Failed to fetch category details:", err);
          setError("Could not load product assignment data.");
        } finally {
          setIsDetailsLoading(false);
        }
      };
      fetchCategoryDetails();
    } else {
      // Reset for "Create" mode
      setName("");
      setAssignedProducts([]);
      setAvailableProducts([]);
    }
  }, [category, isOpen, isEditing]);

  const handleAddProduct = (productToAdd: Product) => {
    setAvailableProducts((prev) => prev.filter((p) => p.id !== productToAdd.id));
    setAssignedProducts((prev) => [...prev, productToAdd].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleRemoveProduct = (productToRemove: Product) => {
    setAssignedProducts((prev) => prev.filter((p) => p.id !== productToRemove.id));
    setAvailableProducts((prev) => [...prev, productToRemove].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && category) {
        // --- UPDATE LOGIC ---
        const nameUpdatePromise = api.put<Category>(
          `/api/products/categories/${category.id}/`,
          { name }
        );

        const productUpdatePromise = api.put(
          `/api/products/categories/${category.id}/products/`,
          { product_ids: assignedProducts.map((p) => p.id) }
        );

        const [nameUpdateResponse] = await Promise.all([
          nameUpdatePromise,
          productUpdatePromise,
        ]);
        
        onSave(nameUpdateResponse.data);

      } else {
        // --- CREATE LOGIC ---
        const response = await api.post<Category>("/api/products/categories/", {
          name,
        });
        onSave(response.data);
      }
      onClose();
    } catch (err: any) {
      console.error("Failed to save category:", err);
      const errorMessage =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        "An unexpected error occurred.";
      setError(`Failed to save: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvailable = useMemo(() =>
    availableProducts.filter(p => p.name.toLowerCase().includes(availableSearch.toLowerCase())),
    [availableProducts, availableSearch]
  );
  const filteredAssigned = useMemo(() =>
    assignedProducts.filter(p => p.name.toLowerCase().includes(assignedSearch.toLowerCase())),
    [assignedProducts, assignedSearch]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? `Edit Category: ${category?.name}` : "Create New Category"}
            </h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* --- MODIFIED: Added id="category-form" --- */}
        <form id="category-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)}
                className="block w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required/>
            </div>

            {isEditing && (
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">Manage Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {isDetailsLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                        <p className="text-indigo-600 font-semibold animate-pulse">Loading Products...</p>
                    </div>
                  )}
                  {/* Available Products Column */}
                  <div className="border rounded-lg p-3 flex flex-col">
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input type="text" placeholder="Search available..." value={availableSearch} onChange={e => setAvailableSearch(e.target.value)} className="w-full pl-8 pr-2 py-1.5 border rounded-md text-sm"/>
                      </div>
                      <h5 className="font-semibold mb-2 text-center text-gray-700">Available Products</h5>
                      <div className="overflow-y-auto h-64 bg-gray-50 rounded p-1 space-y-1">
                        {filteredAvailable.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                            <span className="text-sm">{p.name}</span>
                            <button type="button" onClick={() => handleAddProduct(p)} className="p-1 text-green-600 hover:bg-green-100 rounded-full"><ChevronRight className="w-5 h-5"/></button>
                          </div>
                        ))}
                      </div>
                  </div>

                  {/* Assigned Products Column */}
                  <div className="border rounded-lg p-3 flex flex-col">
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input type="text" placeholder="Search in category..." value={assignedSearch} onChange={e => setAssignedSearch(e.target.value)} className="w-full pl-8 pr-2 py-1.5 border rounded-md text-sm"/>
                      </div>
                      <h5 className="font-semibold mb-2 text-center text-gray-700">Products in this Category</h5>
                      <div className="overflow-y-auto h-64 bg-gray-50 rounded p-1 space-y-1">
                        {filteredAssigned.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                            <button type="button" onClick={() => handleRemoveProduct(p)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><ChevronLeft className="w-5 h-5"/></button>
                            <span className="text-sm">{p.name}</span>
                          </div>
                        ))}
                      </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border rounded-md hover:bg-gray-50">
            Cancel
          </button>
           {/* --- MODIFIED: Removed onClick, rely on form's onSubmit --- */}
          <button type="submit" form="category-form" disabled={isLoading || isDetailsLoading} className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};


//=========== MAIN VIEW COMPONENT ===========//

const CategoriesViewEdit = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const response = await api.get<Category[]>("/api/products/categories/");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setStatus({
        message: "Could not load categories. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This might affect products associated with it."
      )
    ) {
      try {
        await api.delete(`/api/products/categories/${categoryId}/`);
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        setStatus({
          message: "Category deleted successfully.",
          type: "success",
        });
      } catch (err) {
        console.error("Failed to delete category:", err);
        setStatus({
          message: "Could not delete category. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleSaveSuccess = (savedCategory: Category) => {
    const isUpdating = categories.some((c) => c.id === savedCategory.id);
    if (isUpdating) {
      setCategories((prev) =>
        prev.map((c) => (c.id === savedCategory.id ? { ...c, name: savedCategory.name } : c))
      );
      setStatus({
        message: `Category "${savedCategory.name}" updated.`,
        type: "success",
      });
    } else {
      setCategories((prev) => [...prev, savedCategory]);
      setStatus({
        message: `Category "${savedCategory.name}" created.`,
        type: "success",
      });
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Category
        </button>
      </div>

      {status && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between shadow-sm ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {status.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3" />
            )}
            <span>{status.message}</span>
          </div>
          <button onClick={() => setStatus(null)} className="p-1 rounded-full hover:bg-black/10">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Category Name</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          title="Delete Category"
                          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-gray-900">
              No Categories Found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Click &quot;Create Category&quot; to add your first one.
            </p>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSave={handleSaveSuccess}
      />
    </>
  );
};

export default CategoriesViewEdit;