import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer } from './reducer';
import { AppState, AppAction } from './types';

// Initial state
const initialState: AppState = {
  opportunities: [
    { id: 1, company: "TechCorp", position: "Software Engineer", status: "Interested", appliedDate: "May 15, 2023", jobDescription: "We are seeking a talented Software Engineer to join our innovative team...", resume: "John Doe\n\nExperience:\n- Software Developer at XYZ Corp\n- Intern at ABC Tech\n\nSkills:\n- JavaScript, React, Node.js\n- Python, Django\n- SQL, MongoDB" },
    { id: 2, company: "DataInc", position: "Data Scientist", status: "First Interview", appliedDate: "May 10, 2023", jobDescription: "DataInc is looking for a Data Scientist to help us derive insights from our vast datasets...", resume: "John Doe\n\nExperience:\n- Data Analyst at BigData Co.\n- Research Assistant at University XYZ\n\nSkills:\n- Python, R, SQL\n- Machine Learning, Deep Learning\n- Data Visualization (Tableau, D3.js)" },
    { id: 3, company: "AIStartup", position: "Machine Learning Engineer", status: "Applied", appliedDate: "May 5, 2023", jobDescription: "Join our cutting-edge AI startup as a Machine Learning Engineer and help shape the future of AI...", resume: "John Doe\n\nExperience:\n- AI Researcher at Tech University\n- Machine Learning Intern at AI Solutions Inc.\n\nSkills:\n- Python, T  ensorFlow, PyTorch\n- Natural Language Processing\n- Computer Vision" }
  ],
  masterResume: "John Doe\n\nExperience:\n- Software Developer at XYZ Corp\n- Data Analyst at BigData Co.\n- AI Researcher at Tech University\n\nSkills:\n- JavaScript, React, Node.js\n- Python, R, TensorFlow, PyTorch\n- SQL, MongoDB\n- Machine Learning, Deep Learning\n- Data Visualization",
  events: [
    { id: 1, title: "Interview with TechCorp", date: "May 25, 2023", type: "interview", opportunityId: 1 },
    { id: 2, title: "Follow-up with DataInc", date: "May 27, 2023", type: "followup", opportunityId: 2 },
    { id: 3, title: "Application deadline for AIStartup", date: "June 1, 2023", type: "deadline", opportunityId: 3 },
    { id: 4, title: "Technical assessment for CloudTech", date: "June 5, 2023", type: "assessment" }
  ],
  userProfile: {
    name: "John Doe",
    email: "john.doe@example.com",
    preferences: {
      darkMode: false
    }
  },
  chatMessages: {}
};

