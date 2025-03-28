import { AppState, AppAction, CalendarEvent, Opportunity } from "./types";

// Helper function to generate events from an opportunity
const generateEventsFromOpportunity = (opportunity: Opportunity) => {
  const events: CalendarEvent[] = [];
  const now = Date.now();
  // Parse the date from the appliedDate string
  const dateObj = new Date(opportunity.appliedDate);

  switch (opportunity.status) {
    case "Technical Assessment":
      // Add an event for the assessment (3 days from now)
      const assessmentDate = new Date(dateObj);
      assessmentDate.setDate(assessmentDate.getDate() + 3);
      events.push({
        id: now,
        title: `Technical Assessment for ${opportunity.company}`,
        date: assessmentDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        type: "assessment",
        opportunityId: opportunity.id,
      });
      break;
    case "First Interview":
    case "Second Interview":
    case "Final Interview":
      // Add an interview event
      const interviewDate = new Date(dateObj);
      interviewDate.setDate(interviewDate.getDate() + 5);
      events.push({
        id: now + 1,
        title: `${opportunity.status} with ${opportunity.company}`,
        date: interviewDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        type: "interview",
        opportunityId: opportunity.id,
      });
      break;
    case "Applied":
    case "Following Up":
      // Add a follow-up reminder
      const followupDate = new Date(dateObj);
      followupDate.setDate(followupDate.getDate() + 7);
      events.push({
        id: now + 2,
        title: `Follow up with ${opportunity.company}`,
        date: followupDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        type: "followup",
        opportunityId: opportunity.id,
      });
      break;
    case "Offer Received":
      // Add a deadline to respond to offer
      const decisionDate = new Date(dateObj);
      decisionDate.setDate(decisionDate.getDate() + 7);
      events.push({
        id: now + 3,
        title: `Deadline to respond to ${opportunity.company} offer`,
        date: decisionDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        type: "deadline",
        opportunityId: opportunity.id,
      });
      break;
  }
  return events;
};

// Helper function to add an opportunity to events
function addOpportunityToEvents(
  events: CalendarEvent[],
  opportunity: Opportunity
): CalendarEvent[] {
  // Generate events for the opportunity
  const opportunityEvents = generateEventsFromOpportunity(opportunity);
  // Combine with existing events
  return [...events, ...opportunityEvents];
}

// Helper function to ensure IDs are always numbers
function ensureNumericId(id: number | string): number {
  return typeof id === "string" ? parseInt(id, 10) : id;
}

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "LOAD_DATA":
      console.log("Loading data from Supabase:", action.payload);
      return {
        ...state,
        opportunities: action.payload.opportunities || [],
        events: action.payload.events || [],
        masterResume: action.payload.masterResume || state.masterResume,
        userProfile: action.payload.userProfile || state.userProfile,
        chatMessages:
          (action.payload.chatMessages as AppState["chatMessages"]) ||
          state.chatMessages,
      };

    case "ADD_OPPORTUNITY": {
      console.log("Adding opportunity to state:", action.payload);
      const newOpportunity = action.payload;
      // Generate events based on the new opportunity
      const newEvents = generateEventsFromOpportunity(newOpportunity);
      // Ensure the ID is unique
      const existingIds = state.opportunities.map((opp) => opp.id);
      if (existingIds.includes(newOpportunity.id)) {
        // If ID already exists, generate a new unique ID
        newOpportunity.id = Date.now();
      }
      return {
        ...state,
        opportunities: [...state.opportunities, newOpportunity],
        events: [...state.events, ...newEvents],
      };
    }

    case "SET_OPPORTUNITIES": {
      // Complete replacement of the opportunities array
      return {
        ...state,
        opportunities: action.payload,
      };
    }

    case "UPDATE_OPPORTUNITY": {
      console.log(
        "Updating opportunity:",
        action.payload.id,
        action.payload.updates
      );
      const { id, updates } = action.payload;
      const numericId = ensureNumericId(id);

      const updatedOpportunities = state.opportunities.map((opp) =>
        opp.id === numericId ? { ...opp, ...updates } : opp
      );
      // If status changed, we might need to update or add events
      let updatedEvents = [...state.events];
      if (updates.status) {
        // Remove existing events for this opportunity
        updatedEvents = updatedEvents.filter(
          (event) => event.opportunityId !== numericId
        );
        // Find the updated opportunity
        const updatedOpp = updatedOpportunities.find(
          (opp) => opp.id === numericId
        );
        if (updatedOpp) {
          // Generate new events based on the updated status
          const newEvents = generateEventsFromOpportunity(updatedOpp);
          updatedEvents = [...updatedEvents, ...newEvents];
        }
      }
      return {
        ...state,
        opportunities: updatedOpportunities,
        events: updatedEvents,
      };
    }

    case "DELETE_OPPORTUNITY": {
      const opportunityId = ensureNumericId(action.payload);
      try {
        // First validate that the opportunity exists
        const opportunityExists = state.opportunities.some(
          (opp) => opp.id === opportunityId
        );
        if (!opportunityExists) {
          console.warn(
            `Attempted to delete non-existent opportunity with ID: ${opportunityId}`
          );
          return state; // No changes if opportunity doesn't exist
        }
        // Filter out the deleted opportunity
        const updatedOpportunities = state.opportunities.filter(
          (opp) => opp.id !== opportunityId
        );
        // Filter out related events
        const updatedEvents = state.events.filter(
          (event) => event.opportunityId !== opportunityId
        );
        // Filter out related chat messages
        const updatedChatMessages = { ...state.chatMessages };
        delete updatedChatMessages[opportunityId];

        return {
          ...state,
          opportunities: updatedOpportunities,
          events: updatedEvents,
          chatMessages: updatedChatMessages,
        };
      } catch (error) {
        console.error("Error in DELETE_OPPORTUNITY reducer:", error);
        return state; // Return unchanged state on error
      }
    }

    case "UPDATE_MASTER_RESUME":
      console.log(
        "Updating master resume in reducer, length:",
        action.payload.length
      );
      return {
        ...state,
        masterResume: action.payload,
      };

    case "ADD_EVENT":
      console.log("Adding event:", action.payload);
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case "SET_EVENTS": {
      // Complete replacement of the events array
      return {
        ...state,
        events: action.payload,
      };
    }

    case "UPDATE_EVENT": {
      const { id, updates } = action.payload;
      const numericId = ensureNumericId(id);

      const updatedEvents = state.events.map((event) => {
        // Compare with the numeric ID
        if (event.id === numericId) {
          return { ...event, ...updates } as CalendarEvent;
        }
        return event;
      });
      return {
        ...state,
        events: updatedEvents,
      };
    }

    case "DELETE_EVENT": {
      console.log("Deleting event with ID:", action.payload);
      const idToDelete = ensureNumericId(action.payload);

      console.log("Filtered events before:", state.events.length);
      // Create a new events array without the deleted event
      const newEvents = state.events.filter((event) => event.id !== idToDelete);
      console.log("Filtered events after:", newEvents.length);
      return {
        ...state,
        events: newEvents,
      };
    }

    case "UPDATE_USER_PROFILE":
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ...action.payload,
        },
      };

    case "ADD_CHAT_MESSAGE": {
      const { opportunityId, message, sender } = action.payload;
      // Convert opportunityId to a number to ensure type compatibility
      const numericId = ensureNumericId(opportunityId);

      const existingMessages = state.chatMessages[numericId] || [];
      const newMessage = {
        id: Date.now(),
        message,
        sender: sender as "user" | "ai", // Ensure we use the correct union type
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [numericId]: [...existingMessages, newMessage],
        },
      };
    }

    default:
      return state;
  }
};
