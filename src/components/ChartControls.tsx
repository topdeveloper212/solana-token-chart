import React from 'react';

interface ChartControlsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  onDownload: () => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  isDarkMode,
  onToggleDarkMode,
  zoomLevel,
  onZoomChange,
  onDownload
}) => {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onToggleDarkMode}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          -
        </button>
        <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
        <button
          onClick={() => onZoomChange(Math.min(2, zoomLevel + 0.1))}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          +
        </button>
      </div>
      <button
        onClick={onDownload}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        📥
      </button>
    </div>
  );
}; 