// Create the context
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load state from localStorage
  const loadState = (): AppState => {
    if (typeof window === 'undefined') {
      return initialState;
    }
    
    try {
      // Try to load the main state
      const savedState = localStorage.getItem('captainAppState');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Check for duplicate opportunities by ID
        if (Array.isArray(parsedState.opportunities)) {
          console.log(`Loading ${parsedState.opportunities.length} opportunities from localStorage`);
          
          // Deduplicate opportunities before returning
          const opportunityMap = new Map();
          let duplicateCount = 0;
          
          parsedState.opportunities.forEach(opp => {
            if (!opportunityMap.has(opp.id)) {
              opportunityMap.set(opp.id, opp);
            } else {
              duplicateCount++;
            }
          });
          
          if (duplicateCount > 0) {
            console.warn(`Found ${duplicateCount} duplicate opportunities. Automatic deduplication applied.`);
            // Replace with deduplicated opportunities
            parsedState.opportunities = Array.from(opportunityMap.values());
            
            // Store the fixed state back to localStorage
            try {
              localStorage.setItem('captainAppState', JSON.stringify(parsedState));
              console.log('Saved deduplicated state to localStorage');
            } catch (saveError) {
              console.error('Failed to save deduplicated state:', saveError);
            }
          }
          
          const opportunityIds = new Set();
          const duplicatesFound = parsedState.opportunities.some(opp => {
            if (opportunityIds.has(opp.id)) {
              return true; // Duplicate found
            }
            opportunityIds.add(opp.id);
            return false;
          });
          
          // If duplicates found, log warning and return initial state
          if (duplicatesFound) {
            console.error('Duplicate opportunity IDs detected in localStorage. Resetting state.');
            
            // Clear corrupted state
            try {
              localStorage.removeItem('captainAppState');
              localStorage.removeItem('captainAppStateEmergency');
              console.log('Cleared corrupted localStorage data');
            } catch (clearError) {
              console.error('Failed to clear localStorage:', clearError);
            }
            
            return initialState;
          }
        }
        
        // Clean up any undefined or missing state properties
        return {
          opportunities: Array.isArray(parsedState.opportunities) ? parsedState.opportunities : initialState.opportunities,
          masterResume: parsedState.masterResume || initialState.masterResume,
          events: Array.isArray(parsedState.events) ? parsedState.events : initialState.events,
          userProfile: parsedState.userProfile || initialState.userProfile,
          chatMessages: parsedState.chatMessages || initialState.chatMessages
        };
      }
      
      // If main state not found, try emergency backup
      const emergencyState = localStorage.getItem('captainAppStateEmergency');
      if (emergencyState) {
        console.log('Restoring from emergency backup state');
        const parsedEmergency = JSON.parse(emergencyState);
        
        // Merge emergency data with initial state
        return {
          ...initialState,
          opportunities: Array.isArray(parsedEmergency.opportunities) ? parsedEmergency.opportunities : initialState.opportunities,
          userProfile: parsedEmergency.userProfile || initialState.userProfile
        };
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      
      // Clean up corrupted localStorage
      try {
        localStorage.removeItem('captainAppState');
        localStorage.removeItem('captainAppStateEmergency');
      } catch (cleanupError) {
        console.error('Failed to clean up localStorage:', cleanupError);
      }
    }
    
    return initialState;
  };

  const [state, dispatch] = useReducer(appReducer, loadState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // EMERGENCY FIX FOR QUOTA ISSUES
      // Instead of trying to store everything, we'll only store the absolute minimum
      // and discard large content completely
      
      // 1. Create an extremely minimal version of the state
      const criticalDataOnly = {
        // For opportunities, only store core identifying data
        opportunities: state.opportunities.map(opp => ({
          id: opp.id,
          company: opp.company?.substring(0, 50) || '',  // Limit company name length
          position: opp.position?.substring(0, 50) || '', // Limit position length
          status: opp.status || 'Interested',
          appliedDate: opp.appliedDate || new Date().toISOString().split('T')[0],
          // Drop jobDescription, resume, and all other fields completely
        })),
        
        // Drop masterResume completely - user can re-upload it
        // Drop events - they can be regenerated
        // Keep only minimal user profile info
        userProfile: {
          name: state.userProfile?.name?.substring(0, 50) || '',
          email: state.userProfile?.email?.substring(0, 50) || '',
          preferences: {
            darkMode: state.userProfile?.preferences?.darkMode || false
          }
        },
        
        // Drop chat messages completely
      };
      
      // 2. Serialize and check size
      const serializedData = JSON.stringify(criticalDataOnly);
      
      if (serializedData.length > 2 * 1024 * 1024) { // If even this exceeds 2MB
        // Last resort - only keep IDs and names to prevent total data loss
        const absoluteMinimum = {
          opportunities: state.opportunities.map(opp => ({
            id: opp.id,
            company: opp.company?.substring(0, 30) || '',
            position: opp.position?.substring(0, 30) || '',
            status: opp.status || 'Interested'
          })),
          userProfile: {
            name: state.userProfile?.name?.substring(0, 30) || ''
          }
        };
        
        console.warn('Storage quota critical - saving absolute minimum data only');
        
        try {
          // Try to clear any existing data first
          localStorage.removeItem('captainAppState');
          localStorage.removeItem('captainAppStateEmergency');
          
          // Then save the minimal data
          localStorage.setItem('captainAppState', JSON.stringify(absoluteMinimum));
        } catch (severeError) {
          console.error('Failed to save even minimal state. Clearing all localStorage data.');
          // Clear everything as a last resort
          try {
            localStorage.clear();
          } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError);
          }
        }
      } else {
        // Our critical data fits, save it
        try {
          // Try to clear existing data first
          localStorage.removeItem('captainAppState');
          localStorage.removeItem('captainAppStateEmergency');
          
          // Save the minimal state
          localStorage.setItem('captainAppState', serializedData);
          console.log('Saved minimal state successfully - size:', (serializedData.length / 1024).toFixed(2), 'KB');
        } catch (saveError) {
          console.error('Error saving minimal state:', saveError);
          
          // Try an even more minimal approach as last resort
          try {
            const idsOnly = {
              opportunityIds: state.opportunities.map(opp => opp.id)
            };
            localStorage.setItem('captainAppStateEmergency', JSON.stringify(idsOnly));
          } catch (emergencyError) {
            console.error('Failed to save emergency state:', emergencyError);
          }
        }
      }
    } catch (error) {
      console.error('Error in localStorage handling:', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
