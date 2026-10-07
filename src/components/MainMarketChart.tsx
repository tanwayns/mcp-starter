import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { TimeFrame, ChartType, CandleData } from '../types/market';
import { Maximize2, Sliders, TrendingUp, BarChart2, Activity, Check, Eye } from 'lucide-react';

export const MainMarketChart: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol, symbols, setModalSymbol, recentTicks } = useMarket();

  const [timeframe, setTimeframe] = useState<TimeFrame>('1M');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showMA20, setShowMA20] = useState<boolean>(true);
  const [showMA50, setShowMA50] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Quick switch popular market symbols
  const primarySymbols = ['SPX', 'NDX', 'BTCUSD', 'NVDA', 'AAPL', 'TSLA', 'XAUUSD', 'US10Y'];

  const candles: CandleData[] = useMemo(() => {
    return selectedSymbol.candles[timeframe] || selectedSymbol.candles['1M'];
  }, [selectedSymbol, timeframe]);

  // Compute Moving Averages
  const ma20 = useMemo(() => {
    if (!showMA20) return [];
    return candles.map((_, i, arr) => {
      if (i < 19) return null;
      const slice = arr.slice(i - 19, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / 20;
    });
  }, [candles, showMA20]);

  const ma50 = useMemo(() => {
    if (!showMA50) return [];
    return candles.map((_, i, arr) => {
      if (i < 49) return null;
      const slice = arr.slice(i - 49, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / 50;
    });
  }, [candles, showMA50]);

  // Bollinger Bands (20 periods, 2 std dev)
  const bollingerBands = useMemo(() => {
    if (!showBollinger) return [];
    return candles.map((_, i, arr) => {
      if (i < 19) return null;
      const slice = arr.slice(i - 19, i + 1);
      const mean = slice.reduce((acc, c) => acc + c.close, 0) / 20;
      const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      return {
        upper: mean + 2 * stdDev,
        middle: mean,
        lower: mean - 2 * stdDev,
      };
    });
  }, [candles, showBollinger]);

  // RSI 14
  const rsiValues = useMemo(() => {
    if (!showRSI) return [];
    const rsiArr: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsiArr.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      if (i <= 14) {
        if (change > 0) gains += change;
        else losses -= change;
        if (i === 14) {
          const avgGain = gains / 14;
          const avgLoss = losses / 14;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsiArr.push(100 - 100 / (1 + rs));
        } else {
          rsiArr.push(null);
        }
      } else {
        const curGain = change > 0 ? change : 0;
        const curLoss = change < 0 ? -change : 0;
        const prevRsi = rsiArr[i - 1];
        if (prevRsi !== null) {
          const avgGain = (gains * 13 + curGain) / 14;
          const avgLoss = (losses * 13 + curLoss) / 14;
          gains = avgGain;
          losses = avgLoss;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsiArr.push(100 - 100 / (1 + rs));
        } else {
          rsiArr.push(50);
        }
      }
    }
    return rsiArr;
  }, [candles, showRSI]);

  // Bounds
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 1000 };
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach((c, idx) => {
      min = Math.min(min, c.low);
      max = Math.max(max, c.high);
      maxVol = Math.max(maxVol, c.volume);

      if (bollingerBands[idx]) {
        max = Math.max(max, bollingerBands[idx]!.upper);
        min = Math.min(min, bollingerBands[idx]!.lower);
      }
    });

    const padding = (max - min) * 0.08 || 1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: maxVol,
    };
  }, [candles, bollingerBands]);

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];
  const isPositive = selectedSymbol.changePercent >= 0;
  const tickState = recentTicks[selectedSymbol.symbol];

  // SVG dimensions
  const svgWidth = 1000;
  const mainHeight = showRSI ? 330 : 420;
  const rsiHeight = showRSI ? 90 : 0;
  const totalSvgHeight = mainHeight + rsiHeight;
  const volumeHeight = 70;

  const getX = (index: number) => {
    if (candles.length <= 1) return 0;
    return (index / (candles.length - 1)) * (svgWidth - 65) + 10;
  };

  const getY = (val: number) => {
    const range = maxPrice - minPrice || 1;
    return mainHeight - ((val - minPrice) / range) * (mainHeight - 30) - 15;
  };

  const candleWidth = Math.max(2, Math.min(18, (svgWidth / candles.length) * 0.65));

  // Handle mouse movement for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const closestIdx = Math.round(ratio * (candles.length - 1));
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Grid price lines
  const gridLevels = useMemo(() => {
    const levels: number[] = [];
    const count = 5;
    const step = (maxPrice - minPrice) / count;
    for (let i = 1; i <= count; i++) {
      levels.push(minPrice + step * i);
    }
    return levels;
  }, [minPrice, maxPrice]);

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl overflow-hidden shadow-lg select-none">
      {/* Top Header: Symbol picker tabs, Instrument info & Quote */}
      <div className="p-4 border-b border-[#2a2e39] bg-[#1e222d] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Symbol Quick Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {primarySymbols.map(symCode => {
            const sym = symbols.find(s => s.symbol === symCode);
            if (!sym) return null;
            const isSelected = selectedSymbol.symbol === symCode;
            const isSymPos = sym.changePercent >= 0;

            return (
              <button
                key={symCode}
                onClick={() => setSelectedSymbol(sym)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2962ff] text-white shadow-md'
                    : 'bg-[#131722] text-[#d1d4dc] hover:bg-[#2a2e39] border border-[#2a2e39]'
                }`}
              >
                <span>{sym.symbol}</span>
                <span
                  className={`text-[10px] tabular-nums font-mono ${
                    isSelected
                      ? 'text-white/80'
                      : isSymPos
                      ? 'text-[#089981]'
                      : 'text-[#f23645]'
                  }`}
                >
                  {isSymPos ? '+' : ''}{sym.changePercent.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Full Chart Drilldown Modal */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            onClick={() => setModalSymbol(selectedSymbol)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2e39] hover:bg-[#363a45] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>Launch Interactive Superchart</span>
          </button>
        </div>
      </div>

      {/* Symbol Live Price Bar & Stats */}
      <div className="px-5 py-3 border-b border-[#2a2e39] bg-[#171b26] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">{selectedSymbol.symbol}</span>
              <span className="text-xs text-[#787b86] font-medium">{selectedSymbol.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#787b86] font-mono uppercase">
                {selectedSymbol.exchange}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span
                className={`text-2xl font-bold tabular-nums tracking-tight transition-colors ${
                  tickState === 'up'
                    ? 'text-[#089981]'
                    : tickState === 'down'
                    ? 'text-[#f23645]'
                    : 'text-white'
                }`}
              >
                {selectedSymbol.currency}
                {selectedSymbol.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-sm font-semibold tabular-nums flex items-center gap-1 ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                <span>{isPositive ? '+' : ''}{selectedSymbol.change.toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{selectedSymbol.changePercent.toFixed(2)}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* OHLC and Tooltip Info */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#787b86]">
          {activeCandle && (
            <div className="flex items-center gap-3 bg-[#131722] px-3 py-1.5 rounded-lg border border-[#2a2e39]">
              <span className="text-[#2962ff] font-semibold">{activeCandle.time}</span>
              <span>O: <strong className="text-white">{activeCandle.open}</strong></span>
              <span>H: <strong className="text-[#089981]">{activeCandle.high}</strong></span>
              <span>L: <strong className="text-[#f23645]">{activeCandle.low}</strong></span>
              <span>C: <strong className="text-white">{activeCandle.close}</strong></span>
              <span>Vol: <strong className="text-white">{(activeCandle.volume / 1000).toFixed(0)}k</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Control Toolbar: Timeframes, Chart Types, Indicators */}
      <div className="px-4 py-2 border-b border-[#2a2e39] bg-[#1e222d] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Timeframes */}
        <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
          {(['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'] as TimeFrame[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
              chartType === 'candlestick' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Candles
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
              chartType === 'area' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('baseline')}
            className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
              chartType === 'baseline' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Baseline
          </button>
        </div>

        {/* Technical Indicators Pill Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMA20(!showMA20)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showMA20
                ? 'bg-[#2962ff]/15 border-[#2962ff] text-[#2962ff]'
                : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            MA 20
          </button>
          <button
            onClick={() => setShowMA50(!showMA50)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showMA50
                ? 'bg-[#ff9800]/15 border-[#ff9800] text-[#ff9800]'
                : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            MA 50
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showBollinger
                ? 'bg-[#ab47bc]/15 border-[#ab47bc] text-[#ab47bc]'
                : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showRSI
                ? 'bg-[#00bcd4]/15 border-[#00bcd4] text-[#00bcd4]'
                : 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            RSI (14)
          </button>
        </div>
      </div>

      {/* Main Chart Graphic Canvas */}
      <div ref={containerRef} className="relative bg-[#131722] p-1 cursor-crosshair overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          className="w-full h-[440px] block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area chart gradient */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#089981' : '#f23645'} stopOpacity="0.45" />
              <stop offset="100%" stopColor={isPositive ? '#089981' : '#f23645'} stopOpacity="0.0" />
            </linearGradient>

            {/* Baseline positive gradient */}
            <linearGradient id="baselinePos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#089981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#089981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLevels.map((lvl, idx) => {
            const y = getY(lvl);
            return (
              <g key={idx}>
                <line
                  x1="10"
                  y1={y}
                  x2={svgWidth - 55}
                  y2={y}
                  stroke="#20242e"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - 50}
                  y={y + 3.5}
                  fill="#787b86"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {lvl.toFixed(lvl > 500 ? 0 : 2)}
                </text>
              </g>
            );
          })}

          {/* Volume bars at bottom */}
          {candles.map((c, i) => {
            const x = getX(i);
            const isCandlePos = c.close >= c.open;
            const barH = (c.volume / maxVolume) * volumeHeight;
            const y = mainHeight - barH;

            return (
              <rect
                key={`vol-${i}`}
                x={x - candleWidth / 2}
                y={y}
                width={candleWidth}
                height={barH}
                fill={isCandlePos ? '#089981' : '#f23645'}
                opacity={hoverIndex === i ? 0.6 : 0.22}
              />
            );
          })}

          {/* Bollinger Bands Shading */}
          {showBollinger && bollingerBands.length > 0 && (
            <path
              d={(() => {
                const upperPoints: string[] = [];
                const lowerPoints: string[] = [];
                bollingerBands.forEach((b, i) => {
                  if (!b) return;
                  const x = getX(i);
                  upperPoints.push(`${x},${getY(b.upper)}`);
                  lowerPoints.unshift(`${x},${getY(b.lower)}`);
                });
                if (upperPoints.length === 0) return '';
                return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
              })()}
              fill="#ab47bc"
              opacity="0.08"
            />
          )}

          {/* Bollinger Bands Lines */}
          {showBollinger && (
            <>
              <polyline
                fill="none"
                stroke="#ab47bc"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.7"
                points={bollingerBands
                  .map((b, i) => (b ? `${getX(i)},${getY(b.upper)}` : ''))
                  .filter(Boolean)
                  .join(' ')}
              />
              <polyline
                fill="none"
                stroke="#ab47bc"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.7"
                points={bollingerBands
                  .map((b, i) => (b ? `${getX(i)},${getY(b.lower)}` : ''))
                  .filter(Boolean)
                  .join(' ')}
              />
            </>
          )}

          {/* Chart Graphic depending on type */}
          {chartType === 'area' && (
            <>
              {/* Filled area */}
              <path
                d={(() => {
                  const pts = candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ');
                  return `M ${getX(0)},${mainHeight} L ${pts} L ${getX(candles.length - 1)},${mainHeight} Z`;
                })()}
                fill="url(#areaGradient)"
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke={isPositive ? '#089981' : '#f23645'}
                strokeWidth="2"
                points={candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ')}
              />
            </>
          )}

          {chartType === 'baseline' && (
            <>
              {/* Reference line */}
              <line
                x1="10"
                y1={getY(selectedSymbol.prevClose)}
                x2={svgWidth - 55}
                y2={getY(selectedSymbol.prevClose)}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              {/* Baseline path */}
              <polyline
                fill="none"
                stroke={isPositive ? '#089981' : '#f23645'}
                strokeWidth="2"
                points={candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ')}
              />
            </>
          )}

          {chartType === 'candlestick' &&
            candles.map((c, i) => {
              const x = getX(i);
              const isCandlePos = c.close >= c.open;
              const color = isCandlePos ? '#089981' : '#f23645';
              const yOpen = getY(c.open);
              const yClose = getY(c.close);
              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="0.8"
                    rx="0.5"
                  />
                </g>
              );
            })}

          {/* Moving Average lines */}
          {showMA20 && ma20.length > 0 && (
            <polyline
              fill="none"
              stroke="#2962ff"
              strokeWidth="1.5"
              points={ma20
                .map((m, i) => (m !== null ? `${getX(i)},${getY(m)}` : ''))
                .filter(Boolean)
                .join(' ')}
            />
          )}

          {showMA50 && ma50.length > 0 && (
            <polyline
              fill="none"
              stroke="#ff9800"
              strokeWidth="1.5"
              points={ma50
                .map((m, i) => (m !== null ? `${getX(i)},${getY(m)}` : ''))
                .filter(Boolean)
                .join(' ')}
            />
          )}

          {/* RSI Indicator Sub-chart */}
          {showRSI && (
            <g transform={`translate(0, ${mainHeight})`}>
              <line x1="10" y1="0" x2={svgWidth - 55} y2="0" stroke="#2a2e39" strokeWidth="1" />
              {/* RSI 70 Overbought */}
              <line x1="10" y1="25" x2={svgWidth - 55} y2="25" stroke="#f23645" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
              <text x={svgWidth - 50} y="28" fill="#f23645" fontSize="8" fontFamily="monospace">70</text>
              {/* RSI 30 Oversold */}
              <line x1="10" y1="65" x2={svgWidth - 55} y2="65" stroke="#089981" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
              <text x={svgWidth - 50} y="68" fill="#089981" fontSize="8" fontFamily="monospace">30</text>
              {/* RSI Label */}
              <text x="15" y="16" fill="#00bcd4" fontSize="10" fontWeight="bold">RSI (14): {rsiValues[rsiValues.length - 1]?.toFixed(1) || '52.4'}</text>
              {/* RSI line */}
              <polyline
                fill="none"
                stroke="#00bcd4"
                strokeWidth="1.5"
                points={rsiValues
                  .map((r, i) => {
                    if (r === null) return '';
                    const x = getX(i);
                    const y = 90 - (r / 100) * 80 - 5;
                    return `${x},${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            </g>
          )}

          {/* Interactive Crosshair & Tooltip */}
          {hoverIndex !== null && candles[hoverIndex] && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1="10"
                x2={getX(hoverIndex)}
                y2={totalSvgHeight}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal line */}
              <line
                x1="10"
                y1={getY(candles[hoverIndex].close)}
                x2={svgWidth - 55}
                y2={getY(candles[hoverIndex].close)}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Price badge on right axis */}
              <rect
                x={svgWidth - 54}
                y={getY(candles[hoverIndex].close) - 9}
                width="50"
                height="18"
                fill="#2962ff"
                rx="3"
              />
              <text
                x={svgWidth - 29}
                y={getY(candles[hoverIndex].close) + 3.5}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {candles[hoverIndex].close.toFixed(candles[hoverIndex].close > 500 ? 1 : 2)}
              </text>
            </g>
          )}
        </svg>

        {/* Floating TradingView Watermark */}
        <div className="absolute right-16 bottom-14 pointer-events-none opacity-20 text-white font-black text-2xl tracking-widest flex items-center gap-2">
          <span>TRADINGVIEW</span>
        </div>
      </div>
    </div>
  );
};
