'use client';

import React from 'react';
import { ArrowUpRight, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';

interface EditorialSectionsProps {
  onSelectCollectionCategory: (category: string) => void;
  whatsappUrl: string;
}

const FEATURED_COLLECTIONS = [
  {
    title: 'Sculptural Ceramics & Vessels',
    category: 'Ceramics',
    countLabel: 'Architectural Stoneware',
    description:
      'Hand-thrown matte bisque and chalk-glazed silhouettes designed to anchor quiet shelves and dining tables.',
    image: '/images/products/aether-ceramic-vase.png',
  },
  {
    title: 'Organic Tableware & Dining',
    category: 'Tableware',
    countLabel: 'Daily Rituals',
    description:
      'Tactile stoneware plates and lathe-turned walnut bowls finished with food-safe botanical oils.',
    image: '/images/products/kora-stoneware-plate.png',
  },
  {
    title: 'Natural Flax & Woven Textiles',
    category: 'Textiles',
    countLabel: 'Soft Architecture',
    description:
      'Unbleached Belgian linen throws and heavyweight cushion covers in warm alabaster and oat tones.',
    image: '/images/products/terra-linen-throw.png',
  },
];

export default function EditorialSections({
  onSelectCollectionCategory,
  whatsappUrl,
}: EditorialSectionsProps) {
  const handlePickCategory = (category: string) => {
    onSelectCollectionCategory(category);
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 pt-12 pb-16">
      {/* Collections Section */}
      <section id="collections" className="scroll-mt-24 border-t border-[#E5E5E0] pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-[#666666]">Curated Series · 2026 Collection</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              Explore by Material & Form
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handlePickCategory('All')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4D3E] hover:text-[#143A2F] transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Full Catalog</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_COLLECTIONS.map((col) => (
            <div
              key={col.category}
              className="group flex flex-col justify-between rounded-xl border border-[#E5E5E0] bg-white p-5 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#E4E3DF] mb-4">
                  <img
                    src={col.image}
                    alt={col.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs text-[#666666]">
                  {col.category} · {col.countLabel}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#1A1A1A]">{col.title}</h3>
                <p className="mt-1.5 text-sm text-[#666666] leading-relaxed">
                  {col.description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E5E5E0]/70">
                <button
                  type="button"
                  onClick={() => handlePickCategory(col.category)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#1B4D3E] hover:text-[#143A2F] transition-colors"
                >
                  <span>Filter {col.category}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About & Direct-to-WhatsApp Concierge Section */}
      <section id="about" className="scroll-mt-24 border-t border-[#E5E5E0] pt-12">
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-medium text-[#666666]">
                01. Our Philosophy · Direct Artisan Studio
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] text-balance">
                Thoughtful Objects for Calm, Intentional Spaces.
              </h2>
              <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-2xl">
                Every piece in the Aurora collection is produced in small batches using raw stoneware,
                sustainably harvested walnut, and unbleached flax linen. Instead of impersonal checkout
                funnels, we connect you directly with our studio concierge on WhatsApp to confirm real-time
                availability, custom gift notes, and same-day dispatch across Nigeria.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1B4D3E] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#143A2F] transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat with Studio Concierge</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="rounded-lg bg-[#F8F7F4] p-4 border border-[#E5E5E0]">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#1A1A1A]">
                  <MessageCircle className="h-4 w-4 text-[#1B4D3E] shrink-0" />
                  <span>Instant WhatsApp Ordering</span>
                </div>
                <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                  One tap pre-fills your selected item name, Naira price, and product ID for immediate
                  confirmation with our team.
                </p>
              </div>

              <div className="rounded-lg bg-[#F8F7F4] p-4 border border-[#E5E5E0]">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#1A1A1A]">
                  <ShieldCheck className="h-4 w-4 text-[#1B4D3E] shrink-0" />
                  <span>Small-Batch Quality Guarantee</span>
                </div>
                <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                  Each ceramic vessel, glass carafe, and woven throw is inspected by hand before protective
                  plastic-free packaging.
                </p>
              </div>

              <div className="rounded-lg bg-[#F8F7F4] p-4 border border-[#E5E5E0] sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-[#1A1A1A]">
                  <Sparkles className="h-4 w-4 text-[#1B4D3E] shrink-0" />
                  <span>Nationwide Doorstep Delivery</span>
                </div>
                <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                  Same-day courier dispatch within Lagos and insured express delivery to Abuja, Port Harcourt,
                  and nationwide within 48–72 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
