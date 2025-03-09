import React from 'react';
import { cn } from "../../lib/utils";

interface EnhancedProgressBarProps {
  progress: number;
  total: number;
  showPercentage?: boolean;
  showValues?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isDarkMode?: boolean;
}

export function EnhancedProgressBar({
  progress,
  total,
  showPercentage = true,
  showValues = true,
  size = 'md',
  className,
  isDarkMode = false
}: EnhancedProgressBarProps) {
  const percentage = Math.min(100, Math.round((progress / total) * 100));
  
  // Determine color based on progress percentage
  const getProgressColor = () => {
    if (percentage < 33) return 'bg-blue-500';
    if (percentage < 66) return 'bg-green-500';
    if (percentage < 100) return 'bg-amber-500';
    return 'bg-purple-500';
  };
  
  // Determine height based on size
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };
  
  // Calculate milestone positions (25%, 50%, 75%)
  const milestones = [25, 50, 75].map(milestone => ({
    position: milestone,
    reached: percentage >= milestone
  }));

  return (
    <div className={className}>
      {(showValues || showPercentage) && (
        <div className="flex justify-between mb-1 text-xs">
          {showValues && (
            <span className="font-medium">{progress} / {total}</span>
          )}
          {showPercentage && (
            <span className="font-medium">{percentage}%</span>
          )}
        </div>
      )}
      
      <div className="relative">
        <div className={cn(
          "w-full rounded-full", 
          getHeight(),
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        )}>
          <div 
            className={cn("rounded-full", getHeight(), getProgressColor())} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        {/* Milestone markers */}
        {milestones.map((milestone) => (
          <div 
            key={milestone.position}
            className={cn(
              "absolute top-0 bottom-0 w-0.5", 
              milestone.reached 
                ? 'bg-white/70' 
                : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            )}
            style={{ left: `${milestone.position}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}
