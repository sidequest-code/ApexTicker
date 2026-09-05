const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('stocks.db');

// Ensure database table exists with ID primary key
db.exec(`
  CREATE TABLE IF NOT EXISTS stock_ticks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT,
    price REAL,
    volume INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const tickers = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS'];
const basePrices = { RELIANCE: 1250, TCS: 1350, INFY: 960, HDFCBANK: 800, TATAMOTORS: 1040 };

// Seed initial values so API never returns empty arrays
const count = db.prepare('SELECT COUNT(*) as count FROM stock_ticks').get();
if (count.count === 0) {
  const insertStmt = db.prepare('INSERT INTO stock_ticks (ticker, price, volume) VALUES (?, ?, ?)');
  tickers.forEach((ticker) => {
    insertStmt.run(ticker, basePrices[ticker], 15000);
  });
}

// Background job: Simulate live ticks every 5 seconds
setInterval(() => {
  const insertStmt = db.prepare('INSERT INTO stock_ticks (ticker, price, volume) VALUES (?, ?, ?)');
  tickers.forEach((ticker) => {
    const fluctuation = (Math.random() - 0.48) * 5;
    const newPrice = parseFloat((basePrices[ticker] + fluctuation).toFixed(2));
    basePrices[ticker] = Math.max(10, newPrice);
    const volume = Math.floor(Math.random() * 50000) + 5000;

    insertStmt.run(ticker, basePrices[ticker], volume);
  });
}, 5000);

// API 1: Fetch latest stock prices
app.get('/api/stocks/latest', (req, res) => {
  const query = `
    SELECT ticker, price, volume, timestamp 
    FROM stock_ticks 
    WHERE id IN (SELECT MAX(id) FROM stock_ticks GROUP BY ticker)
  `;
  const rows = db.prepare(query).all();
  res.json(rows);
});

// API 2: Fetch stock history for sparklines
app.get('/api/stocks/history', (req, res) => {
  const historyQuery = `
    SELECT ticker, price, timestamp 
    FROM stock_ticks 
    ORDER BY id DESC 
    LIMIT 50
  `;
  const rows = db.prepare(historyQuery).all();

  const historyMap = {};
  rows.reverse().forEach((row) => {
    if (!historyMap[row.ticker]) historyMap[row.ticker] = [];
    if (historyMap[row.ticker].length < 10) {
      historyMap[row.ticker].push({ price: row.price });
    }
  });

  res.json(historyMap);
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});