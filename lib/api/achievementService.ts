import { Achievement } from "../achievementUtils";

// Fetch user achievements
export async function fetchUserAchievements(): Promise<Achievement[]> {
  try {
    const response = await fetch('/api/achievements');
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return await response.json();
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

// Update achievement progress
export async function updateAchievementProgress(
  achievementId: string, 
  progress: number
): Promise<boolean> {
  try {
    const response = await fetch(`/api/achievements/${achievementId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });
    
    if (!response.ok) throw new Error('Failed to update achievement progress');
    return true;
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    return false;
  }
}

// Check for newly unlocked achievements
export async function checkAchievements(action: string, metadata?: any): Promise<Achievement[]> {
  try {
    const response = await fetch('/api/achievements/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, metadata }),
    });
    
    if (!response.ok) throw new Error('Failed to check achievements');
    const result = await response.json();
    return result.unlockedAchievements || [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// Track user action for achievement progress
export async function trackUserAction(
  actionType: string, 
  actionData?: any
): Promise<{
  updatedAchievements: Achievement[],
  unlockedAchievements: Achievement[]
}> {
  try {
    const response = await fetch('/api/user-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        actionType, 
        actionData,
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) throw new Error('Failed to track user action');
    return await response.json();
  } catch (error) {
    console.error('Error tracking user action:', error);
    return {
      updatedAchievements: [],
      unlockedAchievements: []
    };
  }
}
