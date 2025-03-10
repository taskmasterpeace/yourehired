import React, { useState, useEffect } from 'react';
import { Toast, ToastProvider, ToastViewport } from "../ui/toast";
import { Award, ArrowUp, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface LevelUpNotificationProps {
  levelUp: {
    newLevel: number;
    previousLevel: number;
  } | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export function LevelUpNotification({
  levelUp,
  onClose,
  isDarkMode
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (levelUp) {
      setIsVisible(true);
      
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow animation to complete
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [levelUp, onClose]);
  
  if (!levelUp) return null;

  return (
    <ToastProvider>
      <Toast
        open={isVisible}
        onOpenChange={(open) => {
          if (!open) {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }
        }}
        className={cn(
          'fixed bottom-4 right-4 p-0 w-80 md:w-96 shadow-lg border rounded-lg overflow-hidden transition-all duration-300',
          isDarkMode ? 'bg-blue-900/90 border-blue-700' : 'bg-blue-100 border-blue-200',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        )}
      >
        <div className="relative p-4">
          <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-3 rounded-full',
              isDarkMode ? 'bg-blue-800' : 'bg-blue-200'
            )}>
              <ArrowUp className={cn(
                'h-6 w-6',
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              )} />
            </div>
            
            <div>
              <h3 className={cn(
                'font-medium',
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              )}>
                Level Up!
              </h3>
              <p className="font-medium text-lg">
                You've reached Level {levelUp.newLevel}
              </p>
              <p className="text-sm text-muted-foreground">
                New features and benefits unlocked
              </p>
            </div>
          </div>
          
          <div className="mt-3 p-3 rounded-lg bg-black/10">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4" />
              <span className="font-medium text-sm">New Benefits</span>
            </div>
            <ul className="text-xs space-y-1 ml-6 list-disc">
              <li>Weekly progress reports</li>
              <li>Enhanced analytics dashboard</li>
              <li>New achievement categories</li>
            </ul>
          </div>
        </div>
        
        {/* Progress bar animation */}
        <div className="h-1 w-full bg-black/10">
          <div 
            className="h-1 bg-white/30"
            style={{
              width: '100%',
              animation: 'shrink 6s linear forwards'
            }}
          ></div>
        </div>
        
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </Toast>
      
      <ToastViewport />
    </ToastProvider>
  );
}
