'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/app/utils/api';
import { Package, AlertCircle, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image'; // Using next/image for better optimization

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
  image_url: string;
}

const ProductsViewModify = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch as `any` to handle the price string from the backend
        const response = await api.get<any[]>('/api/products/');
        
        // ✅ **IMPROVEMENT**: Map response to correctly format data, parsing price string to number
        const formattedProducts: Product[] = response.data.map((product) => ({
          ...product,
          price: parseFloat(product.price) || 0,
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Could not load products. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ **IMPROVEMENT**: Placeholder functions for actions
  const handleEdit = (productId: number) => {
    // TODO: Implement navigation to edit page or open a modal
    alert(`Editing product ID: ${productId}`);
  };

  const handleDelete = (productId: number) => {
    // TODO: Implement confirmation modal and API call to delete
    if (confirm(`Are you sure you want to delete product ID: ${productId}?`)) {
       alert(`Deleting product ID: ${productId}`);
      // Example: setProducts(products.filter(p => p.id !== productId));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-300 rounded-lg"></div> {/* Adjusted for image */}
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

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md relative text-center"
        role="alert"
      >
        <AlertCircle className="inline-block w-6 h-6 mr-2" />
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-xl font-semibold text-gray-900">
          No Products Found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Looks like you haven't added any products yet.
        </p>
      </div>
    );
  }

  return (
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
            {products.map((product) => (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50 align-middle">
                <td className="px-6 py-4">
                  {/* ✅ **IMPROVEMENT**: Product with Image */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {/* <Image
                        className="w-14 h-14 rounded-lg object-cover"
                        src={product.image_url}
                        alt={product.name}
                        width={56}
                        height={56}
                        onError={(e) => {
                          // Fallback for broken image links
                          e.currentTarget.src = 'https://via.placeholder.com/56';
                        }}
                      /> */}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{product.category?.name || 'N/A'}</td>
                <td className="px-6 py-4 font-medium">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${
                      product.stock_quantity > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} in stock`
                      : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* ✅ **IMPROVEMENT**: Action buttons with tooltips and handlers */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(product.id)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsViewModify;