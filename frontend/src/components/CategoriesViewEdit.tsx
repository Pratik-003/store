"use client";

import { useState, useEffect, FormEvent } from "react";
import api from "@/app/utils/api";
import {
  Tag,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  X,
  PlusCircle,
} from "lucide-react";

//=========== INTERFACES ===========//

interface Category {
  id: number;
  name: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = category !== null;

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || "");
      setError(null); // Reset error when modal opens or category changes
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = { name };

    try {
      let response;
      if (isEditing) {
        // PUT request to update existing category
        response = await api.put<Category>(
          `/api/products/categories/${category.id}/`,
          payload
        );
      } else {
        // POST request to create a new category
        response = await api.post<Category>(
          "/api/products/categories/",
          payload
        );
      }
      onSave(response.data);
      onClose();
    } catch (err: any) {
      console.error("Failed to save category:", err);
      const errorMessage =
        err.response?.data?.name?.[0] || // Handle specific field errors from DRF
        err.response?.data?.detail ||
        "An unexpected error occurred.";
      setError(`Failed to save: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Category" : "Create New Category"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end items-center pt-4 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-white border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Create Category"}
              </button>
            </div>
          </form>
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
        prev.map((c) => (c.id === savedCategory.id ? savedCategory : c))
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