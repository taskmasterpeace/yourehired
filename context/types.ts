// Define the shape of our global state
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface Opportunity {
  id: number;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  jobDescription: string;
  resume: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  notes?: string;
  location?: string;
  salary?: string;
  applicationUrl?: string;
  source?: string;
  tags?: Tag[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'interview' | 'deadline' | 'followup' | 'assessment';
  opportunityId?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  preferences: {
    darkMode: boolean;
  };
}

export interface AppState {
  opportunities: Opportunity[];
  masterResume: string;
  events: CalendarEvent[];
  userProfile: UserProfile;
  chatMessages: { [opportunityId: number]: ChatMessage[] };
}

// Define all possible actions
export type AppAction =
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: { id: number; updates: Partial<Opportunity> } }
  | { type: 'DELETE_OPPORTUNITY'; payload: number }
  | { type: 'UPDATE_MASTER_RESUME'; payload: string }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: { id: number; updates: Partial<CalendarEvent> } }
  | { type: 'DELETE_EVENT'; payload: number }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'ADD_CHAT_MESSAGE'; payload: { opportunityId: number; message: string; sender: 'user' | 'ai' } };
