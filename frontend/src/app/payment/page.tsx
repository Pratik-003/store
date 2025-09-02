"use client";

import React, { useState, FormEvent, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/app/utils/api";
import Link from "next/link";

//=========== CONFIG & UTILS ===========//
const API_BASE_URL = "http://127.0.0.1:8000";
// ⚠️ Replace these with your actual details
const UPI_ID = "your-upi-id@okhdfcbank";
const UPI_QR_CODE_URL = "/images/upi-qr-code.png"; // Place your QR code in the /public/images directory

const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount));

//=========== INTERFACES ===========//
interface OrderItem {
  product_name: string;
  product_price: string;
  quantity: number;
  total_price: string;
  product_image: string;
}

interface OrderDetails {
  order_number: string;
  total_amount: string;
  status_display: string;
  created_at: string;
  shipping_address: string;
  items: OrderItem[];
}

//=========== ICONS ===========//
const SpinnerIcon = () => <svg className="animate-spin h-8 w-8 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const LoaderIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CheckCircleIcon = () => <svg className="mx-auto w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

//=========== PAYMENT PAGE CONTENT ===========//
const PaymentContent = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number");

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  const [referenceId, setReferenceId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderNumber) {
        setError("Order number is missing from the URL.");
        setIsLoadingOrder(false);
        return;
      }

      // Step 1: Try to get data from sessionStorage first
      const storedOrderJSON = sessionStorage.getItem('currentOrderDetails');

      if (storedOrderJSON) {
        const storedOrderData = JSON.parse(storedOrderJSON);
        
        if (storedOrderData.order?.order_number === orderNumber) {
          setOrderDetails(storedOrderData.order);
          setIsLoadingOrder(false);
          sessionStorage.removeItem('currentOrderDetails');
          return;
        }
      }

      // Step 2: If no session data, fall back to fetching from API (the safety net)
      // 🚨 Ensure this API endpoint exists on your backend!
      console.warn("Could not find order data in session storage. Fetching from API.");
      try {
        setIsLoadingOrder(true);
        const response = await api.get(`/api/orders/order/${orderNumber}/`);
        setOrderDetails(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Could not fetch order details.");
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadOrderDetails();
  }, [orderNumber]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderNumber || !referenceId || !screenshot) {
      setError("Please fill in all fields and upload a screenshot.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("utr_number", referenceId);
    formData.append("transaction_ss", screenshot);

    try {
      await api.post(`/api/orders/payment/verify/${orderNumber}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit payment proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow-md">
        <CheckCircleIcon />
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Payment Submitted!</h2>
        <p className="text-gray-600 mt-2">Your payment proof has been received and will be verified shortly.</p>
        <Link href="/orders" className="mt-6 inline-block px-8 py-3 text-white font-semibold bg-gray-800 rounded-lg hover:bg-black">
          View Your Orders
        </Link>
      </div>
    );
  }

  if (isLoadingOrder) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon />
      </div>
    );
  }

  if (error && !orderDetails) {
    return <p className="text-red-500 text-center bg-red-50 p-4 rounded-lg">{error}</p>;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      {/* Left side: Order Summary & Payment Info */}
      <div className="lg:col-span-3 space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
          <div className="space-y-4">
            {orderDetails?.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img src={`${API_BASE_URL}${item.product_image}`} alt={item.product_name} className="w-16 h-16 rounded-md border" />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.product_name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.product_price)}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <span>Total Amount to Pay</span>
              <span>{formatCurrency(orderDetails?.total_amount || 0)}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Scan and Pay</h2>
          <p className="text-gray-600 mb-4">
            Use any UPI app to scan the QR code or pay to the UPI ID below.
          </p>
          <div className="text-center my-6">
            <img src={UPI_QR_CODE_URL} alt="UPI QR Code" className="mx-auto w-48 h-48 border rounded-lg object-contain bg-white" />
          </div>
          <div className="text-center bg-slate-100 p-4 rounded-lg">
            <p className="text-gray-500">Our UPI ID:</p>
            <p className="text-lg font-mono font-bold text-gray-800">{UPI_ID}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">Order Number: <strong>{orderNumber}</strong></p>
        </div>
      </div>

      {/* Right side: Submission Form */}
      <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md sticky top-24 h-fit">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Payment Proof</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700">UPI Reference / Transaction ID</label>
            <input
              type="text"
              id="referenceId"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          <div>
            <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">Payment Screenshot</label>
            <input
              type="file"
              id="screenshot"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-gray-700 hover:file:bg-slate-200"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-black disabled:opacity-50"
            >
              {isSubmitting ? <LoaderIcon /> : 'Verify Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//=========== MAIN PAGE WRAPPER FOR SUSPENSE ===========//
const PaymentPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Suspense is required because useSearchParams reads from the client */}
          <Suspense fallback={<div className="text-center"><SpinnerIcon /></div>}>
            <PaymentContent />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;