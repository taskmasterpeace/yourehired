import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Achievement } from "../lib/achievementUtils";
import { AchievementNotification } from "./notifications/AchievementNotification";
import { LevelUpNotification } from "./notifications/LevelUpNotification";
import { GamificationIntro } from "./onboarding/GamificationIntro";
import { fetchUserAchievements, checkAchievements } from "../lib/api/achievementService";
import { fetchUserLevel } from "../lib/api/levelService";

interface GamificationContextType {
  achievements: Achievement[];
  level: number;
  score: number;
  nextLevelScore: number;
  progress: number;
  checkForAchievements: (action: string, metadata?: any) => Promise<void>;
  showAchievementCollection: () => void;
  refreshAchievements: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
  isDarkMode: boolean;
  userId: string;
}

export function GamificationProvider({
  children,
  isDarkMode,
  userId
}: GamificationProviderProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [nextLevelScore, setNextLevelScore] = useState(100);
  const [progress, setProgress] = useState(0);
  
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [levelUp, setLevelUp] = useState<{ newLevel: number; previousLevel: number } | null>(null);
  
  const [showIntro, setShowIntro] = useState(false);
  const [showMobileAchievements, setShowMobileAchievements] = useState(false);
  
  // Load user achievements and level on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if this is the user's first visit
        const isFirstVisit = localStorage.getItem('gamificationIntroShown') !== 'true';
        if (isFirstVisit) {
          setShowIntro(true);
        }
        
        // Fetch achievements and level data
        const achievements = await fetchUserAchievements();
        setAchievements(achievements);
        
        const levelData = await fetchUserLevel();
        setLevel(levelData.level);
        setScore(levelData.currentScore);
        setNextLevelScore(levelData.nextLevelScore);
        setProgress(levelData.progress);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [userId]);
  
  // Check for achievements based on user actions
  const checkForAchievements = async (action: string, metadata?: any) => {
    try {
      const newlyUnlocked = await checkAchievements(action, metadata);
      
      if (newlyUnlocked.length > 0) {
        // Update achievements list
        setAchievements(prev => {
          const updated = [...prev];
          
          newlyUnlocked.forEach(unlocked => {
            const index = updated.findIndex(a => a.id === unlocked.id);
            if (index >= 0) {
              updated[index] = { ...unlocked, unlocked: true };
            } else {
              updated.push(unlocked);
            }
          });
          
          return updated;
        });
        
        // Show notification for the first unlocked achievement
        setUnlockedAchievement(newlyUnlocked[0]);
        
        // Check if level changed
        const levelData = await fetchUserLevel();
        if (levelData.level > level) {
          setLevelUp({
            newLevel: levelData.level,
            previousLevel: level
          });
        }
        
        // Update level data
        setLevel(levelData.level);
        setScore(levelData.currentScore);
        setNextLevelScore(levelData.nextLevelScore);
        setProgress(levelData.progress);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };
  
  // Refresh achievements data
  const refreshAchievements = async () => {
    try {
      const achievements = await fetchUserAchievements();
      setAchievements(achievements);
      
      const levelData = await fetchUserLevel();
      setLevel(levelData.level);
      setScore(levelData.currentScore);
      setNextLevelScore(levelData.nextLevelScore);
      setProgress(levelData.progress);
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    }
  };
  
  // Show achievement collection (mobile)
  const showAchievementCollection = () => {
    setShowMobileAchievements(true);
  };
  
  // Handle intro completion
  const handleIntroComplete = () => {
    localStorage.setItem('gamificationIntroShown', 'true');
  };

  return (
    <GamificationContext.Provider value={{
      achievements,
      level,
      score,
      nextLevelScore,
      progress,
      checkForAchievements,
      showAchievementCollection,
      refreshAchievements
    }}>
      {children}
      
      {/* Notifications */}
      <AchievementNotification 
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
        isDarkMode={isDarkMode}
      />
      
      <LevelUpNotification 
        levelUp={levelUp}
        onClose={() => setLevelUp(null)}
        isDarkMode={isDarkMode}
      />
      
      {/* Onboarding */}
      <GamificationIntro 
        open={showIntro}
        onOpenChange={setShowIntro}
        onComplete={handleIntroComplete}
        isDarkMode={isDarkMode}
      />
    </GamificationContext.Provider>
  );
}

// Custom hook to use the gamification context
export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
