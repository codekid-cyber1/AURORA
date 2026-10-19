'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  Product,
  ProductDbRow,
  ProductInput,
  StoreSettings,
  StoreSettingsDbRow,
  INITIAL_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  getEnvWhatsappNumber,
  getEnvAdminPin,
  generateNextProductId,
  verifyAdminPin,
  mapDbRowToProduct,
  mapProductToDbRow,
  mapDbRowToSettings,
  mapSettingsToDbRow,
  sanitizePhoneNumber,
} from './store-logic';

const ADMIN_SESSION_KEY = 'aurora_admin_unlocked_v1';

export interface SupabaseResult<T> {
  data: T;
  error: string | null;
}

function formatSupabaseError(context: string, err: unknown): string {
  if (!err) return `${context} failed.`;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = String((err as { message: unknown }).message);
    if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('rls')) {
      return `${context}: Row-Level Security (RLS) blocked the request (${msg}). Enable anon SELECT/INSERT/UPDATE/DELETE policies on public.products and public.store_settings.`;
    }
    return `${context}: ${msg}`;
  }
  return `${context}: ${String(err)}`;
}

/**
 * Live Supabase Repository Layer
 * Connects to `public.products` and `public.store_settings` in Supabase.
 */
export const storeRepository = {
  async fetchProducts(): Promise<SupabaseResult<Product[]>> {
    if (!isSupabaseConfigured()) {
      return {
        data: INITIAL_PRODUCTS,
        error:
          'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are not configured.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: INITIAL_PRODUCTS,
          error: formatSupabaseError('Failed to fetch products from Supabase', error),
        };
      }

      const rows = (data as ProductDbRow[] | null) ?? [];

      // Auto-seed the 8 initial sample products if the table is empty on first load
      if (rows.length === 0) {
        const seedRows = INITIAL_PRODUCTS.map(mapProductToDbRow);
        const { data: seededData, error: seedError } = await supabase
          .from('products')
          .upsert(seedRows, { onConflict: 'id' })
          .select('*')
          .order('created_at', { ascending: false });

        if (seedError) {
          return {
            data: INITIAL_PRODUCTS,
            error: formatSupabaseError(
              'Products table was empty and auto-seeding failed',
              seedError
            ),
          };
        }

        const mappedSeed = ((seededData as ProductDbRow[] | null) ?? seedRows).map(
          mapDbRowToProduct
        );
        return { data: mappedSeed, error: null };
      }

      return {
        data: rows.map(mapDbRowToProduct),
        error: null,
      };
    } catch (err) {
      return {
        data: INITIAL_PRODUCTS,
        error: formatSupabaseError('Network error while fetching products', err),
      };
    }
  },

  async upsertProduct(product: Product): Promise<SupabaseResult<Product>> {
    const dbRow = mapProductToDbRow(product);

    if (!isSupabaseConfigured()) {
      return {
        data: product,
        error: 'Supabase is not configured; changes were only applied locally in memory.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(dbRow, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) {
        return {
          data: product,
          error: formatSupabaseError(`Failed to save "${product.name}" to Supabase`, error),
        };
      }

      return {
        data: data ? mapDbRowToProduct(data as ProductDbRow) : product,
        error: null,
      };
    } catch (err) {
      return {
        data: product,
        error: formatSupabaseError(`Failed to save "${product.name}"`, err),
      };
    }
  },

  async deleteProduct(id: string): Promise<SupabaseResult<boolean>> {
    if (!isSupabaseConfigured()) {
      return {
        data: false,
        error: 'Supabase is not configured; deletion could not be persisted.',
      };
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        return {
          data: false,
          error: formatSupabaseError(`Failed to delete product ${id} from Supabase`, error),
        };
      }

      return { data: true, error: null };
    } catch (err) {
      return {
        data: false,
        error: formatSupabaseError(`Failed to delete product ${id}`, err),
      };
    }
  },

  async seedDefaultProducts(): Promise<SupabaseResult<Product[]>> {
    const seedRows = INITIAL_PRODUCTS.map(mapProductToDbRow);

    if (!isSupabaseConfigured()) {
      return {
        data: INITIAL_PRODUCTS,
        error: 'Supabase is not configured.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(seedRows, { onConflict: 'id' })
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: INITIAL_PRODUCTS,
          error: formatSupabaseError('Failed to reset/seed default catalog in Supabase', error),
        };
      }

      const rows = (data as ProductDbRow[] | null) ?? seedRows;
      return {
        data: rows.map(mapDbRowToProduct),
        error: null,
      };
    } catch (err) {
      return {
        data: INITIAL_PRODUCTS,
        error: formatSupabaseError('Failed to reset default catalog', err),
      };
    }
  },

  async fetchSettings(): Promise<SupabaseResult<StoreSettings>> {
    const fallbackSettings: StoreSettings = {
      ...DEFAULT_STORE_SETTINGS,
      whatsappNumber: getEnvWhatsappNumber(),
    };

    if (!isSupabaseConfigured()) {
      return {
        data: fallbackSettings,
        error: null,
      };
    }

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        return {
          data: fallbackSettings,
          error: formatSupabaseError('Failed to fetch store_settings from Supabase', error),
        };
      }

      // If row id = 1 does not exist yet, initialize it with defaults + NEXT_PUBLIC_WHATSAPP_NUMBER
      if (!data) {
        const defaultRow = mapSettingsToDbRow(fallbackSettings);
        const { data: insertedData, error: upsertError } = await supabase
          .from('store_settings')
          .upsert(defaultRow, { onConflict: 'id' })
          .select('*')
          .maybeSingle();

        if (upsertError) {
          // Return fallbackSettings without blocking the page if initial settings insert is restricted
          return {
            data: fallbackSettings,
            error: formatSupabaseError(
              'Could not initialize default store_settings row (id = 1)',
              upsertError
            ),
          };
        }

        return {
          data: mapDbRowToSettings(
            (insertedData as StoreSettingsDbRow | null) ?? defaultRow,
            fallbackSettings.whatsappNumber
          ),
          error: null,
        };
      }

      return {
        data: mapDbRowToSettings(
          data as StoreSettingsDbRow,
          fallbackSettings.whatsappNumber
        ),
        error: null,
      };
    } catch (err) {
      return {
        data: fallbackSettings,
        error: formatSupabaseError('Network error while fetching store_settings', err),
      };
    }
  },

  async upsertSettings(settings: StoreSettings): Promise<SupabaseResult<StoreSettings>> {
    const cleanedSettings: StoreSettings = {
      storeName: settings.storeName.trim(),
      heroHeadline: settings.heroHeadline.trim(),
      heroSubtext: settings.heroSubtext.trim(),
      whatsappNumber: sanitizePhoneNumber(settings.whatsappNumber || getEnvWhatsappNumber()),
    };

    const dbRow = mapSettingsToDbRow(cleanedSettings);

    if (!isSupabaseConfigured()) {
      return {
        data: cleanedSettings,
        error: 'Supabase is not configured; store settings could not be saved to database.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert(dbRow, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) {
        return {
          data: cleanedSettings,
          error: formatSupabaseError('Failed to update store_settings in Supabase', error),
        };
      }

      return {
        data: mapDbRowToSettings(
          data as StoreSettingsDbRow,
          cleanedSettings.whatsappNumber
        ),
        error: null,
      };
    } catch (err) {
      return {
        data: cleanedSettings,
        error: formatSupabaseError('Failed to save store settings', err),
      };
    }
  },

  isAdminUnlocked(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setAdminUnlocked(unlocked: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      if (unlocked) {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } else {
        window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  },

  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  },
};

