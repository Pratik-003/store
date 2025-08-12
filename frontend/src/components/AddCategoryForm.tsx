'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/utils/api';


interface CategoryData {
  name: string;
  description: string;
}

interface Status {
  message: string;
  type: 'success' | 'error' | '';
}

export default function AddCategoryForm() {
  const { user } = useAuth(); 
  const [categoryData, setCategoryData] = useState<CategoryData>({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ message: '', type: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: '', type: '' });


    if (!user?.is_admin) {
      setStatus({ message: 'Permission Denied. You are not authorized to add categories.', type: 'error' });
      setIsLoading(false);
      return;
    }

    if (!categoryData.name) {
      setStatus({ message: 'Category name is required.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/products/categories/', categoryData);
      
      const newCategory = response.data;
      setStatus({ message: `Category "${newCategory.name}" added successfully!`, type: 'success' });
      setCategoryData({ name: '', description: '' }); 

    } catch (error: any) {
      console.error('Failed to add category:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Permission denied. You must be an admin to perform this action.';
        } else if (error.response.data) {
          const errorData = error.response.data;
           if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
             errorMessage = Object.entries(errorData)
              .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
              .join(' | ');
          }
        }
      }
      setStatus({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };


  if (!user?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied 🚫</h2>
        <p className="text-gray-700">You do not have the required permissions to add new categories.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add a New Category 📂</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" name="name" id="name" value={categoryData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" id="description" value={categoryData.description} onChange={handleChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
        </div>
        
        {status.message && (
          <div className={`mt-4 text-sm text-center p-3 rounded-md ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.message}
          </div>
        )}

        <div className="mt-8 text-right">
          <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
}