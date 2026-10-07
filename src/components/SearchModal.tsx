import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetCategory, SymbolData } from '../types/market';
import { Search, X, Star, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    searchOpen,
    setSearchOpen,
    symbols,
    setSelectedSymbol,
    setModalSymbol,
    watchlist,
    toggleWatchlist,
  } = useMarket();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AssetCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const filtered = symbols.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesQuery =
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSelect = (sym: SymbolData) => {
    setSelectedSymbol(sym);
    setModalSymbol(sym);
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col divide-y divide-[#2a2e39]">
        {/* Search Input Bar */}
        <div className="p-3.5 flex items-center gap-3 bg-[#171b26]">
          <Search className="w-5 h-5 text-[#2962ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search symbol, ticker, market (e.g. AAPL, BTC, SPX, GOLD)..."
            className="w-full bg-transparent text-sm text-white placeholder-[#787b86] outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#787b86] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-[#2a2e39] text-[10px] font-mono text-[#787b86]">ESC</kbd>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 py-2 bg-[#131722] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'indices', 'stocks', 'crypto', 'futures', 'forex', 'bonds'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2a2e39]/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787b86]">
              No instruments found matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isPos = item.changePercent >= 0;
              const inWatchlist = watchlist.includes(item.symbol);

              return (
                <div
                  key={item.symbol}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#2a2e39]/80' : 'hover:bg-[#131722]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleWatchlist(item.symbol);
                      }}
                      className="text-[#787b86] hover:text-[#ff9800] p-1 cursor-pointer"
                      title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star className={`w-4 h-4 ${inWatchlist ? 'fill-[#ff9800] text-[#ff9800]' : ''}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#131722] text-[#787b86] font-mono">
                          {item.exchange}
                        </span>
                        <span className="text-[10px] text-[#787b86] uppercase">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate max-w-sm">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold tabular-nums text-white">
                      {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 5 ? 4 : 2 })}
                    </div>
                    <div
                      className={`text-[11px] font-semibold tabular-nums flex items-center justify-end gap-0.5 ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{isPos ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-[#171b26] flex items-center justify-between text-[11px] text-[#787b86]">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="font-mono text-white">↑</kbd> <kbd className="font-mono text-white">↓</kbd></span>
            <span>Select: <kbd className="font-mono text-white">↵</kbd></span>
          </div>
          <button
            onClick={() => setSearchOpen(false)}
            className="hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
