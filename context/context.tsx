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
      const savedState = localStorage.getItem('captainAppState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
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
      localStorage.setItem('captainAppState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
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
