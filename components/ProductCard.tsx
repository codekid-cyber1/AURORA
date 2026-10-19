'use client';

import React, { useState } from 'react';
import { MessageCircle, Package } from 'lucide-react';
import {
  Product,
  formatNaira,
  buildWhatsAppOrderUrl,
} from '@/lib/store-logic';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  onOrderTriggered: (product: Product, url: string) => void;
}

export default function ProductCard({
  product,
  whatsappNumber,
  onOrderTriggered,
}: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(product.imageUrl);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  // Sync image source if product prop updates via Admin edit
  React.useEffect(() => {
    setImgSrc(product.imageUrl);
    setImgFailed(false);
  }, [product.imageUrl]);

  const waOrderUrl = buildWhatsAppOrderUrl(product, whatsappNumber);

  const handleImageError = () => {
    if (product.fallbackUnsplashUrl && imgSrc !== product.fallbackUnsplashUrl) {
      setImgSrc(product.fallbackUnsplashUrl);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group flex flex-col rounded-xl border border-[#E5E5E0] bg-white p-2.5 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-200"
    >
      {/* 1:1 Aspect Ratio Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#E4E3DF]">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className={`h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
              !product.inStock ? 'opacity-60 grayscale-[35%]' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#E4E3DF] p-4 text-center text-[#666666]">
            <Package className="h-8 w-8 mb-1.5 opacity-60" />
            <span className="text-xs font-medium">{product.name}</span>
          </div>
        )}

        {/* Out of Stock Badge if inStock === false */}
        {!product.inStock && (
          <div className="absolute top-2.5 left-2.5 rounded-md bg-[#1A1A1A]/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-2.5 sm:mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-start gap-1.5 text-[11px] sm:text-xs text-[#666666]">
            <span className="truncate">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[10px] sm:text-[11px] text-[#666666] tabular-nums shrink-0">
              {product.id}
            </span>
          </div>

          <h3 className="mt-0.5 text-xs sm:text-[15px] font-semibold text-[#1A1A1A] leading-snug line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-0.5 sm:mt-1 text-xs sm:text-[15px] font-bold text-[#1A1A1A] tabular-nums">
            {formatNaira(product.price)}
          </p>
        </div>

        {/* Full-Width Direct-to-WhatsApp CTA */}
        <div className="mt-2.5 sm:mt-3.5">
          {product.inStock ? (
            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOrderTriggered(product, waOrderUrl)}
              aria-label={`Order ${product.name} on WhatsApp for ${formatNaira(product.price)}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4D3E] px-2.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold tracking-wider text-white uppercase hover:bg-[#143A2F] transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0 fill-current/15" />
              <span>ORDER ON WHATSAPP</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-label={`${product.name} is currently out of stock`}
              className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-[#E5E5E0] px-2.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold tracking-wider text-[#666666] uppercase whitespace-nowrap shrink-0"
            >
              <span>OUT OF STOCK</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
