
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const cappedValue = Math.min(100, Math.max(0, value));

  return (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-indigo-700 dark:text-white">Progress</span>
            <span className="text-sm font-medium text-indigo-700 dark:text-white">{Math.round(cappedValue)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
            <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${cappedValue}%` }}
            ></div>
        </div>
    </div>
  );
};

export default ProgressBar;
