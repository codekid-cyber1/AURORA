export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  fallbackUnsplashUrl?: string;
  description?: string;
  inStock: boolean;
  createdAt: string;
}

export interface ProductDbRow {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description?: string | null;
  in_stock: boolean;
  created_at?: string | null;
}

export interface ProductInput {
  name: string;
  price: number | string;
  category: string;
  imageUrl: string;
  description?: string;
  inStock: boolean;
}

export interface StoreSettings {
  storeName: string;
  heroHeadline: string;
  heroSubtext: string;
  whatsappNumber: string;
}

export interface StoreSettingsDbRow {
  id: number;
  store_name: string;
  hero_headline: string;
  hero_subtext: string;
  whatsapp_number: string;
}

export const DEFAULT_WHATSAPP_NUMBER = '2348000000000';
export const DEFAULT_ADMIN_PIN = '1234';

export function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === 'MY_SUPABASE_URL') return '';
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.endsWith('.supabase.co')) {
    return `https://${trimmed}`;
  }
  // If user provided their Supabase project reference ID (e.g. "cnciylkh...")
  if (/^[a-z0-9-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return `https://${trimmed}`;
}

export function getEnvWhatsappNumber(): string {
  const raw =
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      : DEFAULT_WHATSAPP_NUMBER;
  return sanitizePhoneNumber(raw);
}

export function getEnvAdminPin(): string {
  const raw =
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ADMIN_PIN
      ? process.env.NEXT_PUBLIC_ADMIN_PIN.trim()
      : '';
  return raw || DEFAULT_ADMIN_PIN;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'AURORA',
  heroHeadline: 'MODERN ESSENTIALS FOR MINIMAL LIVING.',
  heroSubtext: 'Curated designs for the home. Crafted with quality and simplicity.',
  whatsappNumber: getEnvWhatsappNumber(),
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'AUR-001',
    name: 'Aether Ceramic Vase',
    price: 85000,
    category: 'Ceramics',
    imageUrl: '/images/products/aether-ceramic-vase.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    description:
      'Hand-thrown matte stoneware vessel with a rounded silhouette and raw bisque texture.',
    inStock: true,
    createdAt: '2026-01-17T09:00:00.000Z',
  },
  {
    id: 'AUR-002',
    name: 'Nova Glass Carafe',
    price: 60000,
    category: 'Glassware',
    imageUrl: '/images/products/nova-glass-carafe.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description:
      'Mouth-blown borosilicate glass carafe with a dark hand-finished rim for water or botanicals.',
    inStock: true,
    createdAt: '2026-01-16T09:00:00.000Z',
  },
  {
    id: 'AUR-003',
    name: 'Terra Linen Throw',
    price: 110000,
    category: 'Textiles',
    imageUrl: '/images/products/terra-linen-throw.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
    description:
      'Heavyweight Belgian flax linen throw blanket in warm oat with twisted fringe edges.',
    inStock: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'AUR-004',
    name: 'Lunar Candle Holder',
    price: 75000,
    category: 'Lighting',
    imageUrl: '/images/products/lunar-candle-holder.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    description:
      'Cast blackened iron taper holder featuring an architectural ring handle and weighted base.',
    inStock: true,
    createdAt: '2026-01-14T09:00:00.000Z',
  },
  {
    id: 'AUR-005',
    name: 'Kora Stoneware Plate',
    price: 140000,
    category: 'Tableware',
    imageUrl: '/images/products/kora-stoneware-plate.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    description:
      'Four-piece organic rimmed stoneware dining set finished in speckled chalk glaze.',
    inStock: true,
    createdAt: '2026-01-13T09:00:00.000Z',
  },
  {
    id: 'AUR-006',
    name: 'Solstice Wooden Bowl',
    price: 95000,
    category: 'Tableware',
    imageUrl: '/images/products/solstice-wooden-bowl.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=800&q=80',
    description:
      'Lathe-turned solid walnut serving bowl treated with food-safe cold-pressed flax oil.',
    inStock: true,
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'AUR-007',
    name: 'Ember Scented Candle',
    price: 45000,
    category: 'Home Fragrance',
    imageUrl: '/images/products/ember-scented-candle.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80',
    description:
      'Botanical soy wax blend with notes of cedarwood, smoked vetiver, and bergamot rind.',
    inStock: true,
    createdAt: '2026-01-11T09:00:00.000Z',
  },
  {
    id: 'AUR-008',
    name: 'Aura Cushion Cover',
    price: 65000,
    category: 'Textiles',
    imageUrl: '/images/products/aura-cushion-cover.png',
    fallbackUnsplashUrl:
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    description:
      'Unbleached woven linen-cotton cushion cover with concealed brass zip closure.',
    inStock: true,
    createdAt: '2026-01-10T09:00:00.000Z',
  },
];

