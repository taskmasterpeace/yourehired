export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'milestones' | 'consistency' | 'quality' | 'mastery';
  points: number;
  unlocked: boolean;
  progress: number;
  total: number;
  unlockedAt?: Date | null;
  rarity: AchievementRarity;
}

// Helper function to determine achievement rarity based on points
export function determineRarity(points: number): AchievementRarity {
  if (points >= 75) return 'legendary';
  if (points >= 50) return 'rare';
  if (points >= 25) return 'uncommon';
  return 'common';
}

// Helper function to calculate achievement progress percentage
export function getProgressPercentage(progress: number, total: number): number {
  return Math.min(100, Math.round((progress / total) * 100));
}

// Helper function to estimate time to complete an achievement
export function estimateTimeToComplete(progress: number, total: number): string {
  const remaining = total - progress;
  
  if (remaining <= 1) return 'Less than a day';
  if (remaining <= 5) return '~1-2 days';
  if (remaining <= 10) return '~3-5 days';
  if (remaining <= 25) return '~1-2 weeks';
  return 'Several weeks';
}

// Helper function to get achievements closest to completion
export function getAchievementsNearCompletion(achievements: Achievement[], count: number = 3): Achievement[] {
  return [...achievements]
    .filter(a => !a.unlocked && a.progress > 0)
    .sort((a, b) => {
      const percentA = (a.progress / a.total) * 100;
      const percentB = (b.progress / b.total) * 100;
      return percentB - percentA;
    })
    .slice(0, count);
}

// Helper function to get next logical achievements to pursue
export function getNextAchievements(achievements: Achievement[], count: number = 2): Achievement[] {
  return [...achievements]
    .filter(a => !a.unlocked && a.progress === 0)
    .sort((a, b) => a.total - b.total)
    .slice(0, count);
}
