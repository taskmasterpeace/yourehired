// Status change type
export interface StatusChange {
  id: number;
  opportunityId: string | number;
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
// In @/lib/types.ts
export enum ApplicationStatus {
  BOOKMARKED = "Bookmarked",
  INTERESTED = "Interested",
  RECRUITER_CONTACT = "Recruiter Contact",
  NETWORKING = "Networking",
  PREPARING_APPLICATION = "Preparing Application",
  APPLIED = "Applied",
  APPLICATION_ACKNOWLEDGED = "Application Acknowledged",
  SCREENING = "Screening",
  TECHNICAL_ASSESSMENT = "Technical Assessment",
  FIRST_INTERVIEW = "First Interview",
  SECOND_INTERVIEW = "Second Interview",
  FINAL_INTERVIEW = "Final Interview",
  OFFER_RECEIVED = "Offer Received",
  NEGOTIATING = "Negotiating",
  OFFER_ACCEPTED = "Offer Accepted",
  REJECTED = "Rejected",
}

export interface JobApplication {
  id: string;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  location: string;
  dateAdded: string;
  dateApplied?: string;
  jobDescription?: string;
  salary?: string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  url?: string;
  tags: string[];
  statusHistory: Array<{
    status: ApplicationStatus;
    date: string;
    notes?: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    notes?: string;
    location?: string;
    isCompleted?: boolean;
  }>;
}
