"use client";

import React, { useEffect, useState, FormEvent, FC } from "react";
import api from "@/app/utils/api";

// --- TYPE DEFINITIONS ---
interface Address {
  id: number;
  phone: string;
  address_type: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

type NewAddress = Omit<Address, "id">;

// --- SVG ICON COMPONENTS ---
const EditIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const DeleteIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const AddLocationIcon: FC = () => (
  <svg
    className="mx-auto h-12 w-12 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// --- HELPER & UI COMPONENTS ---
interface AddressFormProps {
  address?: Address;
  onSave: (data: Address | NewAddress) => void;
  onClose?: () => void;
}

const AddressForm: FC<AddressFormProps> = ({ address, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    zip_code: address?.zip_code || "",
    phone: address?.phone || "",
    address_type: address?.address_type || "home",
    is_default: address?.is_default || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox =
      type === "checkbox" && e.target instanceof HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? e.target.checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(address ? { ...formData, id: address.id } : formData);
  };

  // Simple validation attributes for inputs
  const validation = {
    phone: { maxLength: 15, type: "tel" },
    city: { maxLength: 100, type: "text" },
    state: { maxLength: 100, type: "text" },
    zip_code: { maxLength: 6, type: "text", pattern: "[0-9]*" },
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 text-left p-6 mt-4 border rounded-xl bg-gray-50/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="street"
            className="block text-sm font-medium text-gray-700"
          >
            Street
          </label>
          <input
            type="text"
            name="street"
            id="street"
            value={formData.street}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        {Object.keys(formData)
          .filter((k) => !["is_default", "address_type", "street"].includes(k))
          .map((key) => {
            const fieldValidation = validation[key as keyof typeof validation];
            return (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-700 capitalize"
                >
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type={fieldValidation?.type || "text"}
                  name={key}
                  id={key}
                  value={formData[key as keyof typeof formData] as string}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  maxLength={fieldValidation?.maxLength}
                  pattern={fieldValidation?.pattern}
                />
              </div>
            );
          })}
        <div>
          <label
            htmlFor="address_type"
            className="block text-sm font-medium text-gray-700"
          >
            Address Type
          </label>
          <select
            name="address_type"
            id="address_type"
            value={formData.address_type}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="flex items-center pt-2">
        <input
          id="is_default"
          name="is_default"
          type="checkbox"
          checked={formData.is_default}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label
          htmlFor="is_default"
          className="ml-2 block text-sm text-gray-900"
        >
          Set as default address
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save {address ? "Changes" : "Address"}
        </button>
      </div>
    </form>
  );
};

const ConfirmDeleteModal: FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
      <h4 className="text-xl font-bold mb-4">Confirm Deletion</h4>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this address? This action cannot be
        undone.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          className="py-2 px-6 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="py-2 px-6 border rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const ApiNotification: FC<{
  message: string;
  type: "error" | "success";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const typeClasses = type === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <div
      className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 ${typeClasses}`}
    >
      <p className="font-bold capitalize">{type}</p>
      <p>{message}</p>
      <button
        onClick={onClose}
        className="absolute top-1 right-2 text-white text-xl font-bold"
      >
        &times;
      </button>
    </div>
  );
};

// --- ADDRESS MANAGER COMPONENT ---
const AddressManager: FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [apiMessage, setApiMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/profile/addresses/");
      setAddresses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch addresses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showApiMessage = (text: string, type: "success" | "error") => {
    setApiMessage({ text, type });
  };

  const handleCreate = async (newAddress: NewAddress) => {
    try {
      await api.post("/api/profile/addresses/", newAddress);
      await fetchAddresses();
      setIsAdding(false);
      showApiMessage("Address created successfully!", "success");
    } catch (err: any) {
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).join(" ")
        : "Error creating address.";
      showApiMessage(errorMsg, "error");
    }
  };

  const handleUpdate = async (addressToUpdate: Address) => {
    try {
      await api.put(
        `/api/profile/addresses/${addressToUpdate.id}/`,
        addressToUpdate
      );
      await fetchAddresses();
      setEditingAddress(null);
      showApiMessage("Address updated successfully!", "success");
    } catch (err: any) {
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).join(" ")
        : "Error updating address.";
      showApiMessage(errorMsg, "error");
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      await api.delete(`/api/profile/addresses/${confirmDeleteId}/`);
      await fetchAddresses();
      showApiMessage("Address deleted successfully!", "success");
    } catch (err: any) {
      showApiMessage(
        err.response?.data?.message || "Error deleting address.",
        "error"
      );
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (isLoading)
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm flex items-center justify-center h-64">
        <p className="text-gray-500">Loading Addresses...</p>
      </div>
    );
  if (error)
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm">
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
          <p>
            <b>Error:</b> {error}
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Addresses</h2>
        {addresses.length > 0 && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {isAdding ? "Cancel" : "+ Add Address"}
          </button>
        )}
      </div>

      {addresses.length === 0 && !isAdding && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50/50">
          <AddLocationIcon />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No addresses found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't added any addresses yet.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsAdding(true)}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Add Your First Address
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {addresses.length === 0
              ? "Add Your First Address"
              : "Add a New Address"}
          </h3>
          <AddressForm
            onSave={handleCreate as (data: Address | NewAddress) => void}
            onClose={() => setIsAdding(false)}
          />
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 border rounded-xl flex justify-between items-start hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800 flex items-center capitalize">
                  {addr.address_type} Address
                  {addr.is_default && (
                    <span className="ml-3 text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-2">{addr.street}</p>
                <p className="text-sm text-gray-600">{`${addr.city}, ${addr.state} ${addr.zip_code}`}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Phone: {addr.phone}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                  onClick={() => setEditingAddress(addr)}
                  aria-label="Edit address"
                >
                  <EditIcon />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  onClick={() => setConfirmDeleteId(addr.id)}
                  aria-label="Delete address"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingAddress && (
        <AddressForm
          address={editingAddress}
          onSave={handleUpdate as (data: Address | NewAddress) => void}
          onClose={() => setEditingAddress(null)}
        />
      )}
      {confirmDeleteId !== null && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {apiMessage && (
        <ApiNotification
          message={apiMessage.text}
          type={apiMessage.type}
          onClose={() => setApiMessage(null)}
        />
      )}
    </div>
  );
};

export default AddressManager;
