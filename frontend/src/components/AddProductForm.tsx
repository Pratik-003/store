"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/utils/api";

interface Category {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string | number;
  stock_quantity: string | number;
  category_id: string | number;
}

interface Status {
  message: string;
  type: "success" | "error" | "";
}

function AddProductForm() {
  const { user } = useAuth();
  const [productData, setProductData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category_id: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<Category[]>("/api/products/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setStatus({
          message: "Could not load product categories.",
          type: "error",
        });
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.is_admin) {
      setStatus({
        message: "Permission Denied. You are not authorized to add products.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setStatus({ message: "", type: "" });

    if (
      !productData.name ||
      !productData.price ||
      !productData.category_id ||
      !imageFile
    ) {
      setStatus({
        message: "Please fill all required fields and select an image.",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", String(productData.price));
    formData.append("stock_quantity", String(productData.stock_quantity));
    formData.append("category_id", String(productData.category_id));
    formData.append("image", imageFile);

    try {
      const response = await api.post("/api/products/", formData);
      const newProduct = response.data;

      setStatus({
        message: `Product "${newProduct.name}" added successfully!`,
        type: "success",
      });
      setProductData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category_id: "",
      });
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Failed to add product:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage =
            "Permission denied. You must be an admin to add products.";
        } else if (error.response.data) {
          const errorData = error.response.data;
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
            .join(" | ");
        }
      }
      setStatus({ message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          Access Denied 🚫
        </h2>
        <p className="text-gray-700">
          You do not have the required permissions to add new products.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Add a New Product 📦
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
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
              value={productData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={productData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              min="0.01"
              step="0.01"
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
              value={productData.stock_quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              min="0"
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
              value={productData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={productData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept="image/*"
              required
            />
          </div>
        </div>

        {status.message && (
          <div
            className={`mt-4 text-sm text-center p-3 rounded-md ${
              status.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="mt-8 text-right">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductForm;