export const PRESET_PRODUCT_IMAGES: { label: string; url: string; unsplashUrl: string }[] = [
  {
    label: 'Ceramic Vase (Studio)',
    url: '/images/products/aether-ceramic-vase.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Glass Carafe (Studio)',
    url: '/images/products/nova-glass-carafe.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Linen Throw (Studio)',
    url: '/images/products/terra-linen-throw.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Candle Holder (Studio)',
    url: '/images/products/lunar-candle-holder.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Stoneware Set (Studio)',
    url: '/images/products/kora-stoneware-plate.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Wooden Bowl (Studio)',
    url: '/images/products/solstice-wooden-bowl.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Scented Candle (Studio)',
    url: '/images/products/ember-scented-candle.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cushion Cover (Studio)',
    url: '/images/products/aura-cushion-cover.png',
    unsplashUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
  },
];

export function mapDbRowToProduct(row: ProductDbRow): Product {
  const matchingInitial = INITIAL_PRODUCTS.find((p) => p.id === row.id);
  return {
    id: String(row.id),
    name: String(row.name || ''),
    price: Number(row.price) || 0,
    category: String(row.category || 'Uncategorized'),
    imageUrl: String(row.image_url || matchingInitial?.imageUrl || '/images/products/aether-ceramic-vase.png'),
    fallbackUnsplashUrl: matchingInitial?.fallbackUnsplashUrl,
    description: row.description ? String(row.description) : matchingInitial?.description || '',
    inStock: typeof row.in_stock === 'boolean' ? row.in_stock : true,
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
  };
}

export function mapProductToDbRow(product: Product): ProductDbRow {
  return {
    id: product.id,
    name: product.name.trim(),
    price: Math.round(Number(product.price) || 0),
    category: product.category.trim(),
    image_url: product.imageUrl.trim(),
    description: product.description?.trim() || '',
    in_stock: Boolean(product.inStock),
    created_at: product.createdAt || new Date().toISOString(),
  };
}

export function mapDbRowToSettings(
  row: Partial<StoreSettingsDbRow> | null | undefined,
  fallbackWhatsapp?: string
): StoreSettings {
  const defaultWa = sanitizePhoneNumber(fallbackWhatsapp || getEnvWhatsappNumber());
  if (!row) {
    return {
      ...DEFAULT_STORE_SETTINGS,
      whatsappNumber: defaultWa,
    };
  }
  return {
    storeName: (row.store_name || DEFAULT_STORE_SETTINGS.storeName).trim(),
    heroHeadline: (row.hero_headline || DEFAULT_STORE_SETTINGS.heroHeadline).trim(),
    heroSubtext: (row.hero_subtext || DEFAULT_STORE_SETTINGS.heroSubtext).trim(),
    whatsappNumber: sanitizePhoneNumber(row.whatsapp_number || defaultWa),
  };
}

export function mapSettingsToDbRow(settings: StoreSettings): StoreSettingsDbRow {
  return {
    id: 1,
    store_name: settings.storeName.trim(),
    hero_headline: settings.heroHeadline.trim(),
    hero_subtext: settings.heroSubtext.trim(),
    whatsapp_number: sanitizePhoneNumber(settings.whatsappNumber),
  };
}

export function formatNaira(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `₦${safeAmount.toLocaleString('en-US')}`;
}

export function sanitizePhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/[^\d]/g, '');
  return digits || DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppMessage(product: Pick<Product, 'id' | 'name' | 'price'>): string {
  const formattedPrice = Math.round(product.price).toLocaleString('en-US');
  return `Hello! I would like to order:\n\n*Product:* ${product.name}\n*Price:* ₦${formattedPrice}\n*Product ID:* ${product.id}\n\nIs this currently available?`;
}

