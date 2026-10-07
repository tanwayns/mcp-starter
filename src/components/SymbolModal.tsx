import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { TimeFrame, ChartType } from '../types/market';
import { X, Star, Maximize2, ArrowUpRight, ArrowDownRight, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';

export const SymbolModal: React.FC = () => {
  const { modalSymbol, setModalSymbol, watchlist, toggleWatchlist, recentTicks } = useMarket();
  const [selectedTf, setSelectedTf] = useState<TimeFrame>('1M');
  const [chartMode, setChartMode] = useState<ChartType>('candlestick');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  if (!modalSymbol) return null;

  const inWatchlist = watchlist.includes(modalSymbol.symbol);
  const isPos = modalSymbol.changePercent >= 0;
  const tickState = recentTicks[modalSymbol.symbol];

  const candles = modalSymbol.candles[selectedTf] || modalSymbol.candles['1M'];

  // Range calculations
  const dayRangePct = Math.min(100, Math.max(0, ((modalSymbol.price - modalSymbol.low24h) / (modalSymbol.high24h - modalSymbol.low24h || 1)) * 100));
  const yearRangePct = Math.min(100, Math.max(0, ((modalSymbol.price - modalSymbol.week52Low) / (modalSymbol.week52High - modalSymbol.week52Low || 1)) * 100));

  const handlePlaceOrder = () => {
    const total = (modalSymbol.price * tradeShares).toFixed(2);
    setOrderNotification(`Order filled! ${tradeAction.toUpperCase()} ${tradeShares} ${modalSymbol.symbol} @ ${modalSymbol.currency}${modalSymbol.price} (Total: ${modalSymbol.currency}${total})`);
    setTimeout(() => {
      setOrderNotification(null);
    }, 4000);
  };

  // Mini Chart Rendering
  const svgWidth = 600;
  const svgHeight = 220;
  const minP = Math.min(...candles.map(c => c.low));
  const maxP = Math.max(...candles.map(c => c.high));
  const rangeP = maxP - minP || 1;

  const getX = (i: number) => (i / (candles.length - 1)) * (svgWidth - 20) + 10;
  const getY = (val: number) => svgHeight - ((val - minP) / rangeP) * (svgHeight - 20) - 10;
  const candleW = Math.max(2, Math.min(12, (svgWidth / candles.length) * 0.6));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col divide-y divide-[#2a2e39]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-[#171b26] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleWatchlist(modalSymbol.symbol)}
              className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#ff9800] transition-colors cursor-pointer"
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${inWatchlist ? 'fill-[#ff9800] text-[#ff9800]' : ''}`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">{modalSymbol.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-[#2a2e39] text-[#787b86] font-mono">
                  {modalSymbol.exchange}
                </span>
                <span className="text-xs text-[#787b86] hidden sm:inline">{modalSymbol.category.toUpperCase()}</span>
              </div>
              <p className="text-xs text-[#787b86] truncate max-w-md">{modalSymbol.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-xl font-bold tabular-nums ${tickState === 'up' ? 'text-[#089981]' : tickState === 'down' ? 'text-[#f23645]' : 'text-white'}`}>
                {modalSymbol.currency}{modalSymbol.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-semibold tabular-nums flex items-center justify-end gap-1 ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isPos ? '+' : ''}{modalSymbol.change.toFixed(2)} ({isPos ? '+' : ''}{modalSymbol.changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <button
              onClick={() => setModalSymbol(null)}
              className="p-2 rounded-lg bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Notification Banner */}
        {orderNotification && (
          <div className="p-3 bg-[#089981]/20 border-b border-[#089981]/40 text-[#089981] flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{orderNotification}</span>
          </div>
        )}

        {/* Modal Chart Section */}
        <div className="p-5 space-y-3 bg-[#131722]">
          <div className="flex items-center justify-between text-xs">
            {/* Timeframes */}
            <div className="flex items-center gap-1 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39]">
              {(['1D', '5D', '1M', '3M', '1Y', '5Y'] as TimeFrame[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTf(tf)}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedTf === tf ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Candlestick vs Area */}
            <div className="flex items-center gap-1 p-0.5 bg-[#1e222d] rounded-lg border border-[#2a2e39]">
              <button
                onClick={() => setChartMode('candlestick')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  chartMode === 'candlestick' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartMode('area')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                  chartMode === 'area' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                Area
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="h-56 w-full relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full block">
              {chartMode === 'area' ? (
                <>
                  <polyline
                    fill="none"
                    stroke={isPos ? '#089981' : '#f23645'}
                    strokeWidth="2"
                    points={candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ')}
                  />
                </>
              ) : (
                candles.map((c, i) => {
                  const x = getX(i);
                  const isCandlePos = c.close >= c.open;
                  const color = isCandlePos ? '#089981' : '#f23645';
                  const yO = getY(c.open);
                  const yC = getY(c.close);
                  const yH = getY(c.high);
                  const yL = getY(c.low);

                  return (
                    <g key={i}>
                      <line x1={x} y1={yH} x2={x} y2={yL} stroke={color} strokeWidth="1" />
                      <rect
                        x={x - candleW / 2}
                        y={Math.min(yO, yC)}
                        width={candleW}
                        height={Math.max(1.5, Math.abs(yC - yO))}
                        fill={color}
                      />
                    </g>
                  );
                })
              )}
            </svg>
          </div>
        </div>

        {/* Day Range & 52-Week Range Sliders */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#171b26]">
          {/* Day's Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#787b86]">
              <span>Day's Range</span>
              <span className="text-white font-mono">{modalSymbol.currency}{modalSymbol.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#787b86]">{modalSymbol.currency}{modalSymbol.low24h}</span>
              <div className="flex-1 h-2 bg-[#2a2e39] rounded-full relative">
                <div
                  className="h-2 bg-[#2962ff] rounded-full"
                  style={{ width: `${dayRangePct}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#2962ff] rounded-full shadow"
                  style={{ left: `calc(${dayRangePct}% - 7px)` }}
                />
              </div>
              <span className="text-[11px] font-mono text-[#787b86]">{modalSymbol.currency}{modalSymbol.high24h}</span>
            </div>
          </div>

          {/* 52-Week Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#787b86]">
              <span>52-Week Range</span>
              <span className="text-white font-mono">{modalSymbol.currency}{modalSymbol.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#787b86]">{modalSymbol.currency}{modalSymbol.week52Low}</span>
              <div className="flex-1 h-2 bg-[#2a2e39] rounded-full relative">
                <div
                  className="h-2 bg-[#089981] rounded-full"
                  style={{ width: `${yearRangePct}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#089981] rounded-full shadow"
                  style={{ left: `calc(${yearRangePct}% - 7px)` }}
                />
              </div>
              <span className="text-[11px] font-mono text-[#787b86]">{modalSymbol.currency}{modalSymbol.week52High}</span>
            </div>
          </div>
        </div>

        {/* Key Statistics Grid & Technical Consensus Meter */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#1e222d]">
          {/* Key Stats (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[11px] text-[#787b86]">Market Cap</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{modalSymbol.marketCap || '—'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[11px] text-[#787b86]">P/E Ratio</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{modalSymbol.peRatio || '—'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[11px] text-[#787b86]">Div Yield</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{modalSymbol.divYield ? `${modalSymbol.divYield}%` : '—'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[11px] text-[#787b86]">24h Volume</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{modalSymbol.volume}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[11px] text-[#787b86]">Beta (1Y)</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{modalSymbol.beta || '1.00'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39]">
                <div className="text-[11px] text-[#787b86]">Avg Vol (3M)</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{modalSymbol.avgVolume3M || '—'}</div>
              </div>
            </div>

            {/* Description if any */}
            {modalSymbol.description && (
              <p className="text-xs text-[#787b86] leading-relaxed pt-2">
                {modalSymbol.description}
              </p>
            )}
          </div>

          {/* Technical Rating & Paper Trading Ticket (1 col) */}
          <div className="space-y-4">
            {/* Technical consensus */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-[#2a2e39] text-center space-y-2">
              <span className="text-[11px] font-bold text-[#787b86] uppercase">Technical Analysis</span>
              <div className="text-lg font-black text-[#089981]">{modalSymbol.rating}</div>
              {modalSymbol.ratingScores && (
                <div className="flex justify-center items-center gap-3 text-xs font-mono pt-1">
                  <span className="text-[#089981]">Buy: {modalSymbol.ratingScores.buy}</span>
                  <span className="text-[#787b86]">Hold: {modalSymbol.ratingScores.neutral}</span>
                  <span className="text-[#f23645]">Sell: {modalSymbol.ratingScores.sell}</span>
                </div>
              )}
            </div>

            {/* Paper Trading Ticket */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-[#2a2e39] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Instant Paper Trade</span>
                <span className="text-[10px] text-[#089981] font-mono">Simulated</span>
              </div>

              {/* Buy / Sell buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeAction('buy')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tradeAction === 'buy' ? 'bg-[#089981] text-white shadow' : 'bg-[#1e222d] text-[#787b86]'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeAction('sell')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tradeAction === 'sell' ? 'bg-[#f23645] text-white shadow' : 'bg-[#1e222d] text-[#787b86]'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Shares input */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787b86]">Units / Shares:</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={tradeShares}
                  onChange={e => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-white font-mono text-right"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handlePlaceOrder}
                className={`w-full py-2 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${
                  tradeAction === 'buy' ? 'bg-[#089981] hover:bg-[#078570]' : 'bg-[#f23645] hover:bg-[#d92a39]'
                }`}
              >
                Place {tradeAction.toUpperCase()} Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
