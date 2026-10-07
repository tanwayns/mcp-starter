import React from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolData, AssetCategory } from '../types/market';
import { ChevronRight, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface CardSectionProps {
  title: string;
  category: AssetCategory;
  items: SymbolData[];
}

export const MarketOverviewCards: React.FC = () => {
  const { symbols, setSelectedSymbol, setModalSymbol, setActiveCategory, recentTicks } = useMarket();

  const indices = symbols.filter(s => s.category === 'indices').slice(0, 4);
  const stocks = symbols.filter(s => s.category === 'stocks').slice(0, 4);
  const crypto = symbols.filter(s => s.category === 'crypto').slice(0, 4);
  const forex = symbols.filter(s => s.category === 'forex').slice(0, 4);
  const futures = symbols.filter(s => s.category === 'futures').slice(0, 4);
  const bonds = symbols.filter(s => s.category === 'bonds').slice(0, 3);

  const renderMiniSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPositive ? '#089981' : '#f23645'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  const renderCard = (title: string, category: AssetCategory, items: SymbolData[]) => (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-col justify-between hover:border-[#363a45] transition-colors shadow-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#2a2e39]/60">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{title}</span>
          </h3>
          <button
            onClick={() => setActiveCategory(category)}
            className="text-xs text-[#2962ff] hover:text-[#1e53e5] font-semibold flex items-center gap-0.5 group cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* List of items */}
        <div className="divide-y divide-[#2a2e39]/40">
          {items.map(item => {
            const isPos = item.changePercent >= 0;
            const tickState = recentTicks[item.symbol];
            const tickClass = tickState === 'up' ? 'animate-flash-up' : tickState === 'down' ? 'animate-flash-down' : '';

            return (
              <div
                key={item.symbol}
                onClick={() => {
                  setSelectedSymbol(item);
                  setModalSymbol(item);
                }}
                className={`py-2.5 px-1 flex items-center justify-between gap-3 hover:bg-[#131722] rounded-lg transition-colors cursor-pointer group ${tickClass}`}
              >
                {/* Left: Symbol & Exchange */}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-[#2962ff] transition-colors truncate">
                    {item.symbol}
                  </span>
                  <span className="text-[11px] text-[#787b86] truncate max-w-[110px]">
                    {item.name}
                  </span>
                </div>

                {/* Center: Sparkline */}
                <div className="shrink-0 hidden sm:block">
                  {renderMiniSparkline(item.sparkline, isPos)}
                </div>

                {/* Right: Price & % Change */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold tabular-nums text-[#d1d4dc]">
                    {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 5 ? 4 : 2 })}
                  </div>
                  <div
                    className={`text-[11px] font-semibold tabular-nums inline-flex items-center gap-0.5 ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    <span>{isPos ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Markets at a glance
        </h2>
        <span className="text-xs text-[#787b86]">Streaming live from global exchanges</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {renderCard('Major Indices', 'indices', indices)}
        {renderCard('Tech & Market Leaders', 'stocks', stocks)}
        {renderCard('Crypto Assets', 'crypto', crypto)}
        {renderCard('Commodities & Energy', 'futures', futures)}
      </div>
    </div>
  );
};
