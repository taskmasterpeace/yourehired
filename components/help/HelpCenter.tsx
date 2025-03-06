import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from 'lucide-react';
import { allGuides } from './guides';

interface HelpCenterProps {
  onSelectGuide: (guideId: string, sectionId?: string) => void;
  isDarkMode: boolean;
  guides?: any[];
}

export const HelpCenter = ({
  onSelectGuide,
  isDarkMode,
  guides = allGuides
}: HelpCenterProps) => {
  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader>
        <CardTitle>Help Center</CardTitle>
        <CardDescription>Find guides and resources to help you make the most of You're Hired!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map(guide => (
            <Card key={guide.id} className={`overflow-hidden transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-750 border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  {guide.icon && <div className="mr-2">{guide.icon}</div>}
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <CardDescription>{guide.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => onSelectGuide(guide.id)}
                >
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Guide
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
