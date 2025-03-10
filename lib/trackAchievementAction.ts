import { trackUserAction } from "./api/achievementService";
import { useGamification } from "../components/GamificationProvider";

// Action types
export const ACHIEVEMENT_ACTIONS = {
  APPLICATION_SUBMITTED: 'application_submitted',
  RESPONSE_RECEIVED: 'response_received',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  OFFER_RECEIVED: 'offer_received',
  PROFILE_UPDATED: 'profile_updated',
  RESUME_UPDATED: 'resume_updated',
  LOGIN_STREAK: 'login_streak',
  WEEKEND_APPLICATION: 'weekend_application',
  DAILY_GOAL_COMPLETED: 'daily_goal_completed',
  WEEKLY_GOAL_COMPLETED: 'weekly_goal_completed'
};

// Hook to track user actions
export function useAchievementTracking() {
  const { checkForAchievements } = useGamification();
  
  const trackAction = async (actionType: string, actionData?: any) => {
    try {
      // Track the action on the server
      const result = await trackUserAction(actionType, actionData);
      
      // Check for any achievements that might have been unlocked
      await checkForAchievements(actionType, actionData);
      
      return result;
    } catch (error) {
      console.error('Error tracking action:', error);
      return {
        updatedAchievements: [],
        unlockedAchievements: []
      };
    }
  };
  
  return { trackAction };
}
