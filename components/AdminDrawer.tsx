'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Check,
  Upload,
  RotateCcw,
  Settings,
  Package,
  Database,
  LogOut,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Product,
  ProductInput,
  StoreSettings,
  PRESET_PRODUCT_IMAGES,
  formatNaira,
  validateProductInput,
  validateStoreSettings,
} from '@/lib/store-logic';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: (pin: string) => boolean;
  onLock: () => void;
  products: Product[];
  settings: StoreSettings;
  isMutating?: boolean;
  supabaseError?: string | null;
  onDismissError?: () => void;
  onRefreshData?: () => Promise<void>;
  onAddProduct: (
    input: ProductInput
  ) => Promise<{ product: Product; error: string | null }>;
  onUpdateProduct: (id: string, input: ProductInput) => Promise<{ error: string | null }>;
  onToggleStock: (id: string) => Promise<{ error: string | null }>;
  onDeleteProduct: (id: string) => Promise<{ error: string | null }>;
  onResetCatalog: () => Promise<{ error: string | null }>;
  onUpdateSettings: (settings: StoreSettings) => Promise<{ error: string | null }>;
  onUploadImage: (file: File) => Promise<string>;
}

const DEFAULT_FORM: ProductInput = {
  name: '',
  price: '',
  category: 'Ceramics',
  imageUrl: '/images/products/aether-ceramic-vase.png',
  description: '',
  inStock: true,
};

