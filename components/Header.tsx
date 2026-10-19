'use client';

import React, { useState, useRef } from 'react';
import { Search, Menu, X, MessageCircle } from 'lucide-react';
import {
  StoreSettings,
  buildGeneralWhatsAppUrl,
  recordLogoTap,
} from '@/lib/store-logic';

interface HeaderProps {
  settings: StoreSettings;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onSecretAdminTrigger: () => void;
}

export default function Header({
  settings,
  searchOpen,
  onToggleSearch,
  onSecretAdminTrigger,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tapTimestampsRef = useRef<number[]>([]);

  const generalWaUrl = buildGeneralWhatsAppUrl(
    settings.whatsappNumber,
    settings.storeName
  );

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const { triggered, timestamps } = recordLogoTap(
      tapTimestampsRef.current,
      Date.now(),
      5,
      2000
    );
    tapTimestampsRef.current = timestamps;

    if (triggered) {
      onSecretAdminTrigger();
      return;
    }

    const topEl = document.getElementById('top');
    if (topEl) {
      topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#E5E5E0]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Supports Secret 5-Tap within 2s Gesture) */}
        <a
          href="#top"
          onClick={handleLogoClick}
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A1A] whitespace-nowrap shrink-0 select-none"
        >
          {settings.storeName}
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666666]"
        >
          <a
            href="#shop"
            onClick={(e) => handleNavClick(e, 'shop')}
            className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
          >
            Shop All
          </a>
          <a
            href="#collections"
            onClick={(e) => handleNavClick(e, 'collections')}
            className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
          >
            Collections
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#1B4D3E]"
          >
            About
          </a>
        </nav>

        {/* Zone 3: Search Toggle, Mobile Menu & Primary WA Order Button (100% Customer-Clean) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleSearch}
            aria-label={searchOpen ? 'Close search bar' : 'Search products'}
            aria-expanded={searchOpen}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
              searchOpen
                ? 'border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E]'
                : 'border-[#E5E5E0] bg-white text-[#1A1A1A] hover:bg-[#F0EFEA]'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-[#E5E5E0] bg-white text-[#1A1A1A] hover:bg-[#F0EFEA] transition-colors"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <a
            href={generalWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WA Order general inquiry on WhatsApp"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#1B4D3E] px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#143A2F] transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="h-4 w-4 fill-current/15" />
            <span>WA Order</span>
          </a>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#E5E5E0] bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col space-y-1 text-sm font-medium text-[#1A1A1A]">
            <a
              href="#shop"
              onClick={(e) => handleNavClick(e, 'shop')}
              className="rounded-md px-3 py-2 hover:bg-[#F8F7F4] transition-colors"
            >
              Shop All
            </a>
            <a
              href="#collections"
              onClick={(e) => handleNavClick(e, 'collections')}
              className="rounded-md px-3 py-2 hover:bg-[#F8F7F4] transition-colors"
            >
              Collections
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, 'about')}
              className="rounded-md px-3 py-2 hover:bg-[#F8F7F4] transition-colors"
            >
              About
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
