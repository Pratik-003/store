"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/app/utils/api";
import { useAuth, useCart as useCartContext } from "@/app/context/AuthContext";

// --- (Interfaces and other components remain the same) ---
//=========== INTERFACES ===========//
interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  quantity: number;
  total_price: string;
  product_image: string;
}

interface CartApiResponse {
  cart_id: number;
  total_items: number;
  total_price: number;
  items: CartItem[];
}

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

//=========== UTILITY & ICONS ===========//
const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));

const API_BASE_URL = "http://127.0.0.1:8000";

const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" /></svg>;
const MinusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const LoaderIcon = () => <svg className="animate-spin h-8 w-8 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

//=========== ADDRESS SELECTION COMPONENT ===========//
interface AddressSelectionProps {
  selectedAddressId: number | null;
  onSelectAddress: (id: number) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ selectedAddressId, onSelectAddress }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("/api/profile/addresses/");
        setAddresses(response.data);
        const defaultAddress = response.data.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          onSelectAddress(defaultAddress.id);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch addresses.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, [onSelectAddress]);

  if (isLoading) return <div className="p-4 text-center">Loading addresses...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
      {addresses.length === 0 ? (
        <div className="text-center p-4 mt-4 border-2 border-dashed rounded-lg">
          <p className="text-gray-600">No addresses found.</p>
          <Link href="/profile" className="text-amber-600 hover:underline font-medium">
            Add an address to your profile to continue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className={`p-5 border rounded-xl cursor-pointer transition-all ${
                selectedAddressId === addr.id
                  ? "border-gray-800 bg-slate-100 ring-2 ring-gray-800"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800 flex items-center capitalize">
                  {addr.address_type} Address
                  {addr.is_default && <span className="ml-3 text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full">Default</span>}
                </p>
                <p className="text-sm text-gray-600 mt-2">{addr.street}</p>
                <p className="text-sm text-gray-600">{`${addr.city}, ${addr.state} ${addr.zip_code}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


//=========== MAIN CART PAGE COMPONENT ===========//
const CartPage = () => {
  const { user } = useAuth();
  const { fetchCartCount } = useCartContext();
  const router = useRouter();
  const [cart, setCart] = useState<CartApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // --- (fetchCartData, handleUpdateQuantity, handleRemoveItem remain the same) ---
  const fetchCartData = async () => {
    if (!user) {
      setIsLoading(false);
      setError("Please log in to view your cart.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get<CartApiResponse>("/api/orders/cart/");
      setCart(response.data);
      setError(null);
    } catch (err: any) {
      setCart(err.response?.status === 404 ? null : cart);
      setError(err.response?.status !== 404 ? "Could not load your cart." : null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [user]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return await handleRemoveItem(itemId);
    try {
      await api.put(`/api/orders/cart/update/${itemId}/`, { quantity: newQuantity });
      await fetchCartData();
      await fetchCartCount();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await api.delete(`/api/orders/cart/remove/${itemId}/`);
      await fetchCartData();
      await fetchCartCount();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };


  // ✨ MODIFIED: Handle Proceed to Pay
  const handleProceedToPay = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const response = await api.post("/api/orders/order/create/", {
        address_id: selectedAddressId,
        payment_method: "upi", // Hardcoded as requested
      });

      // ✅ STEP 1: Store the full API response in sessionStorage
      sessionStorage.setItem('currentOrderDetails', JSON.stringify(response.data));

      // Get order number for the URL
      const orderNumber = response.data.order.order_number;

      // ✅ STEP 2: Redirect to the payment page
      router.push(`/payment?order_number=${orderNumber}`);

    } catch (err: any) {
      console.error("Failed to create order:", err);
      alert(err.response?.data?.error || "Could not create order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  const subtotal = cart?.total_price || 0;
  const shippingCost = subtotal > 0 ? 50.0 : 0;
  const total = subtotal + shippingCost;

  // --- (JSX for rendering remains the same) ---
  if (isLoading && !cart) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <LoaderIcon />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
          {error && <p className="text-red-500 text-center bg-red-50 p-4 rounded-lg">{error}</p>}
          {!isLoading && !error && (!cart || cart.items.length === 0) ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
              <Link href="/product" className="mt-6 inline-block px-8 py-3 text-white font-semibold bg-gray-800 rounded-lg hover:bg-black">Start Shopping</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md relative">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cart Items</h2>
                  <ul role="list" className="divide-y divide-gray-200">
                    {cart?.items.map((item) => (
                      <li key={item.id} className="flex py-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img src={`${API_BASE_URL}${item.product_image}`} alt={item.product_name} className="h-full w-full object-cover object-center" />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.product_name}</h3>
                              <p className="ml-4">{formatCurrency(item.total_price)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{formatCurrency(item.product_price)} each</p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-500 hover:text-black"><MinusIcon /></button>
                              <span className="w-10 text-center">{item.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-500 hover:text-black"><PlusIcon /></button>
                            </div>
                            <div className="flex">
                              <button onClick={() => handleRemoveItem(item.id)} type="button" className="font-medium text-amber-600 hover:text-amber-500 flex items-center gap-1"><TrashIcon /> Remove</button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <AddressSelection selectedAddressId={selectedAddressId} onSelectAddress={setSelectedAddressId} />
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Order Summary</h2>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(shippingCost)}</span></div>
                    <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
                  </div>
                  <button
                    onClick={handleProceedToPay}
                    disabled={!selectedAddressId || isPlacingOrder}
                    className="mt-6 w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex justify-center items-center"
                  >
                    {isPlacingOrder ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (selectedAddressId ? 'Proceed to Pay' : 'Select an Address')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;