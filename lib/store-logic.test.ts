import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PRODUCTS,
  DEFAULT_WHATSAPP_NUMBER,
  formatNaira,
  buildWhatsAppMessage,
  buildWhatsAppOrderUrl,
  extractCategories,
  filterProducts,
  validateProductInput,
  validateStoreSettings,
  generateNextProductId,
  verifyAdminPin,
  mapDbRowToProduct,
  mapProductToDbRow,
  mapDbRowToSettings,
  mapSettingsToDbRow,
  normalizeSupabaseUrl,
  shouldOpenAdminFromLocation,
  recordLogoTap,
  isAdminKeyboardShortcut,
} from './store-logic.ts';

test('hidden admin triggers: URL hash/query, 5-tap within 2s, and Ctrl/Cmd+Shift+A', () => {
  assert.equal(shouldOpenAdminFromLocation('#admin', ''), true);
  assert.equal(shouldOpenAdminFromLocation('#ADMIN', ''), true);
  assert.equal(shouldOpenAdminFromLocation('', '?admin=true'), true);
  assert.equal(shouldOpenAdminFromLocation('', '?admin=1'), true);
  assert.equal(shouldOpenAdminFromLocation('#shop', '?category=Ceramics'), false);

  let taps: number[] = [];
  for (let i = 0; i < 4; i++) {
    const res = recordLogoTap(taps, 1000 + i * 300);
    assert.equal(res.triggered, false);
    taps = res.timestamps;
  }
  const fifthTap = recordLogoTap(taps, 2500);
  assert.equal(fifthTap.triggered, true);
  assert.equal(fifthTap.timestamps.length, 0);

  // Taps spread over more than 2 seconds should not trigger
  let slowTaps: number[] = [];
  for (let i = 0; i < 5; i++) {
    const res = recordLogoTap(slowTaps, 1000 + i * 700);
    assert.equal(res.triggered, false);
    slowTaps = res.timestamps;
  }

  assert.equal(
    isAdminKeyboardShortcut({ key: 'A', ctrlKey: true, shiftKey: true }),
    true
  );
  assert.equal(
    isAdminKeyboardShortcut({ key: 'a', metaKey: true, shiftKey: true }),
    true
  );
  assert.equal(
    isAdminKeyboardShortcut({ key: 'a', ctrlKey: true, shiftKey: false }),
    false
  );
});

test('normalizeSupabaseUrl handles project IDs, domains, and full https URLs', () => {
  assert.equal(
    normalizeSupabaseUrl('cnciylkhabcdefghijkl'),
    'https://cnciylkhabcdefghijkl.supabase.co'
  );
  assert.equal(
    normalizeSupabaseUrl('cnciylkhabcdefghijkl.supabase.co'),
    'https://cnciylkhabcdefghijkl.supabase.co'
  );
  assert.equal(
    normalizeSupabaseUrl('https://cnciylkhabcdefghijkl.supabase.co/'),
    'https://cnciylkhabcdefghijkl.supabase.co'
  );
  assert.equal(normalizeSupabaseUrl(''), '');
});

test('INITIAL_PRODUCTS contains 8 pre-populated minimalist home products', () => {
  assert.equal(INITIAL_PRODUCTS.length, 8);
  assert.equal(INITIAL_PRODUCTS[0].name, 'Aether Ceramic Vase');
  assert.equal(INITIAL_PRODUCTS[7].name, 'Aura Cushion Cover');
  assert.ok(INITIAL_PRODUCTS.every((p) => p.inStock === true));
});

test('formatNaira formats numbers with the Naira symbol and comma separators', () => {
  assert.equal(formatNaira(85000), '₦85,000');
  assert.equal(formatNaira(140000), '₦140,000');
  assert.equal(formatNaira(0), '₦0');
});

