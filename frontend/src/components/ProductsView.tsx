"use client";

import { useState, useEffect } from "react";
import api from "@/app/utils/api";
import {
  Package,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import ProductEditModal from "./ProductEditModal";

// --- MODIFIED: Interface for the paginated API response ---
interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  categories: Category[]; 
  image_url: string | null;
  image?: string | null;
}

interface Status {
  message: string;
  type: "success" | "error";
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

const ProductsViewModify = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);

  // --- NEW: State for pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for managing the edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- MODIFIED: useEffect to re-fetch data when currentPage changes ---
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // --- MODIFIED: fetchProducts to handle pagination ---
  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    setStatus(null);
    try {
      // Pass the page number as a query parameter
      const response = await api.get<PaginatedResponse<any>>(
        `/api/products/?page=${page}`
      );
      
      const { results, total_pages } = response.data;

      const formatted: Product[] = results.map((p: any) => ({
        ...p,
        price: parseFloat(p.price) || 0,
      }));

      setProducts(formatted);
      setTotalPages(total_pages); // Update total pages from the API response
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setStatus({
        message: "Could not load products. Please try refreshing the page.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Handlers for pagination controls ---
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this product?"
      )
    ) {
      try {
        await api.delete(`/api/products/${productId}/`);
        // Refetch the current page to ensure data consistency after deletion
        fetchProducts(currentPage);
        setStatus({
          message: "Product deleted successfully.",
          type: "success",
        });
      } catch (err) {
        console.error("Failed to delete product:", err);
        setStatus({
          message: "Could not delete the product. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleSaveSuccess = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setStatus({
      message: `Product "${updatedProduct.name}" updated successfully.`,
      type: "success",
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  if (isLoading && products.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2">
                <div className="h-16 w-16 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-xl font-semibold text-gray-900">
          No Products Found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Looks like you haven&apos;t added any products yet.
        </p>
      </div>
    );
  }

  return (
    <>
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
            <span className="font-medium">{status.message}</span>
          </div>
          <button
            onClick={() => setStatus(null)}
            className="p-1 rounded-full hover:bg-black/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3 text-center">Stock</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imgSrc =
                  resolveImageUrl(product.image ?? product.image_url ?? null) ??
                  undefined;

                return (
                  <tr
                    key={product.id}
                    className="bg-white border-b hover:bg-gray-50 align-middle transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                              unoptimized
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.categories?.length > 0
                        ? product.categories.map((c) => c.name).join(", ")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold leading-tight rounded-full ${
                          product.stock_quantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.stock_quantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock_quantity > 0
                          ? `${product.stock_quantity} in stock`
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          title="Delete Product"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW: Pagination Controls UI --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t rounded-b-lg shadow-md">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex-1 flex justify-end space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProductEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveSuccess}
      />
    </>
  );
};

export default ProductsViewModify;