'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { StoreSettings, buildGeneralWhatsAppUrl } from '@/lib/store-logic';

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const waUrl = buildGeneralWhatsAppUrl(
    settings.whatsappNumber,
    settings.storeName
  );

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-[#E5E5E0] bg-[#EFECE6] text-[#1A1A1A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top Row matching the mockup: Brand | Social | Newsletter */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 items-start">
          {/* Column 1: Brand Wordmark & Summary */}
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
              {settings.storeName}
            </span>
            <p className="mt-2 text-xs sm:text-sm text-[#666666] max-w-xs leading-relaxed">
              Curated minimalist home essentials crafted with enduring materials and effortless
              Direct-to-WhatsApp ordering.
            </p>
          </div>

          {/* Column 2: Social */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">Social</h3>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Aurora on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] hover:border-[#1B4D3E] hover:text-[#1B4D3E] transition-colors"
              >
                <span className="text-xs font-bold tracking-tight">IG</span>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Aurora on WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] hover:border-[#1B4D3E] hover:text-[#1B4D3E] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">Newsletter</h3>
            <form onSubmit={handleNewsletterSubmit} className="mt-3 flex items-center">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subscribed) setSubscribed(false);
                }}
                placeholder="Enter your email"
                className="w-full rounded-l-md border border-r-0 border-[#D5D3CD] bg-white px-3 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#666666] focus:border-[#1B4D3E] focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="inline-flex h-[34px] sm:h-[38px] items-center justify-center rounded-r-md bg-[#1B4D3E] px-3.5 text-white hover:bg-[#143A2F] transition-colors shrink-0"
              >
                {subscribed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </form>
            {subscribed && (
              <p className="mt-1.5 text-xs font-medium text-[#1B4D3E]">
                Thank you for subscribing to {settings.storeName} updates.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar matching mockup */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DFDDD7] pt-5 text-xs text-[#666666]">
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1A1A1A] hover:text-[#1B4D3E] transition-colors"
            >
              Instagram
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1A1A1A] hover:text-[#1B4D3E] transition-colors"
            >
              WA
            </a>
          </div>
          <p className="text-center sm:text-right">
            © 2026 {settings.storeName} Home. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
