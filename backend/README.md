# Crypto Arbitrage & Price Prediction System

## Overview
This project combines two powerful cryptocurrency trading tools:
1. A real-time arbitrage scanner between Binance and Solana DEX
2. An AI-powered price prediction system using TensorFlow.js

### Key Features
- Real-time price monitoring across Binance and Solana DEX
- Automated arbitrage opportunity detection with fee consideration
- ML-based price prediction using historical data
- WebSocket support for real-time updates
- Comprehensive backtesting framework
- REST API endpoints for data access and control

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Binance API keys
- Solana RPC endpoint

### Environment Setup
Create a `.env` file in the root directory:
```env
PORT=your_port_number
MONGODB_URI=mongo_url
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
SOLANA_RPC_URL=your_solana_rpc_url
SOL_BTC_USDC_MARKET=your_btc_usdc_market_address
SOL_ETH_USDC_MARKET=your_eth_usdc_market_address
SOL_SOL_USDC_MARKET=your_sol_usdc_market_address
SERUM_PROGRAM_ID=enter_program_id
```

### Installation Steps
```bash
# Clone the repository
git clone https://github.com/Lathiya50/CEX-DEX-Price-Arbitrage-Scanner.git

# Install dependencies
cd backend
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Technical Implementation

### Arbitrage Scanner
- **Price Monitoring**: Implements WebSocket connections to Binance and polls Solana DEX for real-time price updates
- **Fee Calculation**: Accounts for:
  - Binance trading fees (0.1%)
  - Solana DEX fees (0.3%)
  - Network transaction costs (0.0005%)
- **Queue Management**: Implements rate limiting and batch processing to handle high-frequency updates

### Price Prediction System
- **Neural Network Architecture**:
  - Input layer: 5 features (returns, volatility, MA7, MA25, RSI)
  - Hidden layers: 32 and 16 units with ReLU activation
  - Output layer: Single unit with sigmoid activation
- **Data Processing**:
  - Historical data fetching from Binance
  - Technical indicator calculation
  - Data normalization
- **Backtesting**: Implements historical performance analysis with accuracy metrics

## API Documentation

### Arbitrage Endpoints

#### GET /api/arbitrage/opportunities
Returns current arbitrage opportunities
```json
{
  "symbol": "BTCUSDC",
  "binancePrice": 50000,
  "dexPrice": 50250,
  "profitPercentage": 0.5,
  "timestamp": "2024-01-09T12:00:00Z"
}
```

#### GET /api/arbitrage/historical
Returns historical arbitrage opportunities with optional filters

### Price Prediction Endpoints

#### GET /api/prediction/predictions
Returns latest price predictions
```json
{
  "symbol": "BTCUSDC",
  "timestamp": "2024-01-09T12:00:00Z",
  "predictedDirection": true,
  "confidence": 0.75,
  "currentPrice": 50000
}
```

#### POST /api/prediction/predict/:symbol
Generates new prediction for specified symbol

## WebSocket Events

### Client -> Server
- `SUBSCRIBE_PAIR`: Subscribe to updates for a trading pair
- `UNSUBSCRIBE_PAIR`: Unsubscribe from updates

### Server -> Client
- `ARBITRAGE_OPPORTUNITY`: New arbitrage opportunity detected
- `NEW_PREDICTION`: New price prediction generated

## Development Choices

### Technology Stack
- **Node.js & Express**: Chosen for high-performance async I/O
- **MongoDB**: Flexible schema for varied data types
- **TensorFlow.js**: Production-ready ML capabilities
- **WebSocket**: Real-time updates with minimal latency

### Architecture Decisions
1. **Queue-based Processing**:
   - Implements rate limiting
   - Prevents API throttling
   - Ensures reliable data processing

2. **Modular Design**:
   - Separate services for price monitoring and predictions
   - Easy to extend with new features
   - Maintainable codebase

3. **Error Handling**:
   - Comprehensive error catching
   - Automatic reconnection for WebSockets
   - Rate limit handling

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request
