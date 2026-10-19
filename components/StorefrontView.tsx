'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  X,
  RotateCcw,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FilterBar from '@/components/FilterBar';
import ProductCard from '@/components/ProductCard';
import EditorialSections from '@/components/EditorialSections';
import Footer from '@/components/Footer';
import AdminDrawer from '@/components/AdminDrawer';
import { useStoreData } from '@/lib/storage-service';
import {
  Product,
  extractCategories,
  filterProducts,
  buildWhatsAppMessage,
  buildGeneralWhatsAppUrl,
  sanitizePhoneNumber,
  shouldOpenAdminFromLocation,
  isAdminKeyboardShortcut,
} from '@/lib/store-logic';

export default function StorefrontView({
  initialAdminOpen = false,
}: {
  initialAdminOpen?: boolean;
}) {
  const {
    products,
    settings,
    isAdminUnlocked,
    isLoading,
    isMutating,
    supabaseError,
    dismissError,
    refreshData,
    addProduct,
    updateProduct,
    toggleProductStock,
    deleteProduct,
    resetCatalogToDefault,
    updateSettings,
    unlockAdmin,
    lockAdmin,
    uploadLocalImage,
  } = useStoreData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(initialAdminOpen);

  // Non-blocking WhatsApp Order Dispatch Preview Card
  const [activeOrderPreview, setActiveOrderPreview] = useState<{
    product: Product;
    url: string;
    message: string;
  } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  // 1. URL Hash (#admin) / Query (?admin=true) Trigger & hashchange listener
  useEffect(() => {
    const checkUrlTrigger = () => {
      if (typeof window === 'undefined') return;
      if (shouldOpenAdminFromLocation(window.location.hash, window.location.search)) {
        setAdminOpen(true);
      }
    };

    checkUrlTrigger();
    window.addEventListener('hashchange', checkUrlTrigger);
    window.addEventListener('popstate', checkUrlTrigger);

    return () => {
      window.removeEventListener('hashchange', checkUrlTrigger);
      window.removeEventListener('popstate', checkUrlTrigger);
    };
  }, []);

  // 3. Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A on Mac) to toggle Admin modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdminKeyboardShortcut(e)) {
        e.preventDefault();
        setAdminOpen((prev) => {
          const next = !prev;
          if (!next && typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#admin') {
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCloseAdmin = useCallback(() => {
    setAdminOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.hash.toLowerCase() === '#admin') {
        url.hash = '';
        changed = true;
      }
      if (url.searchParams.has('admin')) {
        url.searchParams.delete('admin');
        changed = true;
      }
      if (changed) {
        const nextUrl =
          url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : '');
        window.history.replaceState(null, '', nextUrl);
      }
    }
  }, []);

  const categories = useMemo(() => extractCategories(products), [products]);

  const filteredProducts = useMemo(
    () => filterProducts(products, selectedCategory, searchQuery),
    [products, selectedCategory, searchQuery]
  );

  const handleToggleSearch = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        const shopEl = document.getElementById('shop');
        if (shopEl) {
          shopEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      return next;
    });
  };

  const handleOrderTriggered = (product: Product, url: string) => {
    setActiveOrderPreview({
      product,
      url,
      message: buildWhatsAppMessage(product),
    });
    setCopiedMessage(false);
  };

  const handleCopyMessage = async () => {
    if (!activeOrderPreview) return;
    try {
      await navigator.clipboard.writeText(activeOrderPreview.message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(true);
    }
  };

  const cleanWhatsappNumber = sanitizePhoneNumber(settings.whatsappNumber);
  const generalWaUrl = buildGeneralWhatsAppUrl(
    cleanWhatsappNumber,
    settings.storeName
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1A1A1A]">
      {/* Sticky Navigation Header (with secret 5-tap logo gesture) */}
      <Header
        settings={{ ...settings, whatsappNumber: cleanWhatsappNumber }}
        searchOpen={searchOpen}
        onToggleSearch={handleToggleSearch}
        onSecretAdminTrigger={() => setAdminOpen(true)}
      />

      {/* Supabase Error Toast / Banner */}
      {supabaseError && (
        <div
          role="alert"
          data-testid="supabase-error-banner"
          className="mx-auto mt-3 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/95 px-4 py-3 text-xs text-amber-950 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Supabase Connection Notice</p>
                <p className="mt-0.5 text-amber-900 leading-relaxed">{supabaseError}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-100 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={dismissError}
                aria-label="Dismiss Supabase notice"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-amber-800 hover:bg-amber-200/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <HeroSection settings={settings} />

        {/* Product Showcase Section */}
        <section
          id="shop"
          className="scroll-mt-20 mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 sm:pt-10 lg:px-8"
        >
          {/* Category Filter Pills & Real-Time Search Bar */}
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchOpen={searchOpen}
            totalShowing={filteredProducts.length}
            totalCatalog={products.length}
          />

          {/* Loading Skeleton State while fetching from Supabase */}
          {isLoading ? (
            <div
              data-testid="product-grid-skeleton"
              aria-busy="true"
              aria-label="Loading products from Supabase"
              className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-xl border border-[#E5E5E0] bg-white p-2.5 sm:p-3.5 animate-pulse"
                >
                  <div className="aspect-square w-full rounded-lg bg-[#E6E5E2]" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-[#E6E5E2]" />
                    <div className="h-4 w-3/4 rounded bg-[#E6E5E2]" />
                    <div className="h-4 w-1/3 rounded bg-[#E6E5E2]" />
                    <div className="mt-3 h-9 w-full rounded-md bg-[#E6E5E2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              data-testid="product-grid"
              className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={cleanWhatsappNumber}
                  onOrderTriggered={handleOrderTriggered}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#E5E5E0] bg-white px-6 py-14 text-center">
              <p className="text-base font-semibold text-[#1A1A1A]">
                No matching products found
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#666666]">
                We couldn&apos;t find any items matching &ldquo;{searchQuery || selectedCategory}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#143A2F] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </section>

        {/* Collections & About Sections */}
        <EditorialSections
          onSelectCollectionCategory={(cat) => {
            setSelectedCategory(cat);
            setSearchQuery('');
          }}
          whatsappUrl={generalWaUrl}
        />
      </main>

      {/* Footer */}
      <Footer settings={{ ...settings, whatsappNumber: cleanWhatsappNumber }} />

      {/* Non-Blocking WhatsApp Order Dispatch Preview Card */}
      {activeOrderPreview && (
        <aside
          aria-label="WhatsApp Order Confirmation Preview"
          className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-[#1B4D3E]/30 bg-white p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B4D3E] text-white shrink-0">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">
                  WhatsApp Order Prepared
                </p>
                <p className="text-[11px] text-[#666666] tabular-nums">
                  Recipient: +{cleanWhatsappNumber}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveOrderPreview(null)}
              aria-label="Close WhatsApp order preview"
              className="text-[#666666] hover:text-[#1A1A1A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-[#F8F7F4] p-2.5 font-sans text-xs text-[#1A1A1A] border border-[#E5E5E0] leading-relaxed">
            {activeOrderPreview.message}
          </pre>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors"
            >
              {copiedMessage ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>Copied Message</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <a
              href={activeOrderPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1B4D3E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#143A2F] transition-colors"
            >
              <span>Open wa.me</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>
      )}

      {/* Built-In Admin Dashboard Slide-Over Drawer */}
      <AdminDrawer
        isOpen={adminOpen}
        onClose={handleCloseAdmin}
        isUnlocked={isAdminUnlocked}
        onUnlock={unlockAdmin}
        onLock={lockAdmin}
        products={products}
        settings={settings}
        isMutating={isMutating}
        supabaseError={supabaseError}
        onDismissError={dismissError}
        onRefreshData={refreshData}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onToggleStock={toggleProductStock}
        onDeleteProduct={deleteProduct}
        onResetCatalog={resetCatalogToDefault}
        onUpdateSettings={updateSettings}
        onUploadImage={uploadLocalImage}
      />
    </div>
  );
}
