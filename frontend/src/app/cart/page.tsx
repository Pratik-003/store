"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/app/utils/api";
import { useAuth, useCart as useCartContext } from "@/app/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

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

// ✨ NEW: Interface for the pending order error (unchanged)
interface PendingOrderError {
  id: string; // order_number of the pending order
  error: string;
}

//=========== UTILITY & ICONS ===========//
const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));

const API_BASE_URL = "http://127.0.0.1:8000";

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
  </svg>
);
const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const LoaderIcon = () => (
  <svg className="animate-spin h-8 w-8 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const WarningIcon = () => (
  <svg className="h-12 w-12 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

//=========== ADDRESS SELECTION COMPONENT (UI-polish only) ===========//
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

  if (isLoading) return <div className="p-4 text-center text-sm text-gray-600">Loading addresses…</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Address</h2>

      {addresses.length === 0 ? (
        <div className="text-center p-6 mt-4 border-2 border-dashed rounded-2xl bg-slate-50">
          <p className="text-gray-600">No addresses found.</p>
          <Link href="/profile" className="inline-block mt-2 text-amber-700 hover:underline font-medium">
            Add an address to your profile
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const active = selectedAddressId === addr.id;
            return (
              <button
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`group text-left p-5 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-gray-800 ${
                  active ? "border-gray-900 bg-slate-100 ring-2 ring-gray-900" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex h-5 w-5 flex-shrink-0 rounded-full border-2 ${
                      active ? "border-gray-900" : "border-gray-300 group-hover:border-gray-500"
                    }`}
                  >
                    <span className={`m-auto h-3 w-3 rounded-full ${active ? "bg-gray-900" : "bg-transparent"}`} />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                      {addr.address_type} Address
                      {addr.is_default && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full">Default</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{addr.street}</p>
                    <p className="text-sm text-gray-600">{`${addr.city}, ${addr.state} ${addr.zip_code}`}</p>
                    {addr.phone && <p className="text-xs text-gray-500 mt-1">📞 {addr.phone}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ✨ NEW: Pending Order Modal Component (visual upgrades only)
interface PendingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: PendingOrderError | null;
  onContinue: (orderNumber: string) => void;
  onCancelAndRetry: (orderNumber: string) => void;
  isProcessing: boolean;
}

const PendingOrderModal: React.FC<PendingOrderModalProps> = ({
  isOpen,
  onClose,
  errorData,
  onContinue,
  onCancelAndRetry,
  isProcessing,
}) => {
  if (!isOpen || !errorData) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          className="relative w-full md:w-auto md:min-w-[420px] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl p-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        >
          <WarningIcon />
          <h3 className="text-xl font-bold text-gray-900 mt-4 text-center">Pending Payment</h3>
          <p className="text-gray-600 my-4 text-center">{errorData.error}</p>
          <div className="space-y-3">
            <button
              onClick={() => onContinue(errorData.id)}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? "Processing…" : `Pay for Order ${errorData.id}`}
            </button>
            <button
              onClick={() => onCancelAndRetry(errorData.id)}
              disabled={isProcessing}
              className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Cancel Previous Order & Continue"
              )}
            </button>
            <button onClick={onClose} disabled={isProcessing} className="w-full text-sm text-gray-600 hover:underline mt-2 disabled:opacity-50">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

//=========== MAIN CART PAGE COMPONENT (logic unchanged) ===========//
const CartPage = () => {
  const { user } = useAuth();
  const { fetchCartCount } = useCartContext();
  const router = useRouter();
  const [cart, setCart] = useState<CartApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // ✨ NEW: State for the pending order modal (unchanged)
  const [pendingOrderError, setPendingOrderError] = useState<PendingOrderError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessingModalAction, setIsProcessingModalAction] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleProceedToPay = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const response = await api.post("/api/orders/order/create/", {
        address_id: selectedAddressId,
        payment_method: "upi", // Hardcoded
      });

      sessionStorage.setItem("currentOrderDetails", JSON.stringify(response.data));
      const orderNumber = response.data.order.order_number;
      router.push(`/payment?order_number=${orderNumber}`);
    } catch (err: any) {
      if (err.response?.data?.id && err.response?.data?.error) {
        setPendingOrderError(err.response.data);
        setIsModalOpen(true);
      } else {
        console.error("Failed to create order:", err);
        alert(err.response?.data?.error || "Could not create order. Please try again.");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleContinueWithPreviousOrder = async (orderNumber: string) => {
    setIsProcessingModalAction(true);
    try {
      const response = await api.get(`/api/orders/order/${orderNumber}/`);
      sessionStorage.setItem("currentOrderDetails", JSON.stringify(response.data));
      router.push(`/payment?order_number=${orderNumber}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to fetch pending order details:", error);
      alert("Could not retrieve pending order details. Please try again.");
    } finally {
      setIsProcessingModalAction(false);
    }
  };

  const handleCancelAndRetry = async (orderNumber: string) => {
    setIsProcessingModalAction(true);
    try {
      await api.post(`/api/orders/order/${orderNumber}/cancel/`);
      setIsModalOpen(false);
      setPendingOrderError(null);
      await handleProceedToPay();
    } catch (error: any) {
      console.error("Failed to cancel or create order:", error);
      alert(error.response?.data?.message || "Failed to cancel the previous order. Please try again.");
    } finally {
      setIsProcessingModalAction(false);
    }
  };

  const subtotal = cart?.total_price || 0;
  const shippingCost = subtotal > 0 ? 50.0 : 0;
  const total = subtotal + shippingCost;

  // Skeleton placeholder for loading items (UI only)
  const SkeletonRow = () => (
    <div className="flex py-6 animate-pulse">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200" />
      <div className="ml-4 flex-1 space-y-3">
        <div className="h-4 w-2/3 bg-slate-200 rounded" />
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-8 w-1/2 bg-slate-200 rounded" />
      </div>
    </div>
  );

  if (isLoading && !cart) {
    return (
      <>
        <Navbar />
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-8 w-52 bg-slate-200 rounded mb-6 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm h-64 animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Pending order modal */}
      <PendingOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        errorData={pendingOrderError}
        onContinue={handleContinueWithPreviousOrder}
        onCancelAndRetry={handleCancelAndRetry}
        isProcessing={isProcessingModalAction}
      />

      {/* Mobile sticky checkout bar */}
      <AnimatePresence>
        {cart && cart.items.length > 0 && (
          <motion.div
            className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-slate-200"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Total</span>
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>
              <button
                onClick={handleProceedToPay}
                disabled={!selectedAddressId || isPlacingOrder}
                className="flex-1 ml-3 bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-black transition disabled:opacity-50"
              >
                {isPlacingOrder ? "Processing…" : selectedAddressId ? "Proceed to Pay" : "Select Address"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-50 min-h-screen pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Your Cart</h1>
            {cart?.total_items ? (
              <span className="text-sm text-gray-600 hidden md:inline-flex">
                {cart.total_items} {cart.total_items === 1 ? "item" : "items"}
              </span>
            ) : null}
          </div>

          {error && <p className="text-red-600 text-center bg-red-50 border border-red-100 p-4 rounded-xl mb-6">{error}</p>}

          {!isLoading && !error && (!cart || cart.items.length === 0) ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800">Your cart is empty</h2>
              <p className="text-gray-500 mt-2">Discover cake raw materials and start baking magic.</p>
              <Link
                href="/product"
                className="mt-6 inline-block px-8 py-3 text-white font-semibold bg-gray-900 rounded-xl hover:bg-black"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Cart Items</h2>
                    {cart?.total_items !== undefined && (
                      <span className="text-xs text-gray-500">{cart.total_items} total</span>
                    )}
                  </div>
                  <ul role="list" className="divide-y divide-gray-100">
                    {cart?.items.map((item) => (
                      <li key={item.id} className="py-4 sm:py-6">
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-4"
                        >
                          <div className="h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                            <img
                              src={`${API_BASE_URL}${item.product_image}`}
                              alt={item.product_name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                                  {item.product_name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">{formatCurrency(item.product_price)} each</p>
                              </div>
                              <p className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
                                {formatCurrency(item.total_price)}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="inline-flex items-center bg-white border border-gray-300 rounded-xl shadow-sm">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="p-2.5 sm:p-3 text-gray-600 hover:text-black active:scale-95 transition"
                                  aria-label="Decrease quantity"
                                >
                                  <MinusIcon />
                                </button>
                                <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="p-2.5 sm:p-3 text-gray-600 hover:text-black active:scale-95 transition"
                                  aria-label="Increase quantity"
                                >
                                  <PlusIcon />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                type="button"
                                className="font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-amber-50"
                                aria-label="Remove item"
                              >
                                <TrashIcon /> Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Address */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
                  <AddressSelection selectedAddressId={selectedAddressId} onSelectAddress={setSelectedAddressId} />
                </div>
              </div>

              {/* Order Summary (desktop) */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24 hidden md:block">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Order Summary</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{formatCurrency(shippingCost)}</span>
                    </div>
                    <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedToPay}
                    disabled={!selectedAddressId || isPlacingOrder}
                    className="mt-6 w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-black transition disabled:opacity-50 flex justify-center items-center"
                  >
                    {isPlacingOrder ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : selectedAddressId ? (
                      "Proceed to Pay"
                    ) : (
                      "Select an Address"
                    )}
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
