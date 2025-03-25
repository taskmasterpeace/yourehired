import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { appReducer } from "./reducer";
import { AppState, AppAction } from "./types";
import { ApplicationService } from "@/lib/application-service";
import { JobApplication, ApplicationStatus } from "@/types/index";

// Initial state
const initialState: AppState = {
  opportunities: [],
  masterResume:
    "John Doe\n\nExperience:\n- Software Developer at XYZ Corp\n- Data Analyst at BigData Co.\n- AI Researcher at Tech University\n\nSkills:\n- JavaScript, React, Node.js\n- Python, R, TensorFlow, PyTorch\n- SQL, MongoDB\n- Machine Learning, Deep Learning\n- Data Visualization",
  events: [],
  userProfile: {
    name: "John Doe",
    email: "john.doe@example.com",
    preferences: {
      darkMode: false,
    },
  },
  chatMessages: {},
};

// Create the context
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loading, setLoading] = useState(true);
  const applicationService = new ApplicationService();

  // Convert from Supabase JobApplication to your Opportunity format
  const convertToOpportunity = (app: JobApplication) => {
    return {
      id: app.id,
      company: app.companyName,
      position: app.positionTitle,
      status: app.status,
      appliedDate: app.dateApplied || app.dateAdded.split("T")[0],
      jobDescription: app.jobDescription || "",
      resume: app.notes || "",
      // Add any other fields needed for your opportunity model
    };
  };

  // Convert from your Opportunity format to Supabase JobApplication
  const convertToJobApplication = (opp: any): JobApplication => {
    return {
      id: opp.id?.toString(),
      companyName: opp.company,
      positionTitle: opp.position,
      status: opp.status as ApplicationStatus,
      dateAdded: new Date().toISOString(),
      dateApplied: opp.appliedDate,
      jobDescription: opp.jobDescription || "",
      notes: opp.resume || "",
      location: "",
      tags: [],
      statusHistory: [],
      events: [],
    };
  };

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Loading data from Supabase...");

        // Fetch applications from Supabase
        const applications = await applicationService.getApplications();
        console.log(`Loaded ${applications.length} applications from Supabase`);

        // Transform the applications to match our opportunity structure
        const opportunities = applications.map(convertToOpportunity);

        // Collect all events from applications
        const allEvents = applications.flatMap(
          (app) =>
            app.events?.map((event) => ({
              id: event.id,
              title: event.title,
              date: event.date,
              type: event.type || "general",
              opportunityId: app.id,
            })) || []
        );

        // Dispatch data to update state
        dispatch({
          type: "LOAD_DATA",
          payload: {
            opportunities,
            events: allEvents,
            // Keep other state values
            masterResume: state.masterResume,
            userProfile: state.userProfile,
            chatMessages: state.chatMessages,
          },
        });
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
        // If there's an error, we could fallback to initial data
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle saving opportunities to Supabase
  const saveOpportunityToSupabase = async (opportunity: any) => {
    try {
      if (!opportunity || !opportunity.id) return;

      // Convert to JobApplication format
      const application = convertToJobApplication(opportunity);

      // Save to Supabase
      await applicationService.saveApplication(application);
      console.log(`Saved opportunity ${opportunity.id} to Supabase`);
    } catch (error) {
      console.error("Error saving data to Supabase:", error);
    }
  };

  // Listen for changes to opportunities and save them
  useEffect(() => {
    // Skip saving if we're still loading initial data
    if (loading || state.opportunities.length === 0) return;

    // In a real app, you'd implement a more sophisticated change tracking system
    // For simplicity, we'll just look at the latest opportunity
    const latestOpportunity =
      state.opportunities[state.opportunities.length - 1];
    saveOpportunityToSupabase(latestOpportunity);

    // To properly implement change tracking, you'd need to:
    // 1. Keep track of which opportunities have changed
    // 2. Only save those that have changed
    // 3. Handle deletions separately
  }, [state.opportunities, loading]);

  // Handle saving events to Supabase
  useEffect(() => {
    // Skip if loading or no events
    if (loading || state.events.length === 0) return;

    // This is a simple implementation that would need to be expanded
    // to properly track which events are new/modified
    const saveEvents = async () => {
      try {
        // For simplicity, just take the last event and assume it's new/changed
        const latestEvent = state.events[state.events.length - 1];
        if (latestEvent && latestEvent.opportunityId) {
          await applicationService.addEvent(latestEvent.opportunityId, {
            id: latestEvent.id,
            title: latestEvent.title,
            date: latestEvent.date,
            type: latestEvent.type,
            notes: "",
            isCompleted: false,
          });
          console.log(`Saved event ${latestEvent.id} to Supabase`);
        }
      } catch (error) {
        console.error("Error saving event to Supabase:", error);
      }
    };

    saveEvents();
  }, [state.events, loading]);

  return (
    <AppContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
};
