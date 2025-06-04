import React from 'react';
import { DEFAULT_RPCS, KNOWN_TOKENS } from '../constants';

interface TokenFormProps {
  rpcUrl: string;
  tokenAddress: string;
  onRpcUrlChange: (url: string) => void;
  onTokenAddressChange: (address: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const TokenForm: React.FC<TokenFormProps> = ({
  rpcUrl,
  tokenAddress,
  onRpcUrlChange,
  onTokenAddressChange,
  onSubmit,
  loading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="rpcUrl" className="block text-sm font-medium mb-1">RPC URL</label>
        <input
          type="text"
          id="rpcUrl"
          value={rpcUrl}
          onChange={(e) => onRpcUrlChange(e.target.value)}
          placeholder="Enter RPC URL (e.g., https://api.mainnet-beta.solana.com)"
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="tokenAddress" className="block text-sm font-medium mb-1">Token Address</label>
        <input
          type="text"
          id="tokenAddress"
          value={tokenAddress}
          onChange={(e) => onTokenAddressChange(e.target.value)}
          placeholder="Enter token address"
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Chart'}
      </button>
    </form>
  );
}; 