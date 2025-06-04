# Solana Token Chart

A web application for viewing Solana token transfer volumes using candlestick charts.

## Features

- View token transfer volumes as candlestick charts
- Support for any Solana RPC endpoint (devnet, mainnet-beta, or private clusters)
- Real-time data fetching from the Solana blockchain
- Responsive design with Tailwind CSS
- Interactive charts using ApexCharts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. Enter a valid Solana RPC URL (e.g., https://api.devnet.solana.com)
2. Enter a valid SPL token address
3. Click "Load Chart" to fetch and display the token's transfer volume

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- ApexCharts
- @solana/web3.js
- @solana/spl-token 