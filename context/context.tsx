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
import { Tag } from "./types"; // Make sure to import Tag type

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

// Helper function to determine tag color
function getTagColor(tagName: string): string {
  // You can customize this function to match your color scheme
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3FF33",
    "#FF33F3",
    "#33FFF3",
    "#33CCFF",
    "#FF9933",
  ];
  // Create a simple hash from the tag name for consistent coloring
  const hash = tagName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Helper function to safely parse an ID to number
function safeParseInt(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  try {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

// Helper function to ensure event type is one of the allowed values
function validateEventType(
  type: string
): "interview" | "deadline" | "followup" | "assessment" {
  const validTypes = ["interview", "deadline", "followup", "assessment"];
  return validTypes.includes(type)
    ? (type as "interview" | "deadline" | "followup" | "assessment")
    : "interview"; // Default to "interview" if invalid
}

// Create a provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [savingOpportunities, setSavingOpportunities] = useState<
    Record<string | number, boolean>
  >({});
  const applicationService = new ApplicationService();

  // Convert from Supabase JobApplication to your Opportunity format
  const convertToOpportunity = (app: JobApplication) => {
    console.log("Converting JobApplication to Opportunity:", app.id);
    return {
      id: app.id, // Keep as string ID from Supabase
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
      // Convert string tags to Tag objects with required properties
      tags: (app.tags || []).map((tagName, index) => ({
        id: index,
        name: tagName,
        color: getTagColor(tagName),
      })),
    };
  };

  // Convert from your Opportunity format to Supabase JobApplication
  const convertToJobApplication = (opp: any): JobApplication => {
    console.log("Converting Opportunity to JobApplication:", opp.id);
    // Check if the ID is a Supabase ID (string with dashes) or a numeric ID
    const isSupabaseId = typeof opp.id === "string" && opp.id.includes("-");
    return {
      id: isSupabaseId ? opp.id : undefined, // Only include ID if it's a Supabase ID
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
      // Extract tag names from Tag objects for storage in Supabase
      tags: opp.tags ? opp.tags.map((tag: Tag) => tag.name) : [],
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

        // Collect all events from applications and convert types as needed
        const allEvents = applications.flatMap(
          (app) =>
            app.events?.map((event) => ({
              id: safeParseInt(event.id),
              title: event.title,
              date: event.date,
              // Validate and convert event type to one of the allowed values
              type: validateEventType(event.type || "interview"),
              opportunityId: app.id, // Keep as string to match app.id
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

  // Monitor opportunities for changes and save to Supabase
  useEffect(() => {
    // Skip if still loading initial data
    if (loading) {
      console.log("Skipping save operation - still loading initial data");
      return;
    }

    // Find opportunities that need to be saved
    // These will typically be ones with numeric IDs (not Supabase UUIDs)
    const unsavedOpportunities = state.opportunities.filter((opp) => {
      // Check if it has a numeric ID (local) and not already being saved
      const isNumericId =
        typeof opp.id === "number" ||
        (typeof opp.id === "string" && !opp.id.includes("-"));
      const isNotBeingSaved = !savingOpportunities[opp.id];
      return isNumericId && isNotBeingSaved;
    });

    console.log(`Found ${unsavedOpportunities.length} unsaved opportunities`);

    // If we have unsaved opportunities, save them one by one
    if (unsavedOpportunities.length > 0) {
      // Create a batch function to save them
      const saveOpportunities = async () => {
        for (const opportunity of unsavedOpportunities) {
          try {
            // Mark this opportunity as being saved to prevent duplicate saves
            setSavingOpportunities((prev) => ({
              ...prev,
              [opportunity.id]: true,
            }));
            console.log(
              "SAVING OPPORTUNITY TO SUPABASE:",
              opportunity.id,
              opportunity
            );
            const jobApp = convertToJobApplication(opportunity);
            console.log("Converted to JobApplication:", jobApp);

            // Attempt to save to Supabase
            const result = await applicationService.saveApplication(jobApp);
            console.log("Save result:", result);

            // Check if result is an object with an id property
            if (result && typeof result === "object" && "id" in result) {
              console.log("New Supabase ID:", result.id);

              // Update the opportunity in our state with the Supabase ID
              dispatch({
                type: "UPDATE_OPPORTUNITY",
                payload: {
                  id: opportunity.id,
                  updates: { id: result.id },
                },
              });
              console.log("Updated opportunity with Supabase ID");
            } else {
              console.log("Save successful but no ID returned");
            }
          } catch (error) {
            console.error("Error saving opportunity to Supabase:", error);
          } finally {
            // Mark as no longer being saved, regardless of outcome
            setSavingOpportunities((prev) => {
              const newState = { ...prev };
              delete newState[opportunity.id];
              return newState;
            });
          }
        }
      };

      // Execute the save operation
      saveOpportunities();
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
