import { AppState, AppAction, CalendarEvent } from './types';

// Helper function to generate events from an opportunity
const generateEventsFromOpportunity = (opportunity) => {
  const events: CalendarEvent[] = [];
  const now = Date.now();
  
  // Parse the date from the appliedDate string
  const dateObj = new Date(opportunity.appliedDate);
  
  switch(opportunity.status) {
    case 'Technical Assessment':
      // Add an event for the assessment (3 days from now)
      const assessmentDate = new Date(dateObj);
      assessmentDate.setDate(assessmentDate.getDate() + 3);
      events.push({
        id: now,
        title: `Technical Assessment for ${opportunity.company}`,
        date: assessmentDate.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        type: 'assessment',
        opportunityId: opportunity.id
      });
      break;
      
    case 'First Interview':
    case 'Second Interview':
    case 'Final Interview':
      // Add an interview event
      const interviewDate = new Date(dateObj);
      interviewDate.setDate(interviewDate.getDate() + 5);
      events.push({
        id: now + 1,
        title: `${opportunity.status} with ${opportunity.company}`,
        date: interviewDate.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        type: 'interview',
        opportunityId: opportunity.id
      });
      break;
      
    case 'Applied':
    case 'Following Up':
      // Add a follow-up reminder
      const followupDate = new Date(dateObj);
      followupDate.setDate(followupDate.getDate() + 7);
      events.push({
        id: now + 2,
        title: `Follow up with ${opportunity.company}`,
        date: followupDate.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        type: 'followup',
        opportunityId: opportunity.id
      });
      break;
      
    case 'Offer Received':
      // Add a deadline to respond to offer
      const decisionDate = new Date(dateObj);
      decisionDate.setDate(decisionDate.getDate() + 7);
      events.push({
        id: now + 3,
        title: `Deadline to respond to ${opportunity.company} offer`,
        date: decisionDate.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        type: 'deadline',
        opportunityId: opportunity.id
      });
      break;
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
        events: state.events.filter(event => event.opportunityId !== opportunityId),
        // Also clear any chat messages for this opportunity
        chatMessages: Object.fromEntries(
          Object.entries(state.chatMessages).filter(([id]) => parseInt(id) !== opportunityId)
        )
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
      const newMessage = {
        id: Date.now(),
        message,
        sender,
        timestamp: new Date().toISOString()
      };
      
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [opportunityId]: [...existingMessages, newMessage]
        }
      };
    }
    
    default:
      return state;
  }
};
