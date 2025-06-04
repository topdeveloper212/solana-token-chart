import React, { useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';

interface TokenChartProps {
  chartData: ChartData[];
  isDarkMode: boolean;
  zoomLevel: number;
  chartRef: React.RefObject<HTMLDivElement>;
  onZoomChange: (level: number) => void;
}

export const TokenChart: React.FC<TokenChartProps> = ({ 
  chartData, 
  isDarkMode, 
  zoomLevel, 
  chartRef,
  onZoomChange 
}) => {
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoomLevel + delta));
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  // Calculate time range based on zoom level
  const timeRange = useMemo(() => {
    if (zoomLevel >= 1.8) return 6; // 6 hours
    if (zoomLevel >= 1.5) return 12; // 12 hours
    if (zoomLevel >= 1.2) return 18; // 18 hours
    if (zoomLevel >= 0.8) return 24; // 24 hours
    return 48; // 48 hours
  }, [zoomLevel]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() - (timeRange * 60 * 60 * 1000));
    return chartData.filter(data => new Date(data.time) >= startTime);
  }, [chartData, timeRange]);

  // Format time based on interval
  const formatTime = (time: string) => {
    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div 
      ref={chartRef} 
      className="w-full h-[80vh]" 
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      onWheel={handleWheel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filteredData} barSize={8} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2c2d31' : '#f1f1f1'} />
          <XAxis 
            dataKey="time" 
            stroke={isDarkMode ? '#e2e8f0' : '#1a1a1a'}
            tick={{ fill: isDarkMode ? '#e2e8f0' : '#1a1a1a', fontSize: 12 }}
            tickFormatter={formatTime}
          />
          <YAxis 
            stroke={isDarkMode ? '#e2e8f0' : '#1a1a1a'}
            tick={{ fill: isDarkMode ? '#e2e8f0' : '#1a1a1a', fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(4)}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#1a1b1e' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#2c2d31' : '#f1f1f1'}`,
              color: isDarkMode ? '#e2e8f0' : '#1a1a1a'
            }}
            formatter={(value: number, name: string, props: any) => {
              const data = props.payload;
              const date = new Date(data.time);
              return [
                <div key="tooltip" className="space-y-1 text-sm">
                  <div>Time: {date.toLocaleString()}</div>
                  <div>Open: ${data.open.toFixed(4)}</div>
                  <div>High: ${data.high.toFixed(4)}</div>
                  <div>Low: ${data.low.toFixed(4)}</div>
                  <div>Close: ${data.close.toFixed(4)}</div>
                  <div>Volume: ${data.value.toFixed(2)}</div>
                </div>
              ];
            }}
          />
          {filteredData.map((data, index) => (
            <Bar
              key={index}
              dataKey="value"
              fill={data.close >= data.open ? '#166534' : '#991b1b'}
              stroke={data.close >= data.open ? '#166534' : '#991b1b'}
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 