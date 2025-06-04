import React, { useState, useEffect, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
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

    try {
      const connection = new Connection(rpcUrl, 'confirmed');
      let tokenPublicKey: PublicKey;

      if (Object.keys(KNOWN_TOKENS).includes(tokenAddress.toUpperCase())) {
        tokenPublicKey = new PublicKey(KNOWN_TOKENS[tokenAddress.toUpperCase() as keyof typeof KNOWN_TOKENS]);
      } else {
        tokenPublicKey = new PublicKey(tokenAddress);
      }

      const tokenAccounts = await connection.getTokenLargestAccounts(tokenPublicKey);
      if (!tokenAccounts.value.length) {
        throw new Error('No token accounts found');
      }

      const signatures = await connection.getSignaturesForAddress(tokenPublicKey, { limit: 100 });
      if (!signatures.length) {
        throw new Error('No transaction history found');
      }

      const transactions = await Promise.all(
        signatures.map(sig => connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 }))
      );

      const ohlcData = processTransactions(transactions, 6);
      if (!ohlcData.length) {
        throw new Error('No valid transaction data found');
      }

      setChartData(ohlcData);
      setTokenInfo({
        name: tokenAddress.toUpperCase(),
        symbol: tokenAddress.toUpperCase()
      });

    } catch (err) {
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