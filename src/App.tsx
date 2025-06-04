import React, { useState, useEffect, useRef } from 'react';
import { Connection, PublicKey, ConfirmedSignatureInfo, RpcResponseAndContext, TokenAccountBalancePair } from '@solana/web3.js';
import html2canvas from 'html2canvas';
import { TokenChart, TokenForm, ChartControls, ErrorDisplay } from './components';
import { DEFAULT_RPCS, KNOWN_TOKENS } from './constants';
import { ChartData, TokenInfo } from './types';
import { processTransactions } from './utils/chartUtils';
import './App.css';

function App() {
  const [rpcUrl, setRpcUrl] = useState(DEFAULT_RPCS['Mainnet Beta']);
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleDownload = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `solana-token-chart-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newZoom, 0.5), 3);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Starting to fetch data...');

    try {
      // Test RPC connection first with retry logic
      const connection = new Connection(rpcUrl, 'confirmed');
      let rpcConnected = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!rpcConnected && retryCount < maxRetries) {
        try {
          await connection.getVersion();
          rpcConnected = true;
          console.log('Successfully connected to RPC endpoint');
        } catch (error) {
          retryCount++;
          console.warn(`RPC connection attempt ${retryCount} failed:`, error);
          if (retryCount === maxRetries) {
            throw new Error('Failed to connect to RPC endpoint. Please try a different RPC URL.');
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      let tokenPublicKey: PublicKey;
      try {
        if (Object.keys(KNOWN_TOKENS).includes(tokenAddress.toUpperCase())) {
          tokenPublicKey = new PublicKey(KNOWN_TOKENS[tokenAddress.toUpperCase() as keyof typeof KNOWN_TOKENS]);
        } else {
          tokenPublicKey = new PublicKey(tokenAddress);
        }
      } catch (error) {
        throw new Error('Invalid token address. Please check and try again.');
      }

      console.log('Token Public Key:', tokenPublicKey.toString());

      // Get token accounts
      const tokenAccounts = await connection.getTokenLargestAccounts(tokenPublicKey);
      console.log('Token Accounts:', tokenAccounts.value.length);
      
      if (!tokenAccounts.value.length) {
        throw new Error('No token accounts found');
      }

      // Get signatures for the last 24 hours only
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const signatures = await connection.getSignaturesForAddress(
        tokenPublicKey,
        { limit: 1000 },
        'confirmed'
      );

      console.log('Total signatures found:', signatures.length);

      if (!signatures.length) {
        throw new Error('No transaction history found');
      }

      // Filter signatures from the last 24 hours
      const recentSignatures = signatures.filter(sig => 
        sig.blockTime && new Date(sig.blockTime * 1000) > oneDayAgo
      );

      console.log('Recent signatures (last 24h):', recentSignatures.length);

      if (!recentSignatures.length) {
        throw new Error('No recent transactions found in the last 24 hours');
      }

      // Get transaction details for recent signatures
      console.log('Fetching transaction details...');
      const transactions = await Promise.all(
        recentSignatures.map(sig => 
          connection.getTransaction(sig.signature, { 
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
          })
        )
      );

      const validTransactions = transactions.filter(tx => 
        tx && tx.meta && !tx.meta.err && tx.meta.preTokenBalances && tx.meta.postTokenBalances
      );

      console.log('Valid transactions:', validTransactions.length);

      if (validTransactions.length === 0) {
        throw new Error('No valid transactions found');
      }

      console.log('Processing transactions...');
      const ohlcData = processTransactions(validTransactions, 24);
      console.log('OHLC data points:', ohlcData.length);
      
      if (!ohlcData.length) {
        throw new Error('No valid price data found');
      }

      setChartData(ohlcData);
      setTokenInfo({
        name: tokenAddress.toUpperCase(),
        symbol: tokenAddress.toUpperCase()
      });
      console.log('Chart data set successfully');

    } catch (err) {
      console.error('Error occurred:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setChartData([]);
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-dark-primary dark:to-dark-secondary py-10 flex flex-col items-center justify-center">
      <div className="relative w-full h-full px-6">
        <div className="relative px-8 py-10 bg-white dark:bg-dark-secondary shadow-xl ring-1 ring-gray-900/5 dark:ring-gray-700/5 rounded-3xl">
          <div className="w-full">
            <div className="divide-y divide-gray-300 dark:divide-gray-700">
              <div className="pb-8 text-base leading-7 space-y-6 text-gray-800 dark:text-dark-text sm:text-lg sm:leading-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900 dark:text-dark-text">Solana Token Chart</h1>
                  <ChartControls
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    zoomLevel={zoomLevel}
                    onZoomChange={(level) => setZoomLevel(level)}
                    onDownload={handleDownload}
                  />
                </div>
                
                <TokenForm
                  rpcUrl={rpcUrl}
                  tokenAddress={tokenAddress}
                  loading={loading}
                  onRpcUrlChange={setRpcUrl}
                  onTokenAddressChange={setTokenAddress}
                  onSubmit={handleSubmit}
                />

                <ErrorDisplay error={error} />

                {chartData.length > 0 && (
                  <div className="mt-8 bg-white dark:bg-dark-secondary rounded-lg shadow-lg p-4 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-5">
                    <TokenChart
                      chartData={chartData}
                      isDarkMode={isDarkMode}
                      zoomLevel={zoomLevel}
                      chartRef={chartRef}
                      onZoomChange={setZoomLevel}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 