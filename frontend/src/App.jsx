import { useEffect, useState, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [history, setHistory] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [flashMap, setFlashMap] = useState({}); // Stores price change directions for flash animation

  const prevPricesRef = useRef({});
  const [lastSeenTime, setLastSeenTime] = useState(() => {
    return localStorage.getItem('watchlist_last_seen') || new Date().toLocaleTimeString();
  });

  const baselinePricesRef = useRef(
    JSON.parse(localStorage.getItem('watchlist_baselines') || '{}')
  );

  const fetchData = async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetch('http://localhost:5000/api/stocks/latest'),
        fetch('http://localhost:5000/api/stocks/history'),
      ]);

      const data = await latestRes.json();
      const historyData = await historyRes.json();

      // Track price changes for flash effect
      const newFlashMap = {};
      data.forEach((s) => {
        const prevPrice = prevPricesRef.current[s.ticker];
        if (prevPrice !== undefined && prevPrice !== s.price) {
          newFlashMap[s.ticker] = s.price > prevPrice ? 'flash-up' : 'flash-down';
        }
        prevPricesRef.current[s.ticker] = s.price;
      });

      setFlashMap(newFlashMap);

      // Clear flash effects after 1 second
      setTimeout(() => setFlashMap({}), 1000);

      if (Object.keys(baselinePricesRef.current).length === 0 && data.length > 0) {
        const initialMap = {};
        data.forEach((s) => (initialMap[s.ticker] = s.price));
        baselinePricesRef.current = initialMap;
        localStorage.setItem('watchlist_baselines', JSON.stringify(initialMap));
      }

      const updated = data.map((stock) => {
        const basePrice = baselinePricesRef.current[stock.ticker] || stock.price;
        const diff = parseFloat((stock.price - basePrice).toFixed(2));
        const percent = parseFloat(((diff / basePrice) * 100).toFixed(2));

        return { ...stock, diff, percent };
      });

      setStocks(updated);
      setHistory(historyData || {});
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetBaseline = () => {
    const newMap = {};
    stocks.forEach((s) => (newMap[s.ticker] = s.price));
    baselinePricesRef.current = newMap;

    const newTime = new Date().toLocaleTimeString();
    setLastSeenTime(newTime);

    localStorage.setItem('watchlist_baselines', JSON.stringify(newMap));
    localStorage.setItem('watchlist_last_seen', newTime);

    fetchData();
  };
// metrics calculations :

const topGainer = stocks.length 
  ? [...stocks].sort((a, b) => b.percent - a.percent)[0] 
  : null;

const topLoser = stocks.length 
  ? [...stocks].sort((a, b) => a.percent - b.percent)[0] 
  : null;

const gainerCount = stocks.filter((s) => s.diff > 0).length;
const loserCount = stocks.filter((s) => s.diff < 0).length;
  // Compute metrics
 // const topGainer = [...stocks].sort((a, b) => b.percent - a.percent)[0];
  //const topLoser = [...stocks].sort((a, b) => a.percent - b.percent)[0];
  //const gainerCount = stocks.filter((s) => s.diff > 0).length;

  // Filter stocks based on search input
  const filteredStocks = stocks.filter((s) =>
    s.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      {/* Inline Styles for Flashing Glow Effect */}
      <style>{`
        @keyframes flashUp {
          0% { border-color: #22c55e; box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
          100% { border-color: #334155; box-shadow: none; }
        }
        @keyframes flashDown {
          0% { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
          100% { border-color: #334155; box-shadow: none; }
        }
        .flash-up { animation: flashUp 1s ease-out; }
        .flash-down { animation: flashDown 1s ease-out; }
      `}</style>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>📊 ApexTicker Dashboard</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Showing price changes since last mark: <strong style={{ color: '#38bdf8' }}>{lastSeenTime}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#fff',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '0.9rem',
            }}
          />

          <button
            onClick={handleResetBaseline}
            style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            🔄 Mark as Read (Reset Baseline)
          </button>
        </div>
      </header>

      {/* Analytics Summary Banner */}
{stocks.length > 0 && (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
    <div style={{ background: '#1e293b', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>TOP GAINER</span>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.2rem' }}>
        {topGainer && topGainer.percent > 0 ? (
          <>{topGainer.ticker} <span style={{ color: '#22c55e' }}>+{topGainer.percent}%</span></>
        ) : (
          <span style={{ color: '#94a3b8' }}>-- No Gainers --</span>
        )}
      </div>
    </div>

    <div style={{ background: '#1e293b', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>TOP LOSER</span>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.2rem' }}>
        {topLoser && topLoser.percent < 0 ? (
          <>{topLoser.ticker} <span style={{ color: '#ef4444' }}>{topLoser.percent}%</span></>
        ) : (
          <span style={{ color: '#94a3b8' }}>-- No Losers --</span>
        )}
      </div>
    </div>

    <div style={{ background: '#1e293b', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>MARKET BREADTH</span>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.2rem' }}>
        {gainerCount} Up / {loserCount} Down
      </div>
    </div>
  </div>
)}

      {/* Stock Cards Grid (3 Columns) */}
      {filteredStocks.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No stock tickers found matching "{searchTerm}"...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
          {filteredStocks.map((stock) => {
            const isUp = stock.diff > 0;
            const isDown = stock.diff < 0;
            const badgeColor = isUp ? '#22c55e' : isDown ? '#ef4444' : '#94a3b8';
            const stockHistory = history[stock.ticker] || [{ price: stock.price }];
            const flashClass = flashMap[stock.ticker] || '';

            return (
              <div
                key={stock.ticker}
                className={flashClass}
                style={{
                  background: '#1e293b',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#38bdf8' }}>{stock.ticker}</h3>
                  {stock.diff !== 0 && (
                    <span style={{ backgroundColor: `${badgeColor}22`, color: badgeColor, padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {isUp ? `+${stock.percent}%` : `${stock.percent}%`}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>₹{stock.price}</span>
                  {stock.diff !== 0 && (
                    <span style={{ marginLeft: '0.5rem', color: badgeColor, fontSize: '0.9rem' }}>
                      ({isUp ? `+${stock.diff}` : stock.diff})
                    </span>
                  )}
                </div>

                <div style={{ height: '50px', marginTop: '0.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockHistory}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line type="monotone" dataKey="price" stroke={badgeColor} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  Vol: {stock.volume.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}