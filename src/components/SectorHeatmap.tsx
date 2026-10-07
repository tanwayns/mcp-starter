import React, { useState } from 'react';
import { SECTORS_DATA } from '../data/marketData';
import { useMarket } from '../context/MarketContext';
import { SectorItem } from '../types/market';
import { LayoutGrid, BarChart2, TrendingUp, TrendingDown, Info } from 'lucide-react';

export const SectorHeatmap: React.FC = () => {
  const { setSelectedSymbol, setModalSymbol, symbols } = useMarket();
  const [hoveredSector, setHoveredSector] = useState<SectorItem | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'bars'>('heatmap');

  const getBgColor = (change: number) => {
    if (change >= 2.5) return 'bg-[#089981] text-white';
    if (change >= 1.0) return 'bg-[#0e7565] text-white';
    if (change > 0) return 'bg-[#185348] text-[#d1d4dc]';
    if (change === 0) return 'bg-[#2a2e39] text-[#787b86]';
    if (change > -1.0) return 'bg-[#612429] text-[#d1d4dc]';
    if (change > -2.5) return 'bg-[#982b34] text-white';
    return 'bg-[#f23645] text-white';
  };

  const getBarColor = (change: number) => {
    return change >= 0 ? '#089981' : '#f23645';
  };

  const handleLeaderClick = (ticker: string) => {
    const sym = symbols.find(s => s.symbol === ticker);
    if (sym) {
      setSelectedSymbol(sym);
      setModalSymbol(sym);
    }
  };

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden shadow-lg select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2e39] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              S&P 500 Sector Heatmap
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-[#2a2e39] text-[#787b86] font-mono font-medium">
              11 Sectors
            </span>
          </div>
          <p className="text-xs text-[#787b86] mt-0.5">
            Real-time sector performance weighted by market capitalization
          </p>
        </div>

        {/* View Mode Toggle & Legend */}
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-[#787b86]">
            <span>-3%</span>
            <span className="w-3 h-3 rounded-xs bg-[#f23645]" />
            <span className="w-3 h-3 rounded-xs bg-[#982b34]" />
            <span className="w-3 h-3 rounded-xs bg-[#2a2e39]" />
            <span className="w-3 h-3 rounded-xs bg-[#0e7565]" />
            <span className="w-3 h-3 rounded-xs bg-[#089981]" />
            <span>+3%</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'heatmap' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
              title="Heatmap View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('bars')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'bars' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
              title="Bar Chart View"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      <div className="p-4 bg-[#171b26]">
        {viewMode === 'heatmap' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {SECTORS_DATA.map(sec => {
              const isPos = sec.changePercent >= 0;
              const bgClass = getBgColor(sec.changePercent);

              return (
                <div
                  key={sec.id}
                  onMouseEnter={() => setHoveredSector(sec)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`${bgClass} rounded-lg p-3.5 flex flex-col justify-between transition-all transform hover:scale-[1.02] hover:shadow-xl cursor-pointer min-h-[110px] relative overflow-hidden group`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs leading-snug line-clamp-2">
                      {sec.name}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono shrink-0">
                      {sec.weight}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-base font-extrabold tabular-nums tracking-tight">
                        {isPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                      </div>
                      <div className="text-[10px] opacity-80 font-mono">
                        Cap: {sec.marketCap}
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleLeaderClick(sec.leader);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 hover:bg-black/50 transition-colors font-mono font-bold tracking-tight"
                      title={`View leader ${sec.leader}`}
                    >
                      {sec.leader} {sec.leaderChange >= 0 ? '+' : ''}{sec.leaderChange}%
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Bar chart mode */
          <div className="space-y-2 py-2">
            {SECTORS_DATA.sort((a, b) => b.changePercent - a.changePercent).map(sec => {
              const isPos = sec.changePercent >= 0;
              const widthPct = Math.min(100, Math.abs(sec.changePercent) * 25);

              return (
                <div key={sec.id} className="flex items-center gap-3 text-xs">
                  <div className="w-36 font-semibold text-[#d1d4dc] truncate">
                    {sec.name}
                  </div>
                  <div className="flex-1 flex items-center h-5 bg-[#131722] rounded px-1 relative">
                    <div
                      className="h-3 rounded transition-all"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: getBarColor(sec.changePercent),
                      }}
                    />
                  </div>
                  <div className={`w-16 text-right font-bold tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {isPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hovered Sector Footer Info */}
        {hoveredSector && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39] flex items-center justify-between text-xs text-[#d1d4dc]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{hoveredSector.name}</span>
              <span className="text-[#787b86]">·</span>
              <span>Constituent Stocks: <strong className="text-white">{hoveredSector.stocksCount}</strong></span>
              <span className="text-[#787b86]">·</span>
              <span>S&P 500 Weight: <strong className="text-white">{hoveredSector.weight}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#787b86]">Sector Top Mover:</span>
              <span className="font-bold text-[#2962ff] cursor-pointer" onClick={() => handleLeaderClick(hoveredSector.leader)}>
                {hoveredSector.leader} ({hoveredSector.leaderChange >= 0 ? '+' : ''}{hoveredSector.leaderChange}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
