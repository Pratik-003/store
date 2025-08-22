"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import api from "@/app/utils/api";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: Category;
  image_url: string | null;
  image?: string | null;
}

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const resolveImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (api as any)?.defaults?.baseURL as string | undefined;
  if (base) {
    const origin = base.replace(/\/+$/, "").replace(/\/api\/?$/, "");
    return `${origin}${path}`;
  }
  return path;
};

const ProductEditModal = ({
  product,
  isOpen,
  onClose,
  onSave,
}: ProductEditModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category_id: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const response = await api.get<Category[]>(
            "/api/products/categories/"
          );
          setCategories(response.data);
        } catch (err) {
          console.error("Failed to fetch categories:", err);
          setError("Could not load product categories. Please try again.");
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        stock_quantity: String(product.stock_quantity),
        category_id: String(product.category?.id || ""),
      });
      setCurrentImageUrl(resolveImageUrl(product.image ?? product.image_url));
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsLoading(true);
    setError(null);

    // Use FormData to handle multipart/form-data, including the file
    const submissionData = new FormData();
    submissionData.append("name", formData.name);
    submissionData.append("description", formData.description);
    submissionData.append("price", formData.price);
    submissionData.append("stock_quantity", formData.stock_quantity);
    submissionData.append("category_id", formData.category_id);

    // IMPORTANT: Only append the image if a new one has been selected.
    // The backend will keep the old image if this field is omitted.
    if (imageFile) {
      submissionData.append("image", imageFile);
    }

    try {
      // Use PUT request with FormData. Axios handles the headers.
      const response = await api.put<Product>(
        `/api/products/${product.id}/`,
        submissionData
      );

      const updatedCategory =
        categories.find((c) => c.id === parseInt(formData.category_id)) ||
        product.category;
      const finalProduct = { ...response.data, category: updatedCategory };

      onSave(finalProduct);
      onClose();
    } catch (err: any) {
      console.error("Failed to update product:", err);
      const errorMessage =
        err.response?.data?.detail || "An unexpected error occurred.";
      setError(`Failed to save product: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Product: {product?.name}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Form fields for text data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  name="category_id"
                  id="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (INR)
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="stock_quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  id="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="mt-2 flex items-center gap-4">
                <span className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 border">
                  {currentImageUrl ? (
                    <Image
                      src={currentImageUrl}
                      alt="Current product"
                      width={80}
                      height={80}
                      className="object-cover h-full w-full"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </span>
                <div className="flex-grow">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm flex items-center justify-center text-sm">
                      <UploadCloud className="w-5 h-5 mr-2 text-gray-500" />
                      <span>
                        {imageFile ? "Change image" : "Upload new image"}
                      </span>
                    </div>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  {imageFile && (
                    <p className="text-xs text-gray-600 mt-2">
                      New file selected: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Leave blank to keep the current image.
              </p>
            </div>

            <div className="flex justify-end items-center pt-5 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
