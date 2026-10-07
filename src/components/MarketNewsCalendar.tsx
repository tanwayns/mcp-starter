import React, { useState } from 'react';
import { NEWS_DATA, ECONOMIC_EVENTS } from '../data/marketData';
import { useMarket } from '../context/MarketContext';
import { NewsItem, EconomicEvent } from '../types/market';
import { Newspaper, Calendar, Compass, ExternalLink, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';

export const MarketNewsCalendar: React.FC = () => {
  const { setSelectedSymbol, setModalSymbol, symbols } = useMarket();
  const [newsFilter, setNewsFilter] = useState<'All' | 'Stocks' | 'Crypto' | 'Macro'>('All');

  const filteredNews = newsFilter === 'All' 
    ? NEWS_DATA 
    : NEWS_DATA.filter(n => n.category === newsFilter);

  const handleTickerClick = (ticker: string) => {
    const sym = symbols.find(s => s.symbol === ticker);
    if (sym) {
      setSelectedSymbol(sym);
      setModalSymbol(sym);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      {/* 1 & 2: Market News Stream (2 columns) */}
      <div className="lg:col-span-2 bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#2a2e39] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#2962ff]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Top Market Stories & Insights
              </h3>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
              {(['All', 'Stocks', 'Crypto', 'Macro'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewsFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    newsFilter === cat
                      ? 'bg-[#2a2e39] text-white'
                      : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* News Items */}
          <div className="divide-y divide-[#2a2e39]/50">
            {filteredNews.map(item => (
              <div
                key={item.id}
                className="p-4 hover:bg-[#171b26] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#787b86]">
                    <span className="font-semibold text-[#d1d4dc]">{item.source}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeAgo}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{item.category}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#d1d4dc] group-hover:text-white group-hover:text-[#2962ff] transition-colors leading-snug cursor-pointer">
                    {item.title}
                  </h4>

                  {/* Related Symbols */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#787b86]">Mentions:</span>
                    {item.relatedSymbols.map(symStr => (
                      <button
                        key={symStr}
                        onClick={() => handleTickerClick(symStr)}
                        className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#131722] hover:bg-[#2962ff] text-[#2962ff] hover:text-white border border-[#2a2e39] transition-colors cursor-pointer"
                      >
                        {symStr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View all news footer */}
        <div className="p-3 border-t border-[#2a2e39] bg-[#171b26] text-center">
          <button className="text-xs font-semibold text-[#2962ff] hover:text-[#1e53e5] transition-colors cursor-pointer">
            View All Market News & Press Releases →
          </button>
        </div>
      </div>

      {/* 3: Economic Calendar & Sentiment (1 column) */}
      <div className="space-y-6">
        {/* Market Sentiment / Fear & Greed */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#089981]" />
              <h3 className="text-sm font-bold text-white">Market Sentiment Gauge</h3>
            </div>
            <span className="text-xs font-bold text-[#089981]">Greed</span>
          </div>

          <div className="py-4 flex flex-col items-center">
            {/* Gauge dial */}
            <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                {/* Dial background arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#2a2e39"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Active value arc (64%) */}
                <path
                  d="M 10 50 A 40 40 0 0 1 82 25"
                  fill="none"
                  stroke="#089981"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              {/* Score text */}
              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">64</span>
                <span className="text-[10px] uppercase font-bold text-[#089981]">Greed</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 text-center text-[10px] text-[#787b86] pt-3 border-t border-[#2a2e39]/60 mt-3 font-medium">
              <div>
                <span>Prev Close</span>
                <div className="font-bold text-white">61</div>
              </div>
              <div>
                <span>1 Week Ago</span>
                <div className="font-bold text-white">58</div>
              </div>
              <div>
                <span>1 Year Ago</span>
                <div className="font-bold text-white">45</div>
              </div>
            </div>
          </div>
        </div>

        {/* Economic Calendar Events */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ff9800]" />
              <h3 className="text-sm font-bold text-white">Economic Calendar</h3>
            </div>
            <span className="text-[11px] text-[#787b86]">Today (EDT)</span>
          </div>

          <div className="divide-y divide-[#2a2e39]/50 mt-2">
            {ECONOMIC_EVENTS.map(ev => (
              <div key={ev.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium text-[#d1d4dc]">
                    <span>{ev.flag}</span>
                    <span className="text-[#787b86] font-mono">{ev.time}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      ev.impact === 'high'
                        ? 'bg-[#f23645]/20 text-[#f23645]'
                        : 'bg-[#ff9800]/20 text-[#ff9800]'
                    }`}
                  >
                    {ev.impact}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white leading-tight">
                  {ev.event}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-[#787b86]">
                  <span>Act: <strong className="text-white">{ev.actual || '—'}</strong></span>
                  <span>Frc: <strong className="text-[#d1d4dc]">{ev.forecast || '—'}</strong></span>
                  <span>Prev: <strong className="text-[#787b86]">{ev.previous || '—'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
