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
  const [lastOpportunityId, setLastOpportunityId] = useState<
    string | number | null
  >(null);
  const applicationService = new ApplicationService();

  // Convert from Supabase JobApplication to your Opportunity format
  const convertToOpportunity = (app: JobApplication) => {
    console.log("Converting JobApplication to Opportunity:", app.id);
    return {
      id: app.id,
      company: app.companyName,
      position: app.positionTitle,
      status: app.status,
      appliedDate: app.dateApplied || app.dateAdded.split("T")[0],
      jobDescription: app.jobDescription || "",
      resume: app.notes || "",
      notes: app.notes || "",
      location: app.location || "",
      applicationUrl: app.url || "",
      salary: app.salary || "",
      recruiterName: app.contactName || "",
      recruiterEmail: app.contactEmail || "",
      recruiterPhone: app.contactPhone || "",
      tags: app.tags || [],
    };
  };

  // Convert from your Opportunity format to Supabase JobApplication
  const convertToJobApplication = (opp: any): JobApplication => {
    console.log("Converting Opportunity to JobApplication:", opp.id);

    return {
      id: opp.id?.toString(),
      companyName: opp.company,
      positionTitle: opp.position,
      status: opp.status as ApplicationStatus,
      dateAdded: new Date().toISOString(),
      dateApplied: opp.appliedDate,
      jobDescription: opp.jobDescription || "",
      notes: opp.notes || opp.resume || "",
      location: opp.location || "",
      salary: opp.salary || "",
      contactName: opp.recruiterName || "",
      contactEmail: opp.recruiterEmail || "",
      contactPhone: opp.recruiterPhone || "",
      url: opp.applicationUrl || "",
      tags: opp.tags || [],
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

  // Monitor opportunities for changes
  useEffect(() => {
    // Skip if still loading
    if (loading) return;

    // Only execute if we have opportunities
    if (state.opportunities.length === 0) return;

    // Find the latest opportunity (the one at the highest index)
    const latestOpportunity =
      state.opportunities[state.opportunities.length - 1];

    // Check if this is a new opportunity we haven't processed yet
    if (latestOpportunity.id !== lastOpportunityId) {
      console.log("New opportunity detected:", latestOpportunity.id);

      // Save this opportunity to Supabase
      const saveOpportunity = async () => {
        try {
          console.log(
            "Converting and saving opportunity to Supabase:",
            latestOpportunity.id
          );
          const jobApp = convertToJobApplication(latestOpportunity);

          // Attempt to save
          const result = await applicationService.saveApplication(jobApp);

          if (result) {
            console.log(
              "Successfully saved opportunity to Supabase:",
              latestOpportunity.id
            );
            // Update the last seen opportunity ID
            setLastOpportunityId(latestOpportunity.id);
          } else {
            console.error(
              "Failed to save opportunity to Supabase:",
              latestOpportunity.id
            );
          }
        } catch (error) {
          console.error("Error saving opportunity to Supabase:", error);
        }
      };

      saveOpportunity();
    }
  }, [state.opportunities, loading, lastOpportunityId]);

  // Monitor opportunity updates
  useEffect(() => {
    // Check for updates to existing opportunities
    const checkForUpdates = async () => {
      // Logic for tracking and saving updates would go here
      // For now, we're focusing on new opportunities
    };

    if (!loading) {
      checkForUpdates();
    }
  }, [state.opportunities, loading]);

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
