"use client";

import React, { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/app/utils/api";
import Link from "next/link";

//=========== ICONS ===========//
const LoaderIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CheckCircleIcon = () => <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

//=========== PAYMENT PAGE CONTENT ===========//
const PaymentContent = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number");

  const [referenceId, setReferenceId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderNumber || !referenceId || !screenshot) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("reference_id", referenceId);
    formData.append("screenshot", screenshot);

    try {
      await api.post(`/api/orders/${orderNumber}/verify-payment/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
        <p className="text-gray-600 mt-2">Your order has been received and will be verified soon.</p>
        <Link href="/orders" className="mt-6 inline-block px-8 py-3 text-white font-semibold bg-gray-800 rounded-lg hover:bg-black">
          View Your Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left side: Payment Info */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h2>
        <p className="text-gray-600 mb-4">
          Please scan the QR code with any UPI app or use the UPI ID below to complete your payment.
        </p>
        <div className="text-center my-6">
          {/* Replace with your actual QR code image */}
          <img src="/path/to/your/upi-qr-code.png" alt="UPI QR Code" className="mx-auto w-48 h-48 border rounded-lg" />
        </div>
        <div className="text-center bg-slate-100 p-4 rounded-lg">
          <p className="text-gray-500">Our UPI ID:</p>
          <p className="text-lg font-mono font-bold text-gray-800">your-upi-id@okhdfcbank</p>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Order Number: <strong>{orderNumber}</strong></p>
      </div>

      {/* Right side: Submission Form */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Payment Proof</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700">UPI Reference ID / Transaction ID</label>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Suspense is needed because useSearchParams is a client-side hook */}
          <Suspense fallback={<div className="text-center"><LoaderIcon /></div>}>
            <PaymentContent />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;