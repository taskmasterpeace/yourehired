import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { allGuides } from './guides';
import { ChevronLeft } from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";

interface GuideViewerProps {
  guideId: string;
  sectionId?: string;
  onBack: () => void;
  isDarkMode: boolean;
  guides?: any[];
}

export const GuideViewer = ({
  guideId,
  sectionId,
  onBack,
  isDarkMode,
  guides
}: GuideViewerProps) => {
  const [guide, setGuide] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | undefined>(sectionId);
  
  useEffect(() => {
    // Load the guide data
    const guidesSource = guides || allGuides;
    console.log("Available guides:", guidesSource);
    console.log("Looking for guide with ID:", guideId);
    
    const guideData = guidesSource.find(guide => guide.id === guideId);
    console.log("Found guide:", guideData);
    
    if (guideData) {
      setGuide(guideData);
      
      // Set active section
      if (sectionId) {
        setActiveSection(sectionId);
        
        // Scroll to the section after a short delay to ensure rendering
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else if (guideData.sections.length > 0) {
        // Default to the first section if no specific section is provided
        setActiveSection(guideData.sections[0].id);
      }
    }
  }, [guideId, sectionId, guides]);
  
  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  if (!guide) {
    return (
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>Guide Not Found</CardTitle>
          <CardDescription>The requested guide could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{guide.title}</CardTitle>
        </div>
        <CardDescription>{guide.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className={`w-full md:w-64 p-4 border-b md:border-b-0 md:border-r ${isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-medium mb-3">Contents</h3>
            <ul className="space-y-1">
              {guide.sections.map((section: any) => (
                <li key={section.id}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`w-full justify-start text-left ${activeSection === section.id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
                    onClick={() => navigateToSection(section.id)}
                  >
                    {section.title}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-grow">
            <ScrollArea className="h-[500px] md:h-[600px]">
              <div className="p-6">
                {guide.sections.map((section: any) => (
                  <div 
                    key={section.id} 
                    id={section.id} 
                    className={`mb-8 pb-6 ${section.id !== guide.sections[guide.sections.length - 1].id ? `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                  >
                    <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{section.title}</h2>
                    <div 
                      className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}
                      dangerouslySetInnerHTML={{ __html: section.content }} 
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
