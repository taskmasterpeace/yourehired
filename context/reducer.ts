import { AppState, AppAction, CalendarEvent } from './types';

// Helper function to generate events from an opportunity
const generateEventsFromOpportunity = (opportunity) => {
  const events: CalendarEvent[] = [];
  
  // Create an event based on the opportunity status
  if (opportunity.status === 'Interview Scheduled') {
    // Parse the date from the appliedDate string
    const dateObj = new Date(opportunity.appliedDate);
    // Add 7 days for the interview (just an example)
    dateObj.setDate(dateObj.getDate() + 7);
    
    events.push({
      id: Date.now(),
      title: `Interview with ${opportunity.company}`,
      date: dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      type: 'interview',
      opportunityId: opportunity.id
    });
  } else if (opportunity.status === 'Applied') {
    // Parse the date from the appliedDate string
    const dateObj = new Date(opportunity.appliedDate);
    // Add 14 days for the follow-up (just an example)
    dateObj.setDate(dateObj.getDate() + 14);
    
    events.push({
      id: Date.now() + 1,
      title: `Follow-up with ${opportunity.company}`,
      date: dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      type: 'followup',
      opportunityId: opportunity.id
    });
  }
  
  return events;
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_OPPORTUNITY': {
      const newOpportunity = action.payload;
      // Generate events based on the new opportunity
      const newEvents = generateEventsFromOpportunity(newOpportunity);
      
      return {
        ...state,
        opportunities: [...state.opportunities, newOpportunity],
        events: [...state.events, ...newEvents]
      };
    }
    
    case 'UPDATE_OPPORTUNITY': {
      const { id, updates } = action.payload;
      const updatedOpportunities = state.opportunities.map(opp => 
        opp.id === id ? { ...opp, ...updates } : opp
      );
      
      // If status changed, we might need to update or add events
      let updatedEvents = [...state.events];
      if (updates.status) {
        // Remove existing events for this opportunity
        updatedEvents = updatedEvents.filter(event => event.opportunityId !== id);
        
        // Find the updated opportunity
        const updatedOpp = updatedOpportunities.find(opp => opp.id === id);
        if (updatedOpp) {
          // Generate new events based on the updated status
          const newEvents = generateEventsFromOpportunity(updatedOpp);
          updatedEvents = [...updatedEvents, ...newEvents];
        }
      }
      
      return {
        ...state,
        opportunities: updatedOpportunities,
        events: updatedEvents
      };
    }
    
    case 'DELETE_OPPORTUNITY': {
      const opportunityId = action.payload;
      return {
        ...state,
        opportunities: state.opportunities.filter(opp => opp.id !== opportunityId),
        events: state.events.filter(event => event.opportunityId !== opportunityId)
      };
    }
    
    case 'UPDATE_MASTER_RESUME':
      return {
        ...state,
        masterResume: action.payload
      };
    
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      };
    
    case 'UPDATE_EVENT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updates } : event
        )
      };
    }
    
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload)
      };
    
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ...action.payload
        }
      };
    
    case 'ADD_CHAT_MESSAGE': {
      const { opportunityId, message, sender } = action.payload;
      const existingMessages = state.chatMessages[opportunityId] || [];
      
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [opportunityId]: [...existingMessages, { message, sender }]
        }
      };
    }
    
    default:
      return state;
  }
};
