// Define the shape of our global state
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface ChatMessage {
  id: number;
  message: string;
  sender: "user" | "ai";
  timestamp: string;
}

export interface Opportunity {
  id: number | string;
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
  keywords?: string[] | any[];
  selectedKeywords?: string[];
  updatedAt?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: "interview" | "deadline" | "followup" | "assessment";
  opportunityId?: number | string;
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
  chatMessages: { [opportunityId: string]: ChatMessage[] };
}

export type AppAction =
  | { type: "ADD_OPPORTUNITY"; payload: Opportunity }
  | { type: "SET_OPPORTUNITIES"; payload: Opportunity[] }
  | {
      type: "UPDATE_OPPORTUNITY";
      payload: { id: number | string; updates: Partial<Opportunity> };
    }
  | { type: "DELETE_OPPORTUNITY"; payload: number | string }
  | { type: "UPDATE_MASTER_RESUME"; payload: string }
  | { type: "ADD_EVENT"; payload: CalendarEvent }
  | { type: "SET_EVENTS"; payload: CalendarEvent[] }
  | {
      type: "UPDATE_EVENT";
      payload: { id: number | string; updates: Partial<CalendarEvent> };
    }
  | { type: "DELETE_EVENT"; payload: number | string }
  | { type: "UPDATE_USER_PROFILE"; payload: Partial<AppState["userProfile"]> }
  | {
      type: "ADD_CHAT_MESSAGE";
      payload: {
        opportunityId: number | string;
        message: string;
        sender: string;
      };
    }
  // Add the LOAD_DATA type here:
  | {
      type: "LOAD_DATA";
      payload: {
        opportunities: Opportunity[];
        events: CalendarEvent[];
        masterResume?: string;
        userProfile?: {
          name: string;
          email: string;
          preferences: {
            darkMode: boolean;
          };
        };
        chatMessages?: Record<string, any[]>;
      };
    };
