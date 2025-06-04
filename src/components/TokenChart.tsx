import React, { useCallback, useMemo, useEffect } from 'react';
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
  // Use useEffect to add and remove the wheel event listener
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.5, Math.min(2, zoomLevel + delta));
      onZoomChange(newZoom);
    };

    const element = chartRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        element.removeEventListener('wheel', handleWheel);
      };
    }
  }, [zoomLevel, onZoomChange, chartRef]);

  // Format time based on interval
  const formatTime = (time: string) => {
    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  };

  // Format price value
  const formatPrice = (value: number) => {
    return `$${value.toFixed(4)}`;
  };

  // Calculate bar color based on price movement
  const getBarColor = (data: ChartData) => {
    if (!data) return '#666666';
    return data.close >= data.open ? '#22c55e' : '#ef4444';
  };

  // Custom bar component with color based on price movement
  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    
    const color = getBarColor(payload);
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke={color}
        strokeWidth={1}
        rx={4}
        ry={4}
      />
    );
  };

  // Calculate domain for Y axis
  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return [0, 1];
    const min = Math.min(...chartData.map(d => d.low));
    const max = Math.max(...chartData.map(d => d.high));
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div 
      ref={chartRef} 
      className="w-full h-[80vh]" 
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2c2d31' : '#f1f1f1'} />
          <XAxis 
            dataKey="time" 
            stroke={isDarkMode ? '#e2e8f0' : '#1a1a1a'}
            tick={{ fill: isDarkMode ? '#e2e8f0' : '#1a1a1a', fontSize: 12 }}
            tickFormatter={formatTime}
          />
          <YAxis 
            domain={yAxisDomain}
            stroke={isDarkMode ? '#e2e8f0' : '#1a1a1a'}
            tick={{ fill: isDarkMode ? '#e2e8f0' : '#1a1a1a', fontSize: 12 }}
            tickFormatter={formatPrice}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#1a1b1e' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#2c2d31' : '#f1f1f1'}`,
              color: isDarkMode ? '#e2e8f0' : '#1a1a1a'
            }}
            formatter={(value: number, name: string, props: any) => {
              const data = props.payload;
              if (!data) return null;
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
          <Bar
            dataKey="close"
            shape={<CustomBar />}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 