import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolData, AssetCategory } from '../types/market';
import { Star, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, BarChart2, Eye } from 'lucide-react';

type TabType = 'gainers' | 'losers' | 'most_active' | 'week52_high' | 'strong_buy' | 'all';

export const MarketMoversTable: React.FC = () => {
  const {
    symbols,
    setSelectedSymbol,
    setModalSymbol,
    watchlist,
    toggleWatchlist,
    recentTicks,
  } = useMarket();

  const [activeTab, setActiveTab] = useState<TabType>('gainers');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AssetCategory>('all');
  const [sortField, setSortField] = useState<'changePercent' | 'volumeNum' | 'price'>('changePercent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort items based on activeTab
  const filteredItems = useMemo(() => {
    let items = [...symbols];

    if (categoryFilter !== 'all') {
      items = items.filter(s => s.category === categoryFilter);
    }

    switch (activeTab) {
      case 'gainers':
        items = items.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
        break;
      case 'losers':
        items = items.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
        break;
      case 'most_active':
        items = items.sort((a, b) => b.volumeNum - a.volumeNum);
        break;
      case 'week52_high':
        items = items
          .filter(s => s.price >= s.week52High * 0.94)
          .sort((a, b) => (b.price / b.week52High) - (a.price / a.week52High));
        break;
      case 'strong_buy':
        items = items.filter(s => s.rating === 'Strong Buy');
        break;
      case 'all':
      default:
        // Generic sort
        items.sort((a, b) => {
          if (sortField === 'changePercent') {
            return sortDirection === 'desc' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent;
          } else if (sortField === 'volumeNum') {
            return sortDirection === 'desc' ? b.volumeNum - a.volumeNum : a.volumeNum - b.volumeNum;
          } else {
            return sortDirection === 'desc' ? b.price - a.price : a.price - b.price;
          }
        });
        break;
    }

    return items;
  }, [symbols, activeTab, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: 'changePercent' | 'volumeNum' | 'price') => {
    if (activeTab !== 'all') setActiveTab('all');
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Strong Buy':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#089981]/15 text-[#089981] border border-[#089981]/30">Strong Buy</span>;
      case 'Buy':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#089981]/10 text-[#089981]">Buy</span>;
      case 'Neutral':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#787b86]/15 text-[#787b86]">Neutral</span>;
      case 'Sell':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f23645]/10 text-[#f23645]">Sell</span>;
      case 'Strong Sell':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f23645]/15 text-[#f23645] border border-[#f23645]/30">Strong Sell</span>;
      default:
        return null;
    }
  };

  const renderSparkline = (points: number[], isPos: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 22;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPos ? '#089981' : '#f23645'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden shadow-lg select-none">
      {/* Top Header with Movers Category Tabs */}
      <div className="p-4 border-b border-[#2a2e39] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Market Movers & Screener
          </h2>
          <p className="text-xs text-[#787b86] mt-0.5">
            Identify biggest volume anomalies, gainers, losers, and consensus ratings
          </p>
        </div>

        {/* Category Pill Filter */}
        <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39] overflow-x-auto no-scrollbar">
          {(['all', 'stocks', 'crypto', 'indices', 'futures', 'forex'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#2a2e39] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="px-4 border-b border-[#2a2e39] bg-[#171b26] flex items-center overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'gainers', label: 'Top Gainers' },
          { id: 'losers', label: 'Top Losers' },
          { id: 'most_active', label: 'Most Active' },
          { id: 'week52_high', label: 'Near 52-Week High' },
          { id: 'strong_buy', label: 'Strong Buy Consensus' },
          { id: 'all', label: 'All Instruments' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-3 text-xs font-bold whitespace-nowrap transition-colors relative cursor-pointer ${
                isActive ? 'text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962ff]" />
              )}
            </button>
          );
        })}
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2a2e39] text-[#787b86] bg-[#1a1e28] font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-8 text-center">★</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Change %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">Change</th>
              <th
                onClick={() => handleSort('volumeNum')}
                className="py-2.5 px-3 text-right hidden md:table-cell cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden lg:table-cell">Market Cap</th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">Trend</th>
              <th className="py-2.5 px-3 text-center hidden xl:table-cell">Technical Rating</th>
              <th className="py-2.5 px-3 text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50">
            {filteredItems.map(item => {
              const isPos = item.changePercent >= 0;
              const inWatchlist = watchlist.includes(item.symbol);
              const tickState = recentTicks[item.symbol];
              const tickClass = tickState === 'up' ? 'animate-flash-up' : tickState === 'down' ? 'animate-flash-down' : '';

              return (
                <tr
                  key={item.symbol}
                  className={`hover:bg-[#131722]/80 transition-colors group ${tickClass}`}
                >
                  {/* Star */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleWatchlist(item.symbol);
                      }}
                      className="text-[#787b86] hover:text-[#ff9800] transition-colors cursor-pointer"
                      title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          inWatchlist ? 'fill-[#ff9800] text-[#ff9800]' : ''
                        }`}
                      />
                    </button>
                  </td>

                  {/* Symbol & Name */}
                  <td
                    onClick={() => {
                      setSelectedSymbol(item);
                      setModalSymbol(item);
                    }}
                    className="py-3 px-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors flex items-center gap-1.5">
                          <span>{item.symbol}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#2a2e39] text-[#787b86] font-mono">
                            {item.exchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787b86] truncate max-w-[140px]">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#d1d4dc]">
                    {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 5 ? 4 : 2 })}
                  </td>

                  {/* Change % */}
                  <td className="py-3 px-3 text-right tabular-nums font-bold">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                        isPos
                          ? 'bg-[#089981]/15 text-[#089981]'
                          : 'bg-[#f23645]/15 text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* Change $ */}
                  <td
                    className={`py-3 px-3 text-right tabular-nums font-medium hidden sm:table-cell ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? '+' : ''}{item.change.toFixed(2)}
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-3 text-right tabular-nums text-[#787b86] hidden md:table-cell font-mono">
                    {item.volume}
                  </td>

                  {/* Market Cap */}
                  <td className="py-3 px-3 text-right tabular-nums text-[#787b86] hidden lg:table-cell font-mono">
                    {item.marketCap || '—'}
                  </td>

                  {/* Sparkline */}
                  <td className="py-3 px-3 text-center hidden md:table-cell">
                    {renderSparkline(item.sparkline, isPos)}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-3 text-center hidden xl:table-cell">
                    {renderRatingBadge(item.rating)}
                  </td>

                  {/* Quick Action Button */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedSymbol(item);
                        setModalSymbol(item);
                      }}
                      className="px-2.5 py-1 rounded bg-[#2a2e39] hover:bg-[#2962ff] hover:text-white text-[11px] font-semibold text-[#d1d4dc] transition-colors cursor-pointer"
                    >
                      Chart
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
