import React from 'react';
import { Search, Moon, Sun, Bookmark, Bell, Globe, TrendingUp, Menu, SlidersHorizontal } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setSearchOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    activeSidebarTab,
    setActiveSidebarTab,
    watchlist,
    alerts,
  } = useMarket();

  return (
    <header className="sticky top-0 z-40 bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] text-[#d1d4dc] transition-colors select-none">
      <div className="max-w-[1720px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: TradingView Brand Logo & Main Nav */}
        <div className="flex items-center gap-6 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            {/* TradingView Iconic Geometric Logo */}
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center shadow-sm group-hover:bg-[#1e53e5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5V8.5C4 7.67157 4.67157 7 5.5 7H8.5C9.32843 7 10 7.67157 10 8.5V19.5C10 20.3284 9.32843 21 8.5 21H5.5C4.67157 21 4 20.3284 4 19.5Z" fill="white"/>
                <path d="M12 19.5V13.5C12 12.6716 12.6716 12 13.5 12H16.5C17.3284 12 18 12.6716 18 13.5V19.5C18 20.3284 17.3284 21 16.5 21H13.5C12.6716 21 12 20.3284 12 19.5Z" fill="white"/>
                <path d="M20 19.5V4.5C20 3.67157 20.6716 3 21.5 3H24.5C25.3284 3 26 3.67157 26 4.5V19.5C26 20.3284 25.3284 21 24.5 21H21.5C20.6716 21 20 20.3284 20 19.5Z" fill="white"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              TradingView
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#2962ff] border border-[#363a45]/60">MARKETS</span>
            </span>
          </a>

          {/* Primary Nav Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-[#787b86]">
            <a href="#markets" className="text-white hover:text-white transition-colors border-b-2 border-[#2962ff] py-4.5 font-semibold">
              Markets
            </a>
            <a href="#screener" className="hover:text-white transition-colors py-4.5">
              Screeners
            </a>
            <a href="#heatmaps" className="hover:text-white transition-colors py-4.5">
              Heatmaps
            </a>
            <a href="#news" className="hover:text-white transition-colors py-4.5">
              News
            </a>
            <a href="#community" className="hover:text-white transition-colors py-4.5">
              Community
            </a>
          </nav>
        </div>

        {/* Center: Search Bar Trigger (⌘K) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full h-9 px-3 rounded-lg bg-[#1e222d] border border-[#2a2e39] hover:border-[#363a45] text-[#787b86] hover:text-[#d1d4dc] flex items-center justify-between text-xs transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-[#787b86] group-hover:text-[#2962ff] transition-colors" />
              <span className="truncate">Search markets, tickers (e.g. AAPL, BTC, SPX)...</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-[#2a2e39] text-[10px] font-mono text-[#787b86]">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Market Status Pulse */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1e222d] border border-[#2a2e39] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
            <span className="font-medium text-[#d1d4dc]">US Regular Session</span>
            <span className="text-[#787b86] text-[11px]">15:42 EDT</span>
          </div>

          {/* Search button mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-[#787b86] hover:text-white hover:bg-[#1e222d] transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Watchlist toggle */}
          <button
            onClick={() => {
              setActiveSidebarTab('watchlist');
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSidebarOpen && activeSidebarTab === 'watchlist'
                ? 'bg-[#2962ff]/15 border-[#2962ff] text-[#2962ff]'
                : 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] hover:border-[#363a45]'
            }`}
            title="Open Watchlist"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Watchlist</span>
            <span className="text-[10px] font-mono bg-[#2a2e39] px-1 rounded text-[#787b86]">
              {watchlist.length}
            </span>
          </button>

          {/* Alerts button */}
          <button
            onClick={() => {
              setActiveSidebarTab('alerts');
              setIsSidebarOpen(true);
            }}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors relative ${
              isSidebarOpen && activeSidebarTab === 'alerts'
                ? 'bg-[#2962ff]/15 border-[#2962ff] text-[#2962ff]'
                : 'bg-[#1e222d] border-[#2a2e39] text-[#787b86] hover:text-white hover:border-[#363a45]'
            }`}
            title="Price Alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2962ff]"></span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#1e222d] border border-[#2a2e39] text-[#787b86] hover:text-white hover:border-[#363a45] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* User Profile / Paper Account */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#2a2e39]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2962ff] to-[#00b59b] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              T
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
