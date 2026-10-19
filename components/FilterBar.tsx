'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchOpen: boolean;
  totalShowing: number;
  totalCatalog: number;
}

export default function FilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  searchOpen,
  totalShowing,
  totalCatalog,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <div className="mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Product Categories"
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar"
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onSelectCategory(category)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'bg-white text-[#666666] border border-[#E5E5E0] hover:text-[#1A1A1A] hover:border-[#CCCCCC]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Real-Time Search Input + Item Count */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search vases, linen, tableware..."
              aria-label="Search products by name or category"
              className="w-full rounded-lg border border-[#E5E5E0] bg-white py-2 pl-9 pr-8 text-sm text-[#1A1A1A] placeholder:text-[#666666] focus:border-[#1B4D3E] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1A1A1A]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <span className="hidden sm:inline-block text-xs text-[#666666] tabular-nums whitespace-nowrap shrink-0">
            Showing {totalShowing} of {totalCatalog}
          </span>
        </div>
      </div>
    </div>
  );
}
