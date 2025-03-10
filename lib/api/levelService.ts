interface UserLevel {
  level: number;
  currentScore: number;
  nextLevelScore: number;
  progress: number;
}

// Fetch user level information
export async function fetchUserLevel(): Promise<UserLevel> {
  try {
    const response = await fetch('/api/user/level');
    if (!response.ok) throw new Error('Failed to fetch user level');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user level:', error);
    return {
      level: 1,
      currentScore: 0,
      nextLevelScore: 100,
      progress: 0
    };
  }
}

// Update user level based on points
export async function updateUserLevel(points: number): Promise<{
  newLevel: number;
  leveledUp: boolean;
  previousLevel: number;
}> {
  try {
    const response = await fetch('/api/user/level', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ points }),
    });
    
    if (!response.ok) throw new Error('Failed to update user level');
    return await response.json();
  } catch (error) {
    console.error('Error updating user level:', error);
    return {
      newLevel: 1,
      leveledUp: false,
      previousLevel: 1
    };
  }
}