export function buildWhatsAppOrderUrl(
  product: Pick<Product, 'id' | 'name' | 'price'>,
  whatsappNumber: string = getEnvWhatsappNumber()
): string {
  const cleanPhone = sanitizePhoneNumber(whatsappNumber);
  const message = buildWhatsAppMessage(product);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl(
  whatsappNumber: string = getEnvWhatsappNumber(),
  storeName: string = 'AURORA'
): string {
  const cleanPhone = sanitizePhoneNumber(whatsappNumber);
  const message = `Hello ${storeName}! I would like to make an inquiry about your current collection.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function extractCategories(products: Product[]): string[] {
  const seen = new Set<string>();
  for (const product of products) {
    const trimmed = product.category.trim();
    if (trimmed) {
      seen.add(trimmed);
    }
  }
  return ['All', ...Array.from(seen)];
}

export function filterProducts(
  products: Product[],
  selectedCategory: string,
  searchQuery: string
): Product[] {
  const normalizedCategory = (selectedCategory || 'All').trim().toLowerCase();
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory =
      normalizedCategory === 'all' ||
      product.category.trim().toLowerCase() === normalizedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${product.name} ${product.category} ${product.id} ${
      product.description || ''
    }`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function validateProductInput(input: Partial<ProductInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const name = (input.name ?? '').trim();
  if (!name) {
    errors.name = 'Product name is required.';
  } else if (name.length < 2) {
    errors.name = 'Product name must be at least 2 characters.';
  }

  const rawPrice = input.price;
  const parsedPrice =
    typeof rawPrice === 'number' ? rawPrice : Number(String(rawPrice ?? '').replace(/,/g, '').trim());

  if (
    rawPrice === undefined ||
    rawPrice === null ||
    String(rawPrice).trim() === '' ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice <= 0
  ) {
    errors.price = 'Please enter a valid price greater than ₦0.';
  }

  const category = (input.category ?? '').trim();
  if (!category) {
    errors.category = 'Category is required.';
  }

  const imageUrl = (input.imageUrl ?? '').trim();
  if (!imageUrl) {
    errors.imageUrl = 'Please provide an image URL or upload an image.';
  } else if (
    !imageUrl.startsWith('/') &&
    !imageUrl.startsWith('http://') &&
    !imageUrl.startsWith('https://') &&
    !imageUrl.startsWith('data:image/') &&
    !imageUrl.startsWith('blob:')
  ) {
    errors.imageUrl = 'Image must be a valid URL, local asset path, or uploaded file.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStoreSettings(input: Partial<StoreSettings>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!(input.storeName ?? '').trim()) {
    errors.storeName = 'Store name is required.';
  }

  if (!(input.heroHeadline ?? '').trim()) {
    errors.heroHeadline = 'Hero headline is required.';
  }

  const cleanDigits = (input.whatsappNumber ?? '').replace(/[^\d]/g, '');
  if (cleanDigits.length < 8 || cleanDigits.length > 15) {
    errors.whatsappNumber =
      'Enter a valid international WhatsApp number (8–15 digits, e.g. 2348000000000).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function generateNextProductId(existingProducts: Product[]): string {
  let maxNumber = 0;
  for (const product of existingProducts) {
    const match = /^AUR-(\d+)$/i.exec(product.id);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  const nextNumber = maxNumber + 1;
  return `AUR-${String(nextNumber).padStart(3, '0')}`;
}

export function verifyAdminPin(inputPin: string, configuredPin?: string): boolean {
  const expected = (configuredPin || getEnvAdminPin()).trim();
  return inputPin.trim() === expected;
}

export function shouldOpenAdminFromLocation(hash: string, search: string): boolean {
  const cleanHash = (hash || '').trim().toLowerCase();
  if (cleanHash === '#admin') {
    return true;
  }
  const rawSearch = (search || '').trim();
  if (!rawSearch) return false;
  const params = new URLSearchParams(rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch);
  const adminParam = (params.get('admin') || '').toLowerCase();
  return adminParam === 'true' || adminParam === '1';
}

export function recordLogoTap(
  previousTimestamps: number[],
  nowMs: number,
  requiredTaps: number = 5,
  windowMs: number = 2000
): { triggered: boolean; timestamps: number[] } {
  const recent = previousTimestamps.filter((t) => nowMs - t <= windowMs);
  recent.push(nowMs);
  if (recent.length >= requiredTaps) {
    return { triggered: true, timestamps: [] };
  }
  return { triggered: false, timestamps: recent };
}

export function isAdminKeyboardShortcut(event: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}): boolean {
  const hasModifier = Boolean(event.ctrlKey || event.metaKey);
  const hasShift = Boolean(event.shiftKey);
  const isKeyA = (event.key || '').toLowerCase() === 'a';
  return hasModifier && hasShift && isKeyA;
}