test('buildWhatsAppMessage and buildWhatsAppOrderUrl strip non-digits and match exact prompt template', () => {
  const product = INITIAL_PRODUCTS[0]; // Aether Ceramic Vase, 85000, AUR-001
  const expectedMsg =
    'Hello! I would like to order:\n\n*Product:* Aether Ceramic Vase\n*Price:* ₦85,000\n*Product ID:* AUR-001\n\nIs this currently available?';
  assert.equal(buildWhatsAppMessage(product), expectedMsg);

  const url = buildWhatsAppOrderUrl(product, '+234 (800) 000-0000');
  assert.equal(
    url,
    `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(expectedMsg)}`
  );
});

test('Supabase product and store_settings mappers convert between camelCase and snake_case', () => {
  const sample = INITIAL_PRODUCTS[0];
  const dbRow = mapProductToDbRow(sample);
  assert.equal(dbRow.id, 'AUR-001');
  assert.equal(dbRow.image_url, sample.imageUrl);
  assert.equal(dbRow.in_stock, true);

  const roundTrip = mapDbRowToProduct(dbRow);
  assert.equal(roundTrip.id, sample.id);
  assert.equal(roundTrip.imageUrl, sample.imageUrl);
  assert.equal(roundTrip.inStock, true);

  const settingsRow = mapSettingsToDbRow({
    storeName: 'AURORA LAGOS',
    heroHeadline: 'MINIMAL LIVING.',
    heroSubtext: 'Handcrafted.',
    whatsappNumber: '+234-809-111-2222',
  });
  assert.equal(settingsRow.id, 1);
  assert.equal(settingsRow.store_name, 'AURORA LAGOS');
  assert.equal(settingsRow.whatsapp_number, '2348091112222');

  const mappedSettings = mapDbRowToSettings(settingsRow);
  assert.equal(mappedSettings.storeName, 'AURORA LAGOS');
  assert.equal(mappedSettings.whatsappNumber, '2348091112222');
});

test('extractCategories returns All followed by unique product categories', () => {
  const categories = extractCategories(INITIAL_PRODUCTS);
  assert.equal(categories[0], 'All');
  assert.ok(categories.includes('Ceramics'));
  assert.ok(categories.includes('Textiles'));
  assert.ok(categories.includes('Tableware'));
  assert.equal(new Set(categories).size, categories.length);
});

test('filterProducts filters by category and real-time search query', () => {
  const textiles = filterProducts(INITIAL_PRODUCTS, 'Textiles', '');
  assert.equal(textiles.length, 2);

  const candles = filterProducts(INITIAL_PRODUCTS, 'All', 'candle');
  assert.equal(candles.length, 2);

  const specific = filterProducts(INITIAL_PRODUCTS, 'Tableware', 'Solstice');
  assert.equal(specific.length, 1);
  assert.equal(specific[0].name, 'Solstice Wooden Bowl');
});

test('validateProductInput enforces required fields and positive numeric price', () => {
  const invalid = validateProductInput({
    name: '',
    price: 0,
    category: '',
    imageUrl: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.price);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.imageUrl);

  const valid = validateProductInput({
    name: 'Nordic Oak Stool',
    price: 125000,
    category: 'Furniture',
    imageUrl: '/images/products/aether-ceramic-vase.png',
    inStock: true,
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('validateStoreSettings validates storeName, heroHeadline, and whatsappNumber', () => {
  const invalid = validateStoreSettings({
    storeName: '',
    heroHeadline: 'MODERN',
    whatsappNumber: '123',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.storeName);
  assert.ok(invalid.errors.whatsappNumber);

  const valid = validateStoreSettings({
    storeName: 'AURORA STUDIO',
    heroHeadline: 'MODERN ESSENTIALS FOR MINIMAL LIVING.',
    whatsappNumber: '2348012345678',
  });
  assert.equal(valid.valid, true);
});

test('generateNextProductId increments sequentially and verifyAdminPin checks PIN', () => {
  assert.equal(generateNextProductId(INITIAL_PRODUCTS), 'AUR-009');
  assert.equal(verifyAdminPin('1234', '1234'), true);
  assert.equal(verifyAdminPin('0000', '1234'), false);
});