export function useStoreData() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>({
    ...DEFAULT_STORE_SETTINGS,
    whatsappNumber: getEnvWhatsappNumber(),
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setSupabaseError(null);

    const [productsRes, settingsRes] = await Promise.all([
      storeRepository.fetchProducts(),
      storeRepository.fetchSettings(),
    ]);

    setProducts(productsRes.data);
    setSettings(settingsRes.data);

    const combinedError = productsRes.error || settingsRes.error;
    if (combinedError) {
      setSupabaseError(combinedError);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsAdminUnlocked(storeRepository.isAdminUnlocked());
    loadInitialData();
  }, [loadInitialData]);

  const dismissError = useCallback(() => {
    setSupabaseError(null);
  }, []);

  const addProduct = useCallback(
    async (input: ProductInput): Promise<{ product: Product; error: string | null }> => {
      setIsMutating(true);
      setSupabaseError(null);

      const newProduct: Product = {
        id: generateNextProductId(products),
        name: input.name.trim(),
        price: Math.round(Number(String(input.price).replace(/,/g, ''))),
        category: input.category.trim(),
        imageUrl: input.imageUrl.trim(),
        description: input.description?.trim() || '',
        inStock: Boolean(input.inStock),
        createdAt: new Date().toISOString(),
      };

      // Optimistically update UI state
      setProducts((prev) => [newProduct, ...prev]);

      const { data: savedProduct, error } = await storeRepository.upsertProduct(newProduct);
      if (error) {
        setSupabaseError(error);
      } else {
        setProducts((prev) =>
          prev.map((item) => (item.id === newProduct.id ? savedProduct : item))
        );
      }

      setIsMutating(false);
      return { product: savedProduct, error };
    },
    [products]
  );

  const updateProduct = useCallback(
    async (id: string, input: ProductInput): Promise<{ error: string | null }> => {
      setIsMutating(true);
      setSupabaseError(null);

      const existing = products.find((p) => p.id === id);
      const updatedProduct: Product = {
        id,
        name: input.name.trim(),
        price: Math.round(Number(String(input.price).replace(/,/g, ''))),
        category: input.category.trim(),
        imageUrl: input.imageUrl.trim(),
        fallbackUnsplashUrl: existing?.fallbackUnsplashUrl,
        description: input.description?.trim() ?? existing?.description ?? '',
        inStock: Boolean(input.inStock),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      setProducts((prev) =>
        prev.map((item) => (item.id === id ? updatedProduct : item))
      );

      const { data: savedProduct, error } = await storeRepository.upsertProduct(updatedProduct);
      if (error) {
        setSupabaseError(error);
      } else {
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? savedProduct : item))
        );
      }

      setIsMutating(false);
      return { error };
    },
    [products]
  );

  const toggleProductStock = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const target = products.find((item) => item.id === id);
      if (!target) return { error: 'Product not found.' };

      setIsMutating(true);
      setSupabaseError(null);

      const toggled: Product = {
        ...target,
        inStock: !target.inStock,
      };

      setProducts((prev) =>
        prev.map((item) => (item.id === id ? toggled : item))
      );

      const { data: savedProduct, error } = await storeRepository.upsertProduct(toggled);
      if (error) {
        setSupabaseError(error);
        // Rollback on failure
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? target : item))
        );
      } else {
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? savedProduct : item))
        );
      }

      setIsMutating(false);
      return { error };
    },
    [products]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const previousProducts = products;
      setIsMutating(true);
      setSupabaseError(null);

      setProducts((prev) => prev.filter((item) => item.id !== id));

      const { error } = await storeRepository.deleteProduct(id);
      if (error) {
        setSupabaseError(error);
        setProducts(previousProducts);
      }

      setIsMutating(false);
      return { error };
    },
    [products]
  );

  const resetCatalogToDefault = useCallback(async (): Promise<{ error: string | null }> => {
    setIsMutating(true);
    setSupabaseError(null);

    const { data, error } = await storeRepository.seedDefaultProducts();
    setProducts(data);
    if (error) {
      setSupabaseError(error);
    }

    setIsMutating(false);
    return { error };
  }, []);

  const updateSettings = useCallback(
    async (nextSettings: StoreSettings): Promise<{ error: string | null }> => {
      setIsMutating(true);
      setSupabaseError(null);

      const cleaned: StoreSettings = {
        storeName: nextSettings.storeName.trim(),
        heroHeadline: nextSettings.heroHeadline.trim(),
        heroSubtext: nextSettings.heroSubtext.trim(),
        whatsappNumber: sanitizePhoneNumber(
          nextSettings.whatsappNumber || getEnvWhatsappNumber()
        ),
      };

      setSettings(cleaned);

      const { data: savedSettings, error } = await storeRepository.upsertSettings(cleaned);
      if (error) {
        setSupabaseError(error);
      } else {
        setSettings(savedSettings);
      }

      setIsMutating(false);
      return { error };
    },
    []
  );

  const unlockAdmin = useCallback((pinInput: string): boolean => {
    const configuredPin = getEnvAdminPin();
    const ok = verifyAdminPin(pinInput, configuredPin);
    if (ok) {
      storeRepository.setAdminUnlocked(true);
      setIsAdminUnlocked(true);
    }
    return ok;
  }, []);

  const lockAdmin = useCallback((): void => {
    storeRepository.setAdminUnlocked(false);
    setIsAdminUnlocked(false);
  }, []);

  return {
    products,
    settings,
    isAdminUnlocked,
    isLoading,
    isMutating,
    supabaseError,
    dismissError,
    refreshData: loadInitialData,
    addProduct,
    updateProduct,
    toggleProductStock,
    deleteProduct,
    resetCatalogToDefault,
    updateSettings,
    unlockAdmin,
    lockAdmin,
    uploadLocalImage: storeRepository.fileToDataUrl,
  };
}
