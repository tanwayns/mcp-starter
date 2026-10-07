import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketsSubNav } from './components/MarketsSubNav';
import { MainMarketChart } from './components/MainMarketChart';
import { MarketOverviewCards } from './components/MarketOverviewCards';
import { MarketMoversTable } from './components/MarketMoversTable';
import { SectorHeatmap } from './components/SectorHeatmap';
import { MarketNewsCalendar } from './components/MarketNewsCalendar';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { SearchModal } from './components/SearchModal';
import { SymbolModal } from './components/SymbolModal';
import { Footer } from './components/Footer';

const MarketsMainContent: React.FC = () => {
  const { activeCategory, activeRegion } = useMarket();

  return (
    <main className="max-w-[1720px] mx-auto px-4 py-6 space-y-8">
      {/* Category Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-[#2a2e39]/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1">
            <span>TradingView</span>
            <span>/</span>
            <span className="capitalize">{activeCategory}</span>
            <span>/</span>
            <span>{activeRegion}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight capitalize">
            {activeCategory === 'overview'
              ? 'World Markets Today'
              : activeCategory === 'heatmaps'
              ? 'Market Sector Heatmaps'
              : activeCategory === 'news'
              ? 'Market News & Economic Calendar'
              : `${activeCategory} Market Hub`}
          </h1>
        </div>

        <div className="text-xs text-[#787b86] flex items-center gap-2">
          <span>Continuous data streaming</span>
          <span className="w-2 h-2 rounded-full bg-[#089981] animate-ping" />
        </div>
      </div>

      {/* Conditional rendering based on category */}
      {activeCategory === 'overview' && (
        <>
          {/* Main Showcase Interactive Chart */}
          <section aria-label="Interactive Market Chart">
            <MainMarketChart />
          </section>

          {/* Asset Class Quick Overview Grid */}
          <section aria-label="Market Overview Cards">
            <MarketOverviewCards />
          </section>

          {/* Market Movers & Screener Data Table */}
          <section id="screener" aria-label="Market Movers">
            <MarketMoversTable />
          </section>

          {/* S&P 500 Sector Heatmap */}
          <section id="heatmaps" aria-label="Sector Heatmap">
            <SectorHeatmap />
          </section>

          {/* News & Economic Calendar */}
          <section id="news" aria-label="News and Calendar">
            <MarketNewsCalendar />
          </section>
        </>
      )}

      {/* Specialized category views */}
      {['indices', 'stocks', 'crypto', 'forex', 'futures', 'bonds'].includes(activeCategory) && (
        <>
          <section aria-label="Interactive Chart">
            <MainMarketChart />
          </section>

          <section aria-label="Market Movers">
            <MarketMoversTable />
          </section>
        </>
      )}

      {activeCategory === 'heatmaps' && (
        <>
          <section aria-label="Sector Heatmap">
            <SectorHeatmap />
          </section>

          <section aria-label="Market Movers">
            <MarketMoversTable />
          </section>
        </>
      )}

      {activeCategory === 'news' && (
        <>
          <section aria-label="News and Calendar">
            <MarketNewsCalendar />
          </section>
        </>
      )}
    </main>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <div className="min-h-screen bg-[#131722] text-[#d1d4dc] flex flex-col font-sans transition-colors selection:bg-[#2962ff]/30 selection:text-white">
        {/* TradingView Top Navigation */}
        <Header />

        {/* Real-time Ticker Tape Ribbon */}
        <TickerTape />

        {/* Market Class Sub-Navigation */}
        <MarketsSubNav />

        {/* Main Content Area */}
        <div className="flex-1">
          <MarketsMainContent />
        </div>

        {/* Global Footer */}
        <Footer />

        {/* Modals & Drawers */}
        <WatchlistSidebar />
        <SearchModal />
        <SymbolModal />
      </div>
    </MarketProvider>
  );
}
