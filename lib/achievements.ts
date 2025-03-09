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
}

// This will be used to define all achievements in the system
export const achievementDefinitions = [
  // Milestones
  {
    id: 'first_application',
    name: 'First Steps',
    description: 'Submit your first job application',
    category: 'milestones',
    points: 10,
    total: 1,
  },
  {
    id: 'application_5',
    name: 'Persistent Applicant',
    description: 'You\'re building momentum in your job search',
    category: 'milestones',
    points: 25,
    total: 5,
  },
  {
    id: 'application_25',
    name: 'Dedicated Job Seeker',
    description: 'Your commitment to finding the right role is impressive',
    category: 'milestones',
    points: 50,
    total: 25,
  },
  {
    id: 'application_100',
    name: 'Application Expert',
    description: 'You\'ve mastered the art of job applications',
    category: 'milestones',
    points: 100,
    total: 100,
  },
  
  // Consistency
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'You don\'t let weekends slow down your job search',
    category: 'consistency',
    points: 15,
    total: 1, // This is a special case, will need custom logic
  },
  {
    id: 'weekly_streak',
    name: 'Full Week Effort',
    description: 'Your daily commitment is key to job search success',
    category: 'consistency',
    points: 35,
    total: 7, // 7 consecutive days
  },
  {
    id: 'application_streak_14',
    name: 'Two-Week Streak',
    description: 'Your consistency is impressive',
    category: 'consistency',
    points: 50,
    total: 14, // 14 consecutive days
  },
  
  // Quality
  {
    id: 'first_response',
    name: 'First Response',
    description: 'Your application caught someone\'s attention',
    category: 'quality',
    points: 20,
    total: 1,
  },
  {
    id: 'first_interview',
    name: 'Interview Invitation',
    description: 'Your qualifications stood out enough to earn an interview',
    category: 'quality',
    points: 30,
    total: 1,
  },
  {
    id: 'interview_5',
    name: 'Interview Master',
    description: 'You\'re getting noticed by employers',
    category: 'quality',
    points: 75,
    total: 5,
  },
  
  // Mastery
  {
    id: 'profile_complete',
    name: 'Profile Pioneer',
    description: 'A complete profile helps you stand out to employers',
    category: 'mastery',
    points: 15,
    total: 1, // This is a special case, will need custom logic
  },
  {
    id: 'resume_upload',
    name: 'Resume Ready',
    description: 'Your resume is the foundation of your job search',
    category: 'mastery',
    points: 10,
    total: 1,
  },
  {
    id: 'cover_letter',
    name: 'Cover Letter Creator',
    description: 'A personalized cover letter shows your interest in the role',
    category: 'mastery',
    points: 15,
    total: 1,
  },
];

// Helper function to check if an achievement is unlocked
export function checkAchievementUnlocked(achievement: Achievement): boolean {
  return achievement.progress >= achievement.total;
}

// Helper function to calculate achievement progress percentage
export function getAchievementProgressPercentage(achievement: Achievement): number {
  return Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
}
