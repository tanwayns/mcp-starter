import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#131722] border-t border-[#2a2e39] text-[#787b86] text-xs select-none">
      <div className="max-w-[1720px] mx-auto px-4 py-12">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-10 border-b border-[#2a2e39]">
          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Markets</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Indices</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Stocks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Crypto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Forex</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Futures</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bonds</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Chart & Supercharts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pine Script™</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Stock Screener</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Crypto Screener</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Heatmaps</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Economic Calendar</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Community</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Trade Ideas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Scripts & Indicators</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Live Streams</a></li>
              <li><a href="#" className="hover:text-white transition-colors">House Rules</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Moderators</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features & Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Manifesto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">TradingView</h4>
            <p className="text-[11px] leading-relaxed mb-4">
              Where the world charts, chats and trades markets. Join millions of traders and investors making smarter, data-driven decisions.
            </p>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span>Real-Time Market Feeds</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Row */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px]">
          <p className="max-w-3xl leading-relaxed text-[#787b86]">
            Market data provided is for informational purposes only. Trading in financial markets carries risk. Data delayed by 15 minutes unless specified as real-time. Quotes provided by NASDAQ, NYSE, CME, ICE, CBOE, LSE, and leading crypto liquidity pools.
          </p>
          <div className="shrink-0 text-[#787b86]">
            © {new Date().getFullYear()} TradingView Markets. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
