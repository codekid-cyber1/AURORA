'use client';

import React from 'react';
import { StoreSettings } from '@/lib/store-logic';

interface HeroSectionProps {
  settings: StoreSettings;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const handleScrollToShop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="top"
      className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-xl bg-[#D8D8D6] border border-[#E5E5E0]">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center min-h-[210px] sm:min-h-[320px] lg:min-h-[400px]">
          {/* Left Editorial Copy (Centered on mobile per mobile mockup, left-aligned on desktop) */}
          <div className="z-10 md:col-span-7 px-5 py-7 sm:px-10 sm:py-10 lg:pl-14 lg:pr-6 text-center md:text-left flex flex-col items-center md:items-start justify-center">
            <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#1A1A1A] leading-[1.12] max-w-xl text-balance">
              {settings.heroHeadline}
            </h1>
            <p className="mt-2.5 sm:mt-4 text-xs sm:text-base lg:text-lg text-[#3D3D3D] max-w-md leading-relaxed">
              {settings.heroSubtext}
            </p>
            <div className="mt-4 sm:mt-7">
              <a
                href="#shop"
                onClick={handleScrollToShop}
                className="inline-flex items-center justify-center rounded-lg bg-[#1B4D3E] px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-wider text-white uppercase shadow-xs hover:bg-[#143A2F] transition-colors whitespace-nowrap shrink-0"
              >
                SHOP LATEST ARRIVALS
              </a>
            </div>
          </div>

          {/* Right Sculptural Ceramic Vases on Floating Oak Shelf (Desktop & Tablet) */}
          <div className="relative hidden md:flex md:col-span-5 h-72 lg:h-[400px] w-full items-end justify-end overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#D8D8D6] via-[#D8D8D6]/60 to-transparent"
            />
            <img
              src="/images/hero-vases.png"
              alt="Minimalist ceramic vases arranged on a natural oak floating shelf"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-right-bottom select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
