// Status change type
export interface StatusChange {
  id: number;
  opportunityId: number;
  oldStatus: string;
  newStatus: string;
  date: string;
  company: string;
  position: string;
}

// Job recommendation types
export interface JobRecommendation {
  id: number;
  company: string;
  position: string;
  location: string;
  description: string;
  salary?: string;
  url?: string;
  source?: string;
}

export interface RatedRecommendation extends JobRecommendation {
  rating: string;
  ratedAt: string;
}

// Protected content wrapper props
export interface ProtectedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
