import { ChartData } from '../types';

export const processTransactions = (transactions: any[], timeRange: number = 6): ChartData[] => {
  const now = new Date();
  const intervals: { [key: string]: ChartData } = {};
  
  // Create intervals for the last X hours in 30-minute increments
  for (let i = 0; i < timeRange * 2; i++) {
    const time = new Date(now.getTime() - (i * 30 * 60 * 1000));
    const intervalKey = time.toISOString();
    intervals[intervalKey] = {
      time: intervalKey,
      value: 0,
      open: 0,
      high: 0,
      low: Infinity,
      close: 0
    };
  }

  // Process transactions
  transactions.forEach(tx => {
    if (!tx?.blockTime) return;
    
    const txTime = new Date(tx.blockTime * 1000);
    const minutes = txTime.getMinutes();
    const adjustedMinutes = Math.floor(minutes / 30) * 30;
    const intervalTime = new Date(txTime.setMinutes(adjustedMinutes, 0, 0));
    const intervalKey = intervalTime.toISOString();

    if (intervals[intervalKey]) {
      const fee = tx.meta?.fee || 0;
      const interval = intervals[intervalKey];
      
      if (interval.open === 0) {
        interval.open = fee;
      }
      interval.high = Math.max(interval.high, fee);
      interval.low = Math.min(interval.low, fee);
      interval.close = fee;
      interval.value += fee;
    }
  });

  // Convert to array and sort by time
  return Object.values(intervals)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}; 