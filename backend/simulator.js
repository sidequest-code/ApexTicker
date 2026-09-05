const db = require('./db');

const TICKERS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS'];

function generateNewData(lastPrice) {
  const percentChange = (Math.random() * 6 - 3) / 100;
  const newPrice = parseFloat((lastPrice * (1 + percentChange)).toFixed(2));
  const newVolume = Math.floor(Math.random() * 45000) + 5000;
  return { newPrice, newVolume };
}

function pushStockSnapshots() {
  const insertStmt = db.prepare(
    'INSERT INTO stocks (ticker, price, volume, timestamp) VALUES (?, ?, ?, ?)'
  );
  const now = new Date().toISOString();

  const insertMany = db.transaction((tickers) => {
    for (const ticker of tickers) {
      const lastRow = db.prepare(
        'SELECT price FROM stocks WHERE ticker = ? ORDER BY id DESC LIMIT 1'
      ).get(ticker);

      const basePrice = lastRow ? lastRow.price : 1000;
      const { newPrice, newVolume } = generateNewData(basePrice);

      insertStmt.run(ticker, newPrice, newVolume, now);
    }
  });

  insertMany(TICKERS);
  console.log(`[${new Date().toLocaleTimeString()}] Pushed updated market snapshot.`);
}

function startSimulator() {
  pushStockSnapshots();
  setInterval(pushStockSnapshots, 5000);
}

module.exports = startSimulator;