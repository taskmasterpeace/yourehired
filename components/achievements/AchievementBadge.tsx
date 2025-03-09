import React from 'react';
import { cn } from "../../lib/utils";
import { Award, Star, Zap, Trophy } from "lucide-react";

type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

interface AchievementBadgeProps {
  name: string;
  description: string;
  category: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  progress: number;
  total: number;
  points: number;
  className?: string;
  isDarkMode?: boolean;
}

export function AchievementBadge({
  name,
  description,
  category,
  rarity,
  unlocked,
  progress,
  total,
  points,
  className,
  isDarkMode = false
}: AchievementBadgeProps) {
  // Get icon based on category
  const getIcon = () => {
    switch (category) {
      case 'milestones': return <Trophy />;
      case 'consistency': return <Zap />;
      case 'quality': return <Star />;
      default: return <Award />;
    }
  };
  
  // Get colors based on rarity
  const getRarityColors = () => {
    if (!unlocked) {
      return {
        bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
        border: isDarkMode ? 'border-gray-600' : 'border-gray-200',
        text: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        iconBg: isDarkMode ? 'bg-gray-600' : 'bg-gray-200',
        iconColor: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        progressBg: isDarkMode ? 'bg-gray-600' : 'bg-gray-300',
        progressFill: isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
      };
    }
    
    switch (rarity) {
      case 'legendary':
        return {
          bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
          border: isDarkMode ? 'border-purple-800' : '!border-purple-200',
          text: isDarkMode ? 'text-purple-300' :  'text-purple-700',
          iconBg: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
          iconColor: isDarkMode ? 'text-purple-300' : 'text-purple-600',
          progressBg: isDarkMode ? 'bg-purple-900/50' : 'bg-purple-200',
          progressFill: isDarkMode ? 'bg-purple-500' : 'bg-purple-500'
        };
      case 'rare':
        return {
          bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          border: isDarkMode ? 'border-blue-800' : 'border-blue-200',
          text: isDarkMode ? 'text-blue-300' : 'text-blue-700',
          iconBg: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
          iconColor: isDarkMode ? 'text-blue-300' : 'text-blue-600',
          progressBg: isDarkMode ? 'bg-blue-900/50' : 'bg-blue-200',
          progressFill: isDarkMode ? 'bg-blue-500' : 'bg-blue-500'
        };
      case 'uncommon':
        return {
          bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
          border: isDarkMode ? 'border-green-800' : 'border-green-200',
          text: isDarkMode ? 'text-green-300' : 'text-green-700',
          iconBg: isDarkMode ? 'bg-green-900' : 'bg-green-100',
          iconColor: isDarkMode ? 'text-green-300' : 'text-green-600',
          progressBg: isDarkMode ? 'bg-green-900/50' : 'bg-green-200',
          progressFill: isDarkMode ? 'bg-green-500' : 'bg-green-500'
        };
      default: // common
        return {
          bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
          border: isDarkMode ? 'border-gray-600' : 'border-gray-200',
          text: isDarkMode ? 'text-gray-300' : 'text-gray-700',
          iconBg: isDarkMode ? 'bg-gray-600' : 'bg-gray-200',
          iconColor: isDarkMode ? 'text-gray-300' : 'text-gray-600',
          progressBg: isDarkMode ? 'bg-gray-600' : 'bg-gray-200',
          progressFill: isDarkMode ? 'bg-gray-500' : 'bg-gray-500'
        };
    }
  };
  
  const colors = getRarityColors();
  const percentage = Math.min(100, Math.round((progress / total) * 100));
  
  // Get rarity label
  const getRarityLabel = () => {
    switch (rarity) {
      case 'legendary': return 'Legendary';
      case 'rare': return 'Rare';
      case 'uncommon': return 'Uncommon';
      default: return 'Common';
    }
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border relative overflow-hidden',
      colors.bg,
      colors.border,
      className
    )}>
      {/* Rarity indicator */}
      <div className="absolute top-0 right-0">
        <div className={cn(
          'px-2 py-1 text-xs font-medium rounded-bl-lg',
          colors.iconBg,
          colors.text
        )}>
          {getRarityLabel()}
        </div>
      </div>
      
      <div className="flex items-start gap-3 mt-2">
        <div className={cn('p-3 rounded-full', colors.iconBg)}>
          {React.cloneElement(getIcon() as React.ReactElement, { 
            className: cn('h-6 w-6', colors.iconColor)
          })}
        </div>
        
        <div className="flex-1">
          <h3 className={cn('font-medium', colors.text)}>{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">{progress} / {total}</span>
              <span className="text-xs font-medium">{points} points</span>
            </div>
            <div className={cn('w-full h-1.5 rounded-full', colors.progressBg)}>
              <div 
                className={cn('h-1.5 rounded-full', colors.progressFill)} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
