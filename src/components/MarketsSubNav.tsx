import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketCategory } from '../types/market';
import { Globe, Layers, BarChart2, Flame, Newspaper, PieChart } from 'lucide-react';

interface CategoryOption {
  id: MarketCategory;
  label: string;
  count?: number;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'indices', label: 'Indices', count: 8 },
  { id: 'stocks', label: 'Stocks', count: 10 },
  { id: 'crypto', label: 'Crypto', count: 5 },
  { id: 'forex', label: 'Forex', count: 4 },
  { id: 'futures', label: 'Futures & Commodities', count: 4 },
  { id: 'bonds', label: 'Bonds', count: 3 },
  { id: 'heatmaps', label: 'Sector Heatmap' },
  { id: 'news', label: 'News & Calendar' },
];

const REGIONS = ['US', 'Worldwide', 'Europe', 'Asia-Pacific'];

export const MarketsSubNav: React.FC = () => {
  const { activeCategory, setActiveCategory, activeRegion, setActiveRegion } = useMarket();

  return (
    <div className="bg-[#131722] border-b border-[#2a2e39] select-none">
      <div className="max-w-[1720px] mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1 pt-2 md:pt-0">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-[#2962ff]/20 text-[#2962ff]' : 'bg-[#1e222d] text-[#787b86]'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962ff]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Region selector pills */}
        <div className="flex items-center gap-1.5 pb-2 md:pb-0 shrink-0">
          <Globe className="w-3.5 h-3.5 text-[#787b86]" />
          <div className="flex items-center gap-1 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39]">
            {REGIONS.map(reg => (
              <button
                key={reg}
                onClick={() => setActiveRegion(reg)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeRegion === reg
                    ? 'bg-[#2a2e39] text-white shadow-sm'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
