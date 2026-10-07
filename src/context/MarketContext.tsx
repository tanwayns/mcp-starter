import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SymbolData, MarketCategory, TimeFrame, ChartType, WatchlistAlert } from '../types/market';
import { INITIAL_SYMBOLS, SECTORS_DATA, NEWS_DATA, ECONOMIC_EVENTS } from '../data/marketData';

interface MarketContextType {
  symbols: SymbolData[];
  selectedSymbol: SymbolData;
  setSelectedSymbol: (symbol: SymbolData) => void;
  activeCategory: MarketCategory;
  setActiveCategory: (cat: MarketCategory) => void;
  activeRegion: string;
  setActiveRegion: (reg: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  watchlist: string[];
  toggleWatchlist: (symbolStr: string) => void;
  isInWatchlist: (symbolStr: string) => void;
  alerts: WatchlistAlert[];
  addAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  modalSymbol: SymbolData | null;
  setModalSymbol: (symbol: SymbolData | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeSidebarTab: 'watchlist' | 'alerts' | 'news';
  setActiveSidebarTab: (tab: 'watchlist' | 'alerts' | 'news') => void;
  recentTicks: Record<string, 'up' | 'down'>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [symbols, setSymbols] = useState<SymbolData[]>(INITIAL_SYMBOLS);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolData>(INITIAL_SYMBOLS[0]); // SPX
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('overview');
  const [activeRegion, setActiveRegion] = useState<string>('US');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [watchlist, setWatchlist] = useState<string[]>(['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'TSLA', 'XAUUSD']);
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([
    { id: 'al-1', symbol: 'BTCUSD', targetPrice: 65000, condition: 'above', created: 'Oct 6', triggered: false },
    { id: 'al-2', symbol: 'NVDA', targetPrice: 135, condition: 'above', created: 'Oct 6', triggered: false },
    { id: 'al-3', symbol: 'SPX', targetPrice: 5700, condition: 'below', created: 'Oct 6', triggered: false },
  ]);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [modalSymbol, setModalSymbol] = useState<SymbolData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'watchlist' | 'alerts' | 'news'>('watchlist');
  const [recentTicks, setRecentTicks] = useState<Record<string, 'up' | 'down'>>({});

  // Keyboard shortcut for Search (⌘K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setModalSymbol(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleWatchlist = (sym: string) => {
    setWatchlist(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const isInWatchlist = (sym: string) => watchlist.includes(sym);

  const addAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    setAlerts(prev => [
      ...prev,
      {
        id: `al-${Date.now()}`,
        symbol,
        targetPrice,
        condition,
        created: 'Just now',
        triggered: false,
      },
    ]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Real-time ticking engine
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 2-4 random symbols to tick
      const indicesToTick: number[] = [];
      const count = Math.floor(Math.random() * 3) + 2;
      while (indicesToTick.length < count) {
        const randIdx = Math.floor(Math.random() * symbols.length);
        if (!indicesToTick.includes(randIdx)) indicesToTick.push(randIdx);
      }

      const updatedTicks: Record<string, 'up' | 'down'> = {};

      setSymbols(prevSymbols => {
        return prevSymbols.map((item, idx) => {
          if (!indicesToTick.includes(idx)) return item;

          // Compute tick change (-0.15% to +0.18%)
          const tickFactor = (Math.random() - 0.47) * 0.003;
          const oldPrice = item.price;
          const rawNewPrice = oldPrice * (1 + tickFactor);
          // Decimals format
          const decimals = item.price < 5 ? 4 : item.price < 50 ? 2 : item.price > 10000 ? 1 : 2;
          const newPrice = Number(rawNewPrice.toFixed(decimals));
          
          const tickDirection = newPrice >= oldPrice ? 'up' : 'down';
          updatedTicks[item.symbol] = tickDirection;

          const newChange = Number((item.change + (newPrice - oldPrice)).toFixed(decimals));
          const newChangePercent = Number(((newChange / item.prevClose) * 100).toFixed(2));
          const newHigh = Math.max(item.high24h, newPrice);
          const newLow = Math.min(item.low24h, newPrice);

          // Update candles for 1D
          const updated1DCandles = [...item.candles['1D']];
          if (updated1DCandles.length > 0) {
            const lastCandle = { ...updated1DCandles[updated1DCandles.length - 1] };
            lastCandle.close = newPrice;
            lastCandle.high = Math.max(lastCandle.high, newPrice);
            lastCandle.low = Math.min(lastCandle.low, newPrice);
            updated1DCandles[updated1DCandles.length - 1] = lastCandle;
          }

          const updatedSparkline = [...item.sparkline.slice(0, -1), newPrice];

          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high24h: newHigh,
            low24h: newLow,
            sparkline: updatedSparkline,
            candles: {
              ...item.candles,
              '1D': updated1DCandles,
            },
          };
        });
      });

      setRecentTicks(prev => ({ ...prev, ...updatedTicks }));

      // Clear ticks highlight after 1s
      setTimeout(() => {
        setRecentTicks(prev => {
          const next = { ...prev };
          Object.keys(updatedTicks).forEach(k => delete next[k]);
          return next;
        });
      }, 950);

    }, 2200);

    return () => clearInterval(interval);
  }, [symbols.length]);

  // Keep selectedSymbol and modalSymbol updated with latest prices
  useEffect(() => {
    const currentSelected = symbols.find(s => s.symbol === selectedSymbol.symbol);
    if (currentSelected && currentSelected.price !== selectedSymbol.price) {
      setSelectedSymbol(currentSelected);
    }
    if (modalSymbol) {
      const currentModal = symbols.find(s => s.symbol === modalSymbol.symbol);
      if (currentModal && currentModal.price !== modalSymbol.price) {
        setModalSymbol(currentModal);
      }
    }
  }, [symbols, selectedSymbol.symbol, modalSymbol]);

  return (
    <MarketContext.Provider
      value={{
        symbols,
        selectedSymbol,
        setSelectedSymbol,
        activeCategory,
        setActiveCategory,
        activeRegion,
        setActiveRegion,
        theme,
        toggleTheme,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        alerts,
        addAlert,
        removeAlert,
        searchOpen,
        setSearchOpen,
        modalSymbol,
        setModalSymbol,
        isSidebarOpen,
        setIsSidebarOpen,
        activeSidebarTab,
        setActiveSidebarTab,
        recentTicks,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
