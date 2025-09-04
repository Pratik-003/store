// ProductsPage.tsx (UI/UX revamp + Quick Add — logic & APIs preserved)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import api from "@/app/utils/api";
import Navbar from "@/components/Navbar";
import EachProduct from "@/Pages/Product/EachProduct";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, useCart as useCartContext } from "@/app/context/AuthContext";

//=========== INTERFACES (unchanged) ===========//
interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  stock_quantity: number;
  image: string;
  image_url?: string | null;
}

interface CategoryResponse {
  id: number;
  name: string;
  products: Product[];
}

//=========== UTILS ===========//
const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount));

const API_BASE_URL = "http://127.0.0.1:8000";

//=========== ICONS ===========//
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0A12 12 0 000 12h4z"></path>
  </svg>
);

//=========== TOAST (tiny, no deps) ===========//
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
    <div className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm shadow-lg">{message}</div>
    <button
      aria-label="close"
      onClick={onClose}
      className="sr-only"
    >
      Close
    </button>
  </div>
);

//=========== COMPACT PRODUCT CARD ===========//
const ProductCard = ({
  product,
  index,
  onOpen,
  onQuickAdd,
  isAdding,
}: {
  product: Product;
  index: number;
  onOpen: () => void;
  onQuickAdd: () => Promise<void>;
  isAdding: boolean;
}) => {
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const out = product.stock_quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      <div className="group relative w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* image tap opens modal */}
        <button
          onClick={onOpen}
          className="block w-full text-left"
          aria-label={`View ${product.name}`}
        >
          <div className="relative">
            <div className="aspect-square w-full overflow-hidden bg-slate-100">
              <img
                src={product.image ? `${API_BASE_URL}${product.image}` : "https://placehold.co/600x600/f5f5f5/333?text=Product"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              {lowStock && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 border border-red-200">
                  Low stock
                </span>
              )}
              {out && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 border border-slate-200">
                  Out of stock
                </span>
              )}
            </div>

            <div className="absolute bottom-2 right-2">
              <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-gray-900 shadow ring-1 ring-slate-200">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>
        </button>

        {/* content + quick add */}
        <div className="p-3">
          <p className="text-[11px] uppercase tracking-wide text-amber-700 font-semibold line-clamp-1">
            {product.category}
          </p>
          <button
            onClick={onOpen}
            className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] text-left w-full hover:underline"
          >
            {product.name}
          </button>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>

            {/* quick add button replaces "View" */}
            <button
              onClick={onQuickAdd}
              disabled={out || isAdding}
              className={[
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                out || isAdding
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-black active:scale-[.98]",
              ].join(" ")}
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdding ? <Spinner /> : <PlusIcon />}
              {isAdding ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

//=========== MAIN PAGE ===========//
const ProductsPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // quick add state
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string>("");

  const { user } = useAuth();
  const { fetchCartCount } = useCartContext();

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<CategoryResponse[]>("/api/products/categories/");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Couldn't load products. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  // flatten with category name
  const allProducts = useMemo(
    () => categories.flatMap((cat) => cat.products.map((p) => ({ ...p, category: cat.name }))),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All") return allProducts;
    return allProducts.filter((product) => product.category === activeFilter);
  }, [activeFilter, allProducts]);

  const categoryNames = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories]);

  // quick add to cart (uses your existing API + updates count)
  const quickAdd = async (productId: number) => {
    if (!user) {
      setToast("Please log in to add items.");
      setTimeout(() => setToast(""), 1800);
      return;
    }
    try {
      setAddingId(productId);
      await api.post("/api/orders/cart/add/", {
        product_id: productId,
        quantity: 1,
      });
      await fetchCartCount();
      setToast("Added to cart ✓");
    } catch (e: any) {
      console.error("Quick add failed:", e);
      setToast(e?.response?.data?.message || "Failed to add. Try again.");
    } finally {
      setAddingId(null);
      setTimeout(() => setToast(""), 1600);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
          {/* Header */}
          <div className="pt-6 sm:pt-10 text-center">
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-gray-900 tracking-tight">
              Cake Raw Materials
            </h1>
            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base text-gray-500">
              Premium ingredients for bakers. Compact cards, quick browsing, and one-tap add to cart.
            </p>
          </div>

          {/* Search/Sort Row (visual only) */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <input
                  readOnly
                  placeholder="Search (coming soon)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort:</span>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                Popular
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                Price ↑
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                Price ↓
              </button>
            </div>
          </div>

          {/* Category chips — horizontal scroll on mobile */}
          <div className="mt-5 sm:mt-8">
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-slate-50 to-transparent rounded-l-xl" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-slate-50 to-transparent rounded-r-xl" />
              <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto no-scrollbar py-1 px-0 sm:px-1">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 w-24 flex-shrink-0 rounded-full bg-slate-200 animate-pulse" />
                  ))
                ) : (
                  categoryNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => setActiveFilter(name)}
                      className={[
                        "snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                        activeFilter === name
                          ? "bg-gray-900 text-white border-gray-900 shadow"
                          : "bg-white text-gray-700 border-slate-200 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      {name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="mt-6 sm:mt-10">
            {error && (
              <div className="text-center text-red-600 bg-red-50 border border-red-100 p-6 rounded-xl">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!error && (
              <div
                key={activeFilter}
                className={["grid", "grid-cols-2", "sm:grid-cols-3", "xl:grid-cols-4", "gap-3", "sm:gap-5"].join(" ")}
              >
                {isLoading
                  ? [...Array(8)].map((_, i) => (
                      <div key={i} className="rounded-2xl border border-slate-200 bg-white h-full overflow-hidden">
                        <div className="aspect-square w-full bg-slate-200 animate-pulse" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ))
                  : filteredProducts.map((product, i) => (
                      <ProductCard
                        key={`${product.id}-${product.name}`}
                        product={product}
                        index={i}
                        onOpen={() => setSelectedProduct(product)}
                        onQuickAdd={() => quickAdd(product.id)}
                        isAdding={addingId === product.id}
                      />
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal (unchanged logic) */}
        <AnimatePresence>
          <EachProduct product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </AnimatePresence>

        {/* Toast */}
        {toast && <Toast message={toast} onClose={() => setToast("")} />}

        {/* utilities */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductsPage;
