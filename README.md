# Crypto Arbitrage & Price Prediction System

A comprehensive cryptocurrency trading toolkit that combines CEX/DEX arbitrage scanning with AI-powered price prediction. The system monitors price differences between Binance and Solana DEX while providing machine learning-based price predictions.

## Features

### Arbitrage Scanner
- Real-time price monitoring across Binance and Solana DEX
- Automated arbitrage opportunity detection with fee calculations
- Live updates via WebSocket
- Historical opportunity tracking
- Interactive data visualization

### Price Predictor
- AI-powered price movement predictions
- Real-time model confidence scoring
- Historical accuracy tracking
- Backtesting framework
- Performance visualization

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Binance API keys
- Solana RPC endpoint
- npm or yarn

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Lathiya50/CEX-DEX-Price-Arbitrage-Scanner.git
cd CEX-DEX-Price-Arbitrage-Scanner
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file in backend directory with the following:
PORT=your_port_number
MONGODB_URI=mongo_url
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
SOLANA_RPC_URL=your_solana_rpc_url
SOL_BTC_USDC_MARKET=your_btc_usdc_market_address
SOL_ETH_USDC_MARKET=your_eth_usdc_market_address
SOL_SOL_USDC_MARKET=your_sol_usdc_market_address
SERUM_PROGRAM_ID=enter_program_id

# Start backend development server
npm run dev

# Or for production
npm start
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env.local file in frontend directory with:
NEXT_PUBLIC_API_URL=http://localhost:your_backend_port
NEXT_PUBLIC_WS_URL=ws://localhost:your_backend_port

# Start frontend development server
npm run dev
```

## Project Structure

```
project-root/
├── backend/
│   ├── controllers/
    ├── routes/
│   │── services/
│   │── models/
│   │── app.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css
    │   │   ├── layout.js
    │   │   └── page.js
    │   └── components/
    ├── package.json
    └── .env.local
```

## Technology Stack

### Backend
- Node.js & Express
- MongoDB
- TensorFlow.js
- WebSocket
- Binance API
- Solana Web3.js

### Frontend
- Next.js 15.1.4
- React 19
- TailwindCSS
- Recharts
- Lucide Icons
- WebSocket Client

## API Endpoints

### Arbitrage Scanner API

```javascript
GET /api/arbitrage/opportunities
GET /api/arbitrage/historical?symbol=&startTime=&endTime=
GET /api/arbitrage/stats
```

### Price Predictor API

```javascript
GET /api/prediction/predictions?symbol=&limit=
GET /api/prediction/stats
POST /api/prediction/predict/:symbol
```

## WebSocket Events

### Client Subscriptions
```javascript
// Subscribe to pair updates
{
  type: "SUBSCRIBE_PAIR",
  pair: string
}
```

### Server Events
```javascript
// Arbitrage opportunity
{
  type: "ARBITRAGE_OPPORTUNITY",
  data: {
    symbol: string,
    timestamp: string,
    binancePrice: number,
    dexPrice: number,
    profitPercentage: number
  }
}

// Price prediction
{
  type: "NEW_PREDICTION",
  data: {
    timestamp: string,
    predictedDirection: boolean,
    confidence: number,
    currentPrice: number
  }
}
```

## Development Notes

1. The backend server must be running before starting the frontend
2. Make sure MongoDB is running and accessible
3. Verify all API keys and endpoints in the .env files
4. The WebSocket connection will automatically attempt to reconnect on disconnection
5. Check the backend console for any connection or API errors

## Troubleshooting

1. **Backend Connection Issues**
   - Verify MongoDB connection string
   - Check if Binance API keys are valid
   - Ensure Solana RPC endpoint is responsive

2. **Frontend Connection Issues**
   - Confirm backend server is running
   - Verify API_URL and WS_URL in .env.local
   - Check browser console for WebSocket errors

3. **Data Not Updating**
   - Verify WebSocket connection status
   - Check rate limits on Binance API
   - Confirm Solana RPC node is synced