import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { X, Plus, Trash2, Bell, Bookmark, ArrowUpRight, ArrowDownRight, Check, AlertCircle } from 'lucide-react';

export const WatchlistSidebar: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeSidebarTab,
    setActiveSidebarTab,
    watchlist,
    toggleWatchlist,
    symbols,
    setSelectedSymbol,
    setModalSymbol,
    setSearchOpen,
    alerts,
    addAlert,
    removeAlert,
    recentTicks,
  } = useMarket();

  const [alertSymbol, setAlertSymbol] = useState<string>('BTCUSD');
  const [alertPrice, setAlertPrice] = useState<string>('65000');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertSuccess, setAlertSuccess] = useState<boolean>(false);

  if (!isSidebarOpen) return null;

  const watchlistItems = symbols.filter(s => watchlist.includes(s.symbol));

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(alertPrice);
    if (!isNaN(priceNum) && priceNum > 0) {
      addAlert(alertSymbol, priceNum, alertCondition);
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed top-14 bottom-0 right-0 w-80 sm:w-96 bg-[#1e222d] border-l border-[#2a2e39] z-40 flex flex-col shadow-2xl select-none animate-slideLeft">
      {/* Top Header */}
      <div className="p-3 border-b border-[#2a2e39] flex items-center justify-between bg-[#171b26]">
        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39]">
          <button
            onClick={() => setActiveSidebarTab('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeSidebarTab === 'watchlist'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchlist.length})</span>
          </button>
          <button
            onClick={() => setActiveSidebarTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeSidebarTab === 'alerts'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts ({alerts.length})</span>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1.5 rounded-lg text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSidebarTab === 'watchlist' ? (
          <div>
            {/* Quick add symbol bar */}
            <div className="p-2.5 border-b border-[#2a2e39] bg-[#1a1e28]">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-[#131722] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#2962ff]" />
                <span>Add Symbol to Watchlist</span>
              </button>
            </div>

            {/* List */}
            {watchlistItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#787b86]">
                Your watchlist is empty. Add symbols using the button above or star icon on any table!
              </div>
            ) : (
              <div className="divide-y divide-[#2a2e39]/50">
                {watchlistItems.map(item => {
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
                      className={`p-3 flex items-center justify-between gap-3 hover:bg-[#131722] transition-colors cursor-pointer group ${tickClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-[#2962ff] transition-colors flex items-center gap-1">
                            <span>{item.symbol}</span>
                            <span className="text-[9px] text-[#787b86] font-mono">{item.exchange}</span>
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                            {item.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold tabular-nums text-[#d1d4dc]">
                            {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 5 ? 4 : 2 })}
                          </div>
                          <div
                            className={`text-[11px] font-semibold tabular-nums ${
                              isPos ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}{item.changePercent.toFixed(2)}%
                          </div>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleWatchlist(item.symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f23645] transition-all cursor-pointer"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Alerts Tab */
          <div className="p-4 space-y-4">
            {/* Create Alert Form */}
            <form onSubmit={handleCreateAlert} className="p-3.5 rounded-xl bg-[#131722] border border-[#2a2e39] space-y-3">
              <h4 className="text-xs font-bold text-white">Create Price Alert</h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#787b86]">Symbol</label>
                  <select
                    value={alertSymbol}
                    onChange={e => setAlertSymbol(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-white font-mono text-xs"
                  >
                    {symbols.map(s => (
                      <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#787b86]">Condition</label>
                  <select
                    value={alertCondition}
                    onChange={e => setAlertCondition(e.target.value as 'above' | 'below')}
                    className="w-full mt-1 px-2 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-white text-xs"
                  >
                    <option value="above">Crossing Above</option>
                    <option value="below">Crossing Below</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#787b86]">Target Price</label>
                <input
                  type="number"
                  step="any"
                  value={alertPrice}
                  onChange={e => setAlertPrice(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-white font-mono text-xs"
                  placeholder="Enter target price..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Set Alert
              </button>

              {alertSuccess && (
                <div className="p-2 rounded bg-[#089981]/20 text-[#089981] text-[11px] font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Alert scheduled successfully!</span>
                </div>
              )}
            </form>

            {/* List of active alerts */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#787b86] uppercase tracking-wider">Active Alerts</h4>
              {alerts.length === 0 ? (
                <div className="text-xs text-[#787b86] py-3 text-center">No alerts configured.</div>
              ) : (
                alerts.map(al => {
                  const sym = symbols.find(s => s.symbol === al.symbol);
                  const isMet = sym && (al.condition === 'above' ? sym.price >= al.targetPrice : sym.price <= al.targetPrice);

                  return (
                    <div
                      key={al.id}
                      className="p-3 rounded-lg bg-[#131722] border border-[#2a2e39] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{al.symbol}</span>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isMet ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#2a2e39] text-[#787b86]'}`}>
                            {isMet ? 'TRIGGERED' : al.condition === 'above' ? '≥' : '≤'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787b86] font-mono">
                          Target: {al.targetPrice} (Cur: {sym?.price || '—'})
                        </div>
                      </div>

                      <button
                        onClick={() => removeAlert(al.id)}
                        className="p-1 rounded text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] transition-colors cursor-pointer"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
