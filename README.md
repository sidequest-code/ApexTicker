# 📈 ApexTicker

> A high-performance, real-time financial watchlist tracking live tick movements and baseline deltas. 
---

## 🌟 Overview

**ApexTicker** is a modern fintech watchlist dashboard designed to monitor equity markets with low latency and meaningful change tracking. Rather than focusing solely on static daily percentage changes, ApexTicker allows users to establish custom baseline snapshots ("Mark as Read") to track active, dynamic shifts in price action and market breadth from a specific point in time.

---

## 🚀 Key Features

* **⚡ Real-Time Price Simulation:** Live backend feed pushing tick and volume updates every 5 seconds.
* **🎯 Baseline Delta Tracking:** Custom baseline engine using `localStorage` to compute dynamic percentage shifts ($\Delta$) on demand.
* **✨ Dynamic Flash Indicators:** Visual CSS flash animations highlighting upward (green glow) and downward (red glow) price updates in real time.
* **📊 Inline Sparklines:** Visual price history trends rendered per ticker using `Recharts`.
* **🧠 Market Breadth Banner:** High-level metrics bar displaying Top Gainer, Top Loser, and overall market sentiment (Up vs. Down balance).
* **🔍 Instant Search:** Real-time client-side filter to isolate target tickers instantly.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Recharts, CSS3
* **Backend:** Node.js, Express.js
* **Database:** SQLite (`better-sqlite3`)
* **State & Persistence:** React Hooks, `localStorage` API

---

## 📁 Project Structure
```text
apex-ticker/
├── backend/
│   ├── stocks.db         
│   ├── server.js         
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx        
    │   ├── main.jsx      
    │   └── index.css      
    ├── index.html
    └── package.json

---

## 🏁 Quickstart & Setup

Follow these steps to get **ApexTicker** running locally on your machine.

### 📋 Prerequisites
Ensure you have the following installed on your system:
* **Node.js** 
* **npm** 
* **Git**

---

### 1. Clone the Repository

git clone [https://github.com/sidequest-code/ApexTicker.git](https://github.com/sidequest-code/ApexTicker.git)
cd ApexTicker

### 2. Backend Setup

1. Open a terminal and navigate to the `backend`directory:
cd backend
2. Install dependencies:
npm install
3. Start the Node server:
node server.js

* **The server will start at http://localhost:5000.**

### 3. Frontend Setup

1. Open a second terminal tab and navigate to the `frontend` directory:
cd frontend
2. Install dependencies:
npm install
3. Start the Vite dev server:
npm run dev
4. Open http://localhost:5173 in your browser to view the active dashboard.


## 📡 API Endpoints

| Endpoint | Method | Description | Response Payload |
| :--- | :---: | :--- | :--- |
| `/api/stocks/latest` | `GET` | Fetches the most recent price, volume, and tick details for all monitored tickers. | Array of Stock Objects |
| `/api/stocks/history` | `GET` | Retrieves the last 10 historical price points per ticker used to render sparkline charts. | Object (Key: Ticker, Value: Array) |
