import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, TrendingUp, TrendingDown, Search, Filter,
  ArrowUpRight, ArrowDownRight, Star, Clock, DollarSign,
  BarChart3, PieChart, Activity, ChevronRight, Plus, Minus
} from 'lucide-react'

// Simulated stock data with live price movement
const INITIAL_STOCKS = [
  { id: 1, name: 'Apple Inc.', ticker: 'AAPL', price: 175.43, change: 2.34, changePercent: 1.35, volume: '52.3M', marketCap: '2.7T', sector: 'Technology', favorite: true, owned: 10, avgBuy: 150.00 },
  { id: 2, name: 'Microsoft', ticker: 'MSFT', price: 378.91, change: -1.23, changePercent: -0.32, volume: '21.1M', marketCap: '2.8T', sector: 'Technology', favorite: false, owned: 5, avgBuy: 350.00 },
  { id: 3, name: 'Tesla Inc.', ticker: 'TSLA', price: 248.50, change: 5.67, changePercent: 2.34, volume: '98.2M', marketCap: '790B', sector: 'Automotive', favorite: true, owned: 8, avgBuy: 220.00 },
  { id: 4, name: 'NVIDIA', ticker: 'NVDA', price: 495.22, change: 12.45, changePercent: 2.58, volume: '45.7M', marketCap: '1.2T', sector: 'Technology', favorite: false, owned: 0, avgBuy: 0 },
  { id: 5, name: 'Amazon', ticker: 'AMZN', price: 155.33, change: -0.89, changePercent: -0.57, volume: '38.9M', marketCap: '1.6T', sector: 'Consumer', favorite: false, owned: 0, avgBuy: 0 },
  { id: 6, name: 'Google', ticker: 'GOOGL', price: 142.65, change: 1.12, changePercent: 0.79, volume: '22.4M', marketCap: '1.8T', sector: 'Technology', favorite: false, owned: 3, avgBuy: 135.00 },
  { id: 7, name: 'Meta', ticker: 'META', price: 398.09, change: 8.23, changePercent: 2.11, volume: '15.6M', marketCap: '1.0T', sector: 'Technology', favorite: false, owned: 0, avgBuy: 0 },
  { id: 8, name: 'Netflix', ticker: 'NFLX', price: 485.11, change: -3.45, changePercent: -0.71, volume: '4.2M', marketCap: '214B', sector: 'Entertainment', favorite: true, owned: 2, avgBuy: 420.00 },
  { id: 9, name: 'AMD', ticker: 'AMD', price: 164.32, change: 3.21, changePercent: 1.99, volume: '56.8M', marketCap: '265B', sector: 'Technology', favorite: false, owned: 0, avgBuy: 0 },
  { id: 10, name: 'Intel', ticker: 'INTC', price: 43.12, change: -0.56, changePercent: -1.28, volume: '32.1M', marketCap: '184B', sector: 'Technology', favorite: false, owned: 0, avgBuy: 0 },
  { id: 11, name: 'Bitcoin', ticker: 'BTC', price: 45230.00, change: 890.00, changePercent: 2.01, volume: '28.5B', marketCap: '885B', sector: 'Crypto', favorite: true, owned: 0.5, avgBuy: 40000.00 },
  { id: 12, name: 'Ethereum', ticker: 'ETH', price: 2456.78, change: 45.23, changePercent: 1.88, volume: '15.2B', marketCap: '295B', sector: 'Crypto', favorite: false, owned: 2, avgBuy: 2200.00 },
  { id: 13, name: 'Solana', ticker: 'SOL', price: 98.45, change: 5.67, changePercent: 6.11, volume: '3.8B', marketCap: '42B', sector: 'Crypto', favorite: false, owned: 0, avgBuy: 0 },
  { id: 14, name: 'JPMorgan', ticker: 'JPM', price: 172.34, change: 0.89, changePercent: 0.52, volume: '8.9M', marketCap: '495B', sector: 'Finance', favorite: false, owned: 0, avgBuy: 0 },
  { id: 15, name: 'Visa', ticker: 'V', price: 267.89, change: 1.23, changePercent: 0.46, volume: '4.1M', marketCap: '560B', sector: 'Finance', favorite: false, owned: 0, avgBuy: 0 },
]

const Invest = () => {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState(INITIAL_STOCKS)
  const [activeTab, setActiveTab] = useState('market')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeType, setTradeType] = useState('buy')
  const [filter, setFilter] = useState('all')
  const [tradeHistory, setTradeHistory] = useState([
    { id: 1, stock: 'AAPL', type: 'buy', shares: 10, price: 150.00, total: 1500.00, date: '2024-01-15' },
    { id: 2, stock: 'TSLA', type: 'buy', shares: 8, price: 220.00, total: 1760.00, date: '2024-01-20' },
    { id: 3, stock: 'BTC', type: 'buy', shares: 0.5, price: 40000.00, total: 20000.00, date: '2024-01-25' },
  ])

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const volatility = stock.sector === 'Crypto' ? 0.02 : 0.005
        const change = (Math.random() - 0.5) * stock.price * volatility
        const newPrice = Math.max(stock.price + change, 0.01)
        const priceChange = newPrice - stock.price
        return {
          ...stock,
          price: newPrice,
          change: priceChange,
          changePercent: (priceChange / (stock.price - priceChange)) * 100
        }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ||
                         (filter === 'favorites' && s.favorite) ||
                         (filter === 'owned' && s.owned > 0) ||
                         s.sector.toLowerCase() === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const portfolioValue = stocks.reduce((sum, s) => sum + (s.owned * s.price), 0)
  const portfolioCost = stocks.reduce((sum, s) => sum + (s.owned * s.avgBuy), 0)
  const totalReturn = portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0

  const toggleFavorite = (id) => {
    setStocks(stocks.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s))
  }

  const executeTrade = () => {
    if (!selectedStock || !tradeAmount) return
    const shares = Number(tradeAmount)
    const total = shares * selectedStock.price

    setTradeHistory([
      {
        id: Date.now(),
        stock: selectedStock.ticker,
        type: tradeType,
        shares,
        price: selectedStock.price,
        total,
        date: new Date().toISOString().split('T')[0]
      },
      ...tradeHistory
    ])

    setStocks(stocks.map(s => {
      if (s.id !== selectedStock.id) return s
      if (tradeType === 'buy') {
        const newOwned = s.owned + shares
        const newAvgBuy = ((s.owned * s.avgBuy) + total) / newOwned
        return { ...s, owned: newOwned, avgBuy: newAvgBuy }
      } else {
        return { ...s, owned: Math.max(0, s.owned - shares) }
      }
    }))

    setSelectedStock(null)
    setTradeAmount('')
  }

  const getSparkline = (change) => {
    const points = Array.from({ length: 20 }, () => Math.random() * 20)
    const min = Math.min(...points)
    const max = Math.max(...points)
    const normalized = points.map(p => ((p - min) / (max - min)) * 30)
    return `M0,${30 - normalized[0]} ` + normalized.slice(1).map((p, i) => `L${(i + 1) * 5},${30 - p}`).join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg">Invest</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Search size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <h2 className="text-3xl font-bold">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className="text-right">
              <span className={`flex items-center gap-1 text-sm font-medium ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalReturn >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(totalReturn).toFixed(2)}%
              </span>
              <p className="text-xs text-gray-400 mt-1">
                ${Math.abs(portfolioValue - portfolioCost).toLocaleString()} {totalReturn >= 0 ? 'gain' : 'loss'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{stocks.filter(s => s.owned > 0).length}</p>
              <p className="text-[10px] text-gray-400 uppercase">Holdings</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{stocks.filter(s => s.change > 0).length}</p>
              <p className="text-[10px] text-gray-400 uppercase">Gainers</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-rose-400">{stocks.filter(s => s.change < 0).length}</p>
              <p className="text-[10px] text-gray-400 uppercase">Losers</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'market', label: 'Market', icon: BarChart3 },
            { id: 'portfolio', label: 'Portfolio', icon: PieChart },
            { id: 'history', label: 'History', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        {activeTab === 'market' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks, crypto..."
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'favorites', 'owned', 'Technology', 'Crypto', 'Finance', 'Automotive'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filter === f
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Market View */}
        {activeTab === 'market' && (
          <div className="space-y-3">
            {filteredStocks.map((stock, idx) => (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelectedStock(stock)}
                className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      stock.sector === 'Crypto' ? 'bg-amber-500/20 text-amber-400' :
                      stock.sector === 'Finance' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-violet-500/20 text-violet-400'
                    }`}>
                      {stock.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{stock.name}</p>
                      <p className="text-xs text-gray-400">{stock.ticker} • {stock.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <span className={`text-xs flex items-center gap-1 justify-end ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Vol: {stock.volume}</span>
                    <span>Cap: {stock.marketCap}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(stock.id) }}
                    className={`p-1.5 rounded-lg transition-colors ${stock.favorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}
                  >
                    <Star size={16} fill={stock.favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Portfolio View */}
        {activeTab === 'portfolio' && (
          <div className="space-y-3">
            {stocks.filter(s => s.owned > 0).map((stock, idx) => {
              const currentValue = stock.owned * stock.price
              const costBasis = stock.owned * stock.avgBuy
              const gainLoss = currentValue - costBasis
              const gainLossPercent = ((gainLoss / costBasis) * 100)
              return (
                <motion.div
                  key={stock.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-800 rounded-2xl p-5 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{stock.name}</p>
                      <p className="text-xs text-gray-400">{stock.ticker} • {stock.owned} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <span className={`text-xs ${gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} ({gainLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <p className="text-gray-400">Avg Buy</p>
                      <p className="font-medium">${stock.avgBuy.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <p className="text-gray-400">Current</p>
                      <p className="font-medium">${stock.price.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <p className="text-gray-400">Total</p>
                      <p className="font-medium">${currentValue.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {stocks.filter(s => s.owned > 0).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <PieChart size={48} className="mx-auto mb-4 opacity-50" />
                <p>No holdings yet</p>
                <p className="text-sm mt-1">Start investing from the Market tab</p>
              </div>
            )}
          </div>
        )}
        {/* History View */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {tradeHistory.map((trade, idx) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    trade.type === 'buy' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}>
                    {trade.type === 'buy' ? <Plus size={20} className="text-emerald-400" /> : <Minus size={20} className="text-rose-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{trade.stock}</p>
                    <p className="text-xs text-gray-400">{trade.shares} shares @ ${trade.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">${trade.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{trade.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {selectedStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedStock(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full max-w-md bg-gray-800 rounded-3xl p-6 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">{selectedStock.name}</h3>
                <p className="text-sm text-gray-400">{selectedStock.ticker} • ${selectedStock.price.toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedStock(null)} className="p-2 hover:bg-gray-700 rounded-full">
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${tradeType === 'buy' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${tradeType === 'sell' ? 'bg-rose-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                Sell
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Amount (shares/units)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-2xl font-bold focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-sm text-gray-400 mt-2">
                Total: ${(Number(tradeAmount || 0) * selectedStock.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <button
              onClick={executeTrade}
              disabled={!tradeAmount || Number(tradeAmount) <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                tradeType === 'buy'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-50`}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.ticker}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Invest
