import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Award, Trophy, Zap, Star, ArrowRight, Check } from "lucide-react";

interface GamificationIntroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  isDarkMode: boolean;
}

export function GamificationIntro({
  open,
  onOpenChange,
  onComplete,
  isDarkMode
}: GamificationIntroProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };
  
  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-gray-800 text-gray-100' : ''}`}>
        <DialogHeader>
          <DialogTitle>Welcome to Job Search Achievements!</DialogTitle>
          <DialogDescription>
            Let's explore how achievements can boost your job search motivation
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                  <Trophy className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Earn Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete job search activities to unlock achievements and earn points
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium text-sm">Milestones</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track your progress through key job search milestones
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium text-sm">Consistency</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Build and maintain consistent job search habits
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4" />
                    <span className="font-medium text-sm">Quality</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Improve the quality of your applications and responses
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4" />
                    <span className="font-medium text-sm">Mastery</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Become a job search expert with advanced techniques
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                  <Award className={`h-6 w-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Level Up Your Job Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn points to level up and unlock new features
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'}`}>
                    1
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-600">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      30 / 100 points to Level 2
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Achievement Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-sm">Weekly Reports (Level 2)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-sm">Advanced Analytics (Level 3)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-amber-900' : 'bg-amber-100'}`}>
                  <Star className={`h-6 w-6 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Track Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your job search journey with detailed analytics
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className="text-sm font-medium mb-3">Achievement Progress</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>First 5 Applications</span>
                      <span>3/5</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Weekend Warrior</span>
                      <span>1/2</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Profile Pioneer</span>
                      <span>0/1</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600">
                      <div className="h-1.5 rounded-full bg-gray-400" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <Zap className={`h-6 w-6 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Ready to Begin!</h3>
                  <p className="text-sm text-muted-foreground">
                    Start earning achievements and leveling up your job search
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border text-center ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <Award className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                <h4 className="font-medium mb-1">Your First Achievement Awaits!</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete your first application to unlock the "First Steps" achievement
                </p>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">
                    Start Applying
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-6 rounded-full ${
                  i + 1 === step 
                    ? 'bg-blue-500' 
                    : i + 1 < step 
                      ? 'bg-gray-400' 
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
          
          <div className="flex gap-2">
            {step < totalSteps ? (
              <>
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={handleNext}>
                  Next
                </Button>
              </>
            ) : (
              <Button onClick={handleNext}>
                Get Started
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
