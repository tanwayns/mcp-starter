import React, { useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SymbolData } from '../types/market';

export const TickerTape: React.FC = () => {
  const { symbols, setSelectedSymbol, setModalSymbol, recentTicks } = useMarket();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus tickers for the tape
  const tapeSymbols = symbols.filter(s =>
    ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'SOLUSD', 'NVDA', 'TSLA', 'AAPL', 'XAUUSD', 'USOIL', 'US10Y', 'EURUSD'].includes(s.symbol)
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 48;
    const height = 18;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = isPositive ? '#089981' : '#f23645';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="relative bg-[#131722] border-b border-[#2a2e39] select-none group">
      {/* Scroll controls */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-[#131722] via-[#131722]/90 to-transparent flex items-center justify-start pl-1 text-[#787b86] hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
        title="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-[#131722] via-[#131722]/90 to-transparent flex items-center justify-end pr-1 text-[#787b86] hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
        title="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Ticker items track */}
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar py-2 px-3 gap-2 divide-x divide-[#2a2e39]/50"
      >
        {tapeSymbols.map(sym => {
          const isPositive = sym.changePercent >= 0;
          const tickState = recentTicks[sym.symbol];
          const tickClass = tickState === 'up' ? 'animate-flash-up' : tickState === 'down' ? 'animate-flash-down' : '';

          return (
            <div
              key={sym.symbol}
              onClick={() => {
                setSelectedSymbol(sym);
                setModalSymbol(sym);
              }}
              className={`flex items-center gap-3 pl-3 pr-3 py-1 rounded cursor-pointer transition-colors hover:bg-[#1e222d] shrink-0 ${tickClass}`}
            >
              {/* Symbol name */}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white hover:text-[#2962ff] transition-colors">
                  {sym.symbol}
                </span>
                <span className="text-[10px] text-[#787b86] truncate max-w-[80px]">
                  {sym.name}
                </span>
              </div>

              {/* Sparkline */}
              <div className="hidden sm:block">
                {renderSparkline(sym.sparkline, isPositive)}
              </div>

              {/* Price & Change */}
              <div className="text-right">
                <div className="text-xs font-semibold tabular-nums text-[#d1d4dc]">
                  {sym.currency}{sym.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div
                  className={`text-[11px] font-medium tabular-nums ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {sym.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