export default function AdminDrawer({
  isOpen,
  onClose,
  isUnlocked,
  onUnlock,
  onLock,
  products,
  settings,
  isMutating = false,
  supabaseError = null,
  onDismissError,
  onRefreshData,
  onAddProduct,
  onUpdateProduct,
  onToggleStock,
  onDeleteProduct,
  onResetCatalog,
  onUpdateSettings,
  onUploadImage,
}: AdminDrawerProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'supabase'>('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<ProductInput>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [statusBanner, setStatusBanner] = useState<string>('');

  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  if (!isOpen) return null;

  const showTempBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? '' : prev));
    }, 3500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!pinInput.trim()) {
      setPinError('Please enter your Admin PIN.');
      return;
    }
    const success = onUnlock(pinInput);
    if (success) {
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect Admin PIN. Please check NEXT_PUBLIC_ADMIN_PIN.');
    }
  };

  const handleStartAdd = () => {
    setEditingProductId(null);
    setProductForm(DEFAULT_FORM);
    setFormErrors({});
    setShowProductForm(true);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      description: product.description || '',
      inStock: product.inStock,
    });
    setFormErrors({});
    setShowProductForm(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await onUploadImage(file);
      setProductForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } catch {
      setFormErrors((prev) => ({
        ...prev,
        imageUrl: 'Could not read image file. Please try another image.',
      }));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProductInput(productForm);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingProductId) {
      const { error } = await onUpdateProduct(editingProductId, productForm);
      if (!error) {
        showTempBanner(`Synced "${productForm.name.trim()}" to Supabase.`);
      }
    } else {
      const { product: created, error } = await onAddProduct(productForm);
      if (!error) {
        showTempBanner(`Added "${created.name}" (${created.id}) to Supabase.`);
      }
    }

    setShowProductForm(false);
    setEditingProductId(null);
    setProductForm(DEFAULT_FORM);
    setFormErrors({});
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStoreSettings(settingsForm);
    if (!validation.valid) {
      setSettingsErrors(validation.errors);
      return;
    }
    setSettingsErrors({});
    const { error } = await onUpdateSettings(settingsForm);
    if (!error) {
      showTempBanner('Store settings saved to Supabase (store_settings id = 1).');
    }
  };

  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
    >
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-[#F8F7F4] text-[#1A1A1A] shadow-2xl border-l border-[#E5E5E0]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4D3E] text-white">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 id="admin-drawer-title" className="text-base font-bold text-[#1A1A1A]">
                {settings.storeName} Admin Dashboard
              </h2>
              <p className="text-xs text-[#666666]">
                {isUnlocked
                  ? 'Connected to live Supabase catalog & store_settings'
                  : 'Authentication required to edit storefront'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isMutating}
                aria-label="Sync with Supabase"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-2.5 py-1.5 text-xs font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isMutating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            )}
            {isUnlocked && (
              <button
                type="button"
                onClick={onLock}
                aria-label="Lock Admin Session"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-1.5 text-xs font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Lock</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Dashboard"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#666666] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body Content: Either PIN Gate or Full CRUD Dashboard */}
        {!isUnlocked ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-xl border border-[#E5E5E0] bg-white p-6 shadow-xs">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-center text-lg font-bold text-[#1A1A1A]">
                Enter Admin PIN
              </h3>
              <p className="mt-1 text-center text-xs text-[#666666]">
                Protected area for managing Supabase products and WhatsApp store settings.
              </p>

              <form onSubmit={handlePinSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="admin-pin-input"
                    className="block text-xs font-semibold text-[#1A1A1A] mb-1.5"
                  >
                    Security PIN
                  </label>
                  <input
                    id="admin-pin-input"
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="Enter Admin PIN"
                    className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3.5 py-2.5 text-center font-mono text-base tracking-widest text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                  />
                  {pinError && (
                    <p
                      role="alert"
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#1B4D3E] py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#143A2F] transition-colors"
                >
                  Unlock Dashboard
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-[#E5E5E0] bg-white px-5 py-2.5">
              <div className="flex items-center gap-1.5" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'products'}
                  onClick={() => setActiveTab('products')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === 'products'
                      ? 'bg-[#1B4D3E] text-white'
                      : 'text-[#666666] hover:bg-[#F8F7F4] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>Products ({products.length})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-[#1B4D3E] text-white'
                      : 'text-[#666666] hover:bg-[#F8F7F4] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Store Settings</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'supabase'}
                  onClick={() => setActiveTab('supabase')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === 'supabase'
                      ? 'bg-[#1B4D3E] text-white'
                      : 'text-[#666666] hover:bg-[#F8F7F4] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>RLS & Schema</span>
                </button>
              </div>
            </div>

            {/* Supabase Error Alert inside Drawer */}
            {supabaseError && (
              <div
                role="alert"
                className="flex items-start justify-between gap-2 bg-red-50 border-b border-red-200 px-5 py-3 text-xs text-red-800"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Supabase Database Notice</p>
                    <p className="mt-0.5 leading-relaxed">{supabaseError}</p>
                  </div>
                </div>
                {onDismissError && (
                  <button
                    type="button"
                    onClick={onDismissError}
                    aria-label="Dismiss Supabase error"
                    className="text-red-700 hover:text-red-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Status Feedback Banner */}
            {statusBanner && (
              <div
                role="status"
                className="flex items-center justify-between bg-[#1B4D3E] px-5 py-2 text-xs font-medium text-white"
              >
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {statusBanner}
                </span>
                <button
                  type="button"
                  onClick={() => setStatusBanner('')}
                  aria-label="Dismiss notification"
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable Tab Viewport */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {activeTab === 'products' && (
                <>
                  {/* Quick Metrics Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-[#E5E5E0] bg-white p-3.5">
                      <p className="text-xs text-[#666666]">Total Catalog</p>
                      <p className="mt-0.5 text-xl font-bold text-[#1A1A1A] tabular-nums">
                        {products.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E5E5E0] bg-white p-3.5">
                      <p className="text-xs text-[#666666]">In Stock</p>
                      <p className="mt-0.5 text-xl font-bold text-[#1B4D3E] tabular-nums">
                        {inStockCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E5E5E0] bg-white p-3.5">
                      <p className="text-xs text-[#666666]">Out of Stock</p>
                      <p className="mt-0.5 text-xl font-bold text-[#666666] tabular-nums">
                        {outOfStockCount}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        showProductForm ? setShowProductForm(false) : handleStartAdd()
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#143A2F] transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{showProductForm ? 'Hide Product Form' : 'Add New Product'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={async () => {
                        const { error } = await onResetCatalog();
                        if (!error) {
                          showTempBanner('Seeded default 8 Aurora products into Supabase.');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-white px-3 py-2 text-xs font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Seed Default Catalog</span>
                    </button>
                  </div>

                  {/* Add / Edit Product Form */}
                  {showProductForm && (
                    <form
                      onSubmit={handleProductSubmit}
                      className="rounded-xl border border-[#E5E5E0] bg-white p-5 shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
                        <h3 className="text-sm font-bold text-[#1A1A1A]">
                          {editingProductId
                            ? `Edit Product (${editingProductId})`
                            : 'Add New Product'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProductId(null);
                          }}
                          className="text-xs text-[#666666] hover:text-[#1A1A1A]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="product-name-input"
                            className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                          >
                            Product Name *
                          </label>
                          <input
                            id="product-name-input"
                            type="text"
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="e.g. Solstice Travertine Tray"
                            className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="product-price-input"
                            className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                          >
                            Price (₦ Naira) *
                          </label>
                          <input
                            id="product-price-input"
                            type="number"
                            min="1"
                            step="any"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm((prev) => ({ ...prev, price: e.target.value }))
                            }
                            placeholder="e.g. 85000"
                            className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-sm text-[#1A1A1A] tabular-nums focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                          />
                          {formErrors.price && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="product-category-input"
                            className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                          >
                            Category *
                          </label>
                          <input
                            id="product-category-input"
                            type="text"
                            list="aurora-category-suggestions"
                            value={productForm.category}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                            placeholder="Ceramics, Textiles, Tableware..."
                            className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                          />
                          <datalist id="aurora-category-suggestions">
                            <option value="Ceramics" />
                            <option value="Glassware" />
                            <option value="Textiles" />
                            <option value="Lighting" />
                            <option value="Tableware" />
                            <option value="Home Fragrance" />
                          </datalist>
                          {formErrors.category && (
                            <p className="mt-1 text-xs text-red-600">{formErrors.category}</p>
                          )}
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center justify-between rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3.5 py-2 cursor-pointer">
                            <div>
                              <span className="block text-xs font-semibold text-[#1A1A1A]">
                                Availability Status
                              </span>
                              <span className="text-[11px] text-[#666666]">
                                {productForm.inStock
                                  ? 'In Stock — Ready for WhatsApp Order'
                                  : 'Out of Stock — Displays badge'}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={productForm.inStock}
                              onChange={(e) =>
                                setProductForm((prev) => ({
                                  ...prev,
                                  inStock: e.target.checked,
                                }))
                              }
                              aria-label="In Stock"
                              className="h-4 w-4 accent-[#1B4D3E] rounded cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Image URL + Local File Upload + Studio Presets */}
                      <div className="space-y-2">
                        <label
                          htmlFor="product-image-input"
                          className="block text-xs font-semibold text-[#1A1A1A]"
                        >
                          Product Image (Paste URL or Upload File) *
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="product-image-input"
                            type="text"
                            value={productForm.imageUrl}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                imageUrl: e.target.value,
                              }))
                            }
                            placeholder="https://images.unsplash.com/... or /images/products/..."
                            className="flex-1 rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                          />
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-xs font-medium text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors shrink-0">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        {formErrors.imageUrl && (
                          <p className="text-xs text-red-600">{formErrors.imageUrl}</p>
                        )}

                        {/* Quick Studio Preset Selector */}
                        <div className="pt-1">
                          <p className="text-[11px] text-[#666666] mb-1.5">
                            Or quick-select a studio product photo:
                          </p>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {PRESET_PRODUCT_IMAGES.map((preset) => (
                              <button
                                key={preset.url}
                                type="button"
                                onClick={() =>
                                  setProductForm((prev) => ({
                                    ...prev,
                                    imageUrl: preset.url,
                                  }))
                                }
                                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] whitespace-nowrap shrink-0 transition-colors ${
                                  productForm.imageUrl === preset.url
                                    ? 'border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E] font-semibold'
                                    : 'border-[#E5E5E0] bg-[#F8F7F4] text-[#666666] hover:text-[#1A1A1A]'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="h-5 w-5 rounded-xs object-cover"
                                />
                                <span>{preset.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProductId(null);
                          }}
                          className="rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-semibold text-[#666666] hover:text-[#1A1A1A]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isMutating}
                          className="rounded-lg bg-[#1B4D3E] px-5 py-2 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#143A2F] transition-colors disabled:opacity-50"
                        >
                          {editingProductId ? 'Save Changes' : 'Create Product'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Product Management Table / List */}
                  <div className="rounded-xl border border-[#E5E5E0] bg-white overflow-hidden">
                    <div className="border-b border-[#E5E5E0] px-4 py-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                        Supabase Catalog Inventory (public.products)
                      </h3>
                      <span className="text-xs text-[#666666] tabular-nums">
                        {products.length} items
                      </span>
                    </div>

                    <div className="divide-y divide-[#E5E5E0]">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#F8F7F4]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-lg object-cover bg-[#E4E3DF] border border-[#E5E5E0] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                                <span className="font-mono text-[11px] tabular-nums">
                                  {product.id}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{product.category}</span>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`font-medium ${
                                    product.inStock ? 'text-[#1B4D3E]' : 'text-amber-700'
                                  }`}
                                >
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                                {product.name}
                              </p>
                              <p className="text-xs font-bold text-[#1A1A1A] tabular-nums">
                                {formatNaira(product.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={async () => {
                                const { error } = await onToggleStock(product.id);
                                if (!error) {
                                  showTempBanner(
                                    `Updated stock status for "${product.name}".`
                                  );
                                }
                              }}
                              aria-label={`Toggle stock for ${product.name}`}
                              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 ${
                                product.inStock
                                  ? 'border-[#E5E5E0] bg-[#F8F7F4] text-[#1A1A1A] hover:bg-[#EFECE6]'
                                  : 'border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E] hover:bg-[#1B4D3E]/20'
                              }`}
                            >
                              {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartEdit(product)}
                              aria-label={`Edit ${product.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E0] bg-white text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={async () => {
                                const { error } = await onDeleteProduct(product.id);
                                if (!error) {
                                  showTempBanner(`Deleted "${product.name}" from Supabase.`);
                                }
                              }}
                              aria-label={`Delete ${product.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E0] bg-white text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'settings' && (
                <form
                  onSubmit={handleSettingsSubmit}
                  className="rounded-xl border border-[#E5E5E0] bg-white p-5 space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A]">
                      Storefront & WhatsApp Configuration (public.store_settings)
                    </h3>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Persisted to row <code className="font-mono">id = 1</code> in{' '}
                      <code className="font-mono">public.store_settings</code>. Updates the header,
                      hero banner, and all Direct-to-WhatsApp order links immediately.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-store-name"
                      className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                    >
                      Store Brand Name *
                    </label>
                    <input
                      id="settings-store-name"
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, storeName: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                    />
                    {settingsErrors.storeName && (
                      <p className="mt-1 text-xs text-red-600">{settingsErrors.storeName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="settings-hero-headline"
                      className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                    >
                      Hero Headline *
                    </label>
                    <input
                      id="settings-hero-headline"
                      type="text"
                      value={settingsForm.heroHeadline}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          heroHeadline: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                    />
                    {settingsErrors.heroHeadline && (
                      <p className="mt-1 text-xs text-red-600">
                        {settingsErrors.heroHeadline}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="settings-hero-subtext"
                      className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                    >
                      Hero Subtext
                    </label>
                    <textarea
                      id="settings-hero-subtext"
                      rows={2}
                      value={settingsForm.heroSubtext}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          heroSubtext: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-whatsapp-number"
                      className="block text-xs font-semibold text-[#1A1A1A] mb-1"
                    >
                      WhatsApp Phone Number (International Format, Digits Only) *
                    </label>
                    <input
                      id="settings-whatsapp-number"
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          whatsappNumber: e.target.value,
                        }))
                      }
                      placeholder="2348000000000"
                      className="w-full rounded-lg border border-[#E5E5E0] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#1A1A1A] tabular-nums focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-[#666666]">
                      Non-numeric characters are automatically stripped when building{' '}
                      <code className="font-mono">https://wa.me/</code> links.
                    </p>
                    {settingsErrors.whatsappNumber && (
                      <p className="mt-1 text-xs text-red-600">
                        {settingsErrors.whatsappNumber}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-[#143A2F] transition-colors disabled:opacity-50"
                    >
                      {isMutating ? 'Saving to Supabase...' : 'Save Store Settings'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'supabase' && (
                <div className="rounded-xl border border-[#E5E5E0] bg-white p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A]">
                      Supabase Tables & RLS Policy Reference
                    </h3>
                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                      If you see a Row-Level Security (RLS) error when adding, editing, or
                      auto-seeding products, run the SQL snippet below in your Supabase SQL Editor
                      to grant public read/write policies on{' '}
                      <code className="font-mono text-[#1A1A1A]">public.products</code> and{' '}
                      <code className="font-mono text-[#1A1A1A]">public.store_settings</code>.
                    </p>
                  </div>

                  <pre className="overflow-x-auto rounded-lg bg-[#1A1A1A] p-4 font-mono text-xs text-[#F8F7F4] leading-relaxed">
{`-- Enable RLS & allow anon client CRUD for storefront & PIN-gated Admin
alter table public.products enable row level security;
create policy "Allow public read/write on products"
  on public.products for all
  using (true)
  with check (true);

alter table public.store_settings enable row level security;
create policy "Allow public read/write on store_settings"
  on public.store_settings for all
  using (true)
  with check (true);`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
