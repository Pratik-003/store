'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/app/utils/api';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ====== Icons (Unchanged) ====== //
const LoaderIcon = ({ className = "h-6 w-6" }: { className?: string }) => <svg className={`animate-spin text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PackageIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"></path></svg>;
const CreditCardIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;
const UserCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const Spinner = () => <div className="flex justify-center items-center p-16"><svg className="animate-spin h-8 w-8 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;

// ====== Utility (Unchanged) ====== //
const API_BASE_URL = "http://127.0.0.1:8000";
const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ====== Interfaces ====== //
interface OrderItem { id: number; product_name: string; quantity: number; product_price: number; total_price: number; product_image: string; }
interface OrderDetail { order_number: string; user: { id: number; email: string; name: string; phone: string; }; shipping_address: { id: number; street: string; city: string; state: string; zip_code: string; phone: string; }; payment: { id: number; method: string; amount: number; status: string; utr_number: string | null; payment_date: string | null; transaction_ss: string | null; created_at: string; }; items: OrderItem[]; total_amount: number; status: string; status_display: string; created_at: string; updated_at: string; admin_actions: { can_approve: boolean; can_cancel: boolean; can_update: boolean; }; }
// ✨ FIX: Updated this interface to match the actual API response for the order list.
interface OrderPreview {
    order_number: string;
    user_email: string; // The API returns user_email, not a nested user object.
    total_amount: number;
    created_at: string;
}

// ====== Reusable UI Components (Unchanged) ====== //
const StatusPill = ({ status, status_display }: { status: string, status_display: string }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        delivered: "bg-emerald-100 text-emerald-800",
        cancelled: "bg-red-100 text-red-800",
        shipped: "bg-sky-100 text-sky-800",
        processing: "bg-amber-100 text-amber-800",
        confirmed: "bg-blue-100 text-blue-800",
        pending: "bg-slate-200 text-slate-800",
    };
    const colorClass = statusClasses[status as keyof typeof statusClasses] || statusClasses.pending;
    return <span className={`${baseClasses} ${colorClass}`}>{status_display}</span>;
};

// ====== Main Component (FIXED) ====== //
const OrderManagement = () => {
    const { user } = useAuth();

    // State
    const [orders, setOrders] = useState<OrderPreview[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
    const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
    const [activeStatus, setActiveStatus] = useState('processing'); 

    // Loading states
    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    
    // Form and message state
    const [newStatus, setNewStatus] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Constants for statuses
    const STATUS_FILTERS = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    const ORDER_STATUSES_DROPDOWN = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    const fetchOrders = useCallback(async () => {
        if (!activeStatus) return;
        setListLoading(true);
        setOrders([]);
        setSelectedOrder(null);
        setSelectedOrderNumber(null);
        
        try {
            const res = await api.get<OrderPreview[]>(`/api/admin/orders/manage/?status=${activeStatus}`);
            setOrders(res.data);
            if (res.data.length > 0) {
                setSelectedOrderNumber(res.data[0].order_number);
            }
        } catch (err) {
            console.error(`Error loading '${activeStatus}' orders`, err);
        } finally {
            setListLoading(false);
        }
    }, [activeStatus]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);
    
    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!selectedOrderNumber) return;
            setDetailLoading(true);
            setMessage(null);
            try {
                const res = await api.get<OrderDetail>(`/api/admin/orders/manage/${selectedOrderNumber}/`);
                setSelectedOrder(res.data);
                setNewStatus(res.data.status);
            } catch (err) {
                console.error("Error loading order detail", err);
                setSelectedOrder(null);
            } finally {
                setDetailLoading(false);
            }
        };
        fetchOrderDetail();
    }, [selectedOrderNumber]);

    const updateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setUpdating(true);
        setMessage(null);
        try {
            await api.post(`/api/admin/orders/manage/${selectedOrder.order_number}/status/`, { status: newStatus });
            setMessage({ type: 'success', text: `Order status updated successfully!` });
            fetchOrders(); // Refetch the list to ensure it's up to date
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to update status. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 font-serif">Order Dashboard</h1>
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                        {STATUS_FILTERS.map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveStatus(status.toLowerCase())}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                    activeStatus === status.toLowerCase()
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 items-start">
                    <aside className="md:col-span-1 bg-white p-4 rounded-xl shadow-md h-fit md:sticky md:top-8">
                        <h2 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-3">{capitalize(activeStatus)} Orders</h2>
                        {listLoading ? <Spinner /> : orders.length === 0 ? (
                            <p className="text-slate-500 p-4 text-center">🎉 No {activeStatus} orders!</p>
                        ) : (
                            <ul className="space-y-1.5 max-h-[75vh] overflow-y-auto">
                                {orders.map((order) => (
                                    <motion.li key={order.order_number} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                                        <button
                                            onClick={() => setSelectedOrderNumber(order.order_number)}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedOrderNumber === order.order_number ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-100'}`}
                                        >
                                            <p className="font-semibold truncate">#{order.order_number}</p>
                                            <div className="flex justify-between items-baseline text-sm mt-1">
                                                {/* ✨ FIX: Changed order.user.name to order.user_email */}
                                                <span className="opacity-80 truncate">{order.user_email}</span>
                                                <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                                            </div>
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </aside>

                    <main className="md:col-span-2 lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedOrderNumber || 'empty'}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {detailLoading ? (
                                    <div className="bg-white p-8 rounded-xl shadow-md"><Spinner /></div>
                                ) : !selectedOrder ? (
                                    <div className="bg-white p-8 rounded-xl shadow-md flex flex-col justify-center items-center min-h-[400px]">
                                        <h3 className="text-xl font-semibold text-slate-700">
                                            {orders.length > 0 ? "Select an Order" : `No Orders to Display`}
                                        </h3>
                                        <p className="text-slate-500 mt-2">
                                            {orders.length > 0 ? "Choose an order from the left to view details." : `There are no ${activeStatus} orders.`}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-xl shadow-md">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-800">Order <span className="text-indigo-600">#{selectedOrder.order_number}</span></h2>
                                                    <p className="text-sm text-slate-500 mt-1">Placed: {formatDate(selectedOrder.created_at)}</p>
                                                </div>
                                                <StatusPill status={selectedOrder.status} status_display={selectedOrder.status_display} />
                                            </div>
                                            {selectedOrder.admin_actions.can_update && (
                                                <form onSubmit={updateStatus} className="border-t border-slate-200 pt-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full sm:w-auto">
                                                            {ORDER_STATUSES_DROPDOWN.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                                                        </select>
                                                        <button type="submit" disabled={updating || newStatus === selectedOrder.status} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transition-all duration-200">
                                                            {updating ? <><LoaderIcon className="h-5 w-5 mr-2" />Updating</> : "Update Status"}
                                                        </button>
                                                    </div>
                                                    {message && <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                                                </form>
                                            )}
                                        </div>

                                        <div className="bg-white p-6 rounded-xl shadow-md">
                                            <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-700 mb-4"><PackageIcon /> Order Items</h3>
                                            <ul className="divide-y divide-slate-200">
                                                {selectedOrder.items.map(item => (
                                                    <li key={item.id} className="flex items-center py-4 gap-4">
                                                        <img src={`${API_BASE_URL}${item.product_image}`} alt={item.product_name} className="h-16 w-16 rounded-lg object-cover border"/>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-slate-800">{item.product_name}</p>
                                                            <p className="text-sm text-slate-500">{item.quantity} x {formatCurrency(item.product_price)}</p>
                                                        </div>
                                                        <p className="font-medium text-slate-900">{formatCurrency(item.total_price)}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            <div className="bg-white p-6 rounded-xl shadow-md">
                                                <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-700 mb-4"><UserCircleIcon /> Customer & Shipping</h3>
                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{selectedOrder.user.name}</p>
                                                        <p className="text-slate-600">{selectedOrder.user.email}</p>
                                                        <p className="text-slate-600">{selectedOrder.shipping_address.phone}</p>
                                                    </div>
                                                    <address className="text-slate-600 not-italic border-t border-slate-200 pt-4">
                                                        <span className="font-semibold text-slate-800">Shipping Address:</span><br/>
                                                        {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.zip_code}
                                                    </address>
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl shadow-md">
                                                <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-700 mb-4"><CreditCardIcon /> Payment Details</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p className="flex justify-between"><span>Method:</span> <span className="font-medium text-slate-800">{selectedOrder.payment.method}</span></p>
                                                    <p className="flex justify-between"><span>Status:</span> <span className="font-medium text-slate-800 capitalize">{selectedOrder.payment.status}</span></p>
                                                    <p className="flex justify-between"><span>Amount:</span> <span className="font-medium text-slate-800">{formatCurrency(selectedOrder.payment.amount)}</span></p>
                                                    <p className="flex justify-between"><span>UTR/Ref:</span> <span className="font-medium text-slate-800">{selectedOrder.payment.utr_number || 'N/A'}</span></p>
                                                </div>
                                                {selectedOrder.payment.transaction_ss && (
                                                    <div className="mt-4 border-t border-slate-200 pt-4">
                                                        <p className="text-sm font-semibold mb-2 text-slate-800">Transaction Screenshot:</p>
                                                        <a href={`${API_BASE_URL}${selectedOrder.payment.transaction_ss}`} target="_blank" rel="noopener noreferrer">
                                                            <img src={`${API_BASE_URL}${selectedOrder.payment.transaction_ss}`} alt="Transaction" className="max-h-48 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"/>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;