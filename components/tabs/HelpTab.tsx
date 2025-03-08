import React from 'react';
import { HelpCenter } from "../help/HelpCenter";
import { GuideViewer } from "../help/GuideViewer";

interface HelpTabProps {
  helpView: { active: boolean; guideId?: string; sectionId?: string };
  setHelpView: (view: { active: boolean; guideId?: string; sectionId?: string }) => void;
  isDarkMode: boolean;
  guides?: any[];
}

export function HelpTab({
  helpView,
  setHelpView,
  isDarkMode,
  guides
}: HelpTabProps) {
  return (
    <div>
      {helpView.active && helpView.guideId ? (
        <GuideViewer
          guideId={helpView.guideId}
          sectionId={helpView.sectionId}
          onBack={() => setHelpView({ active: true, guideId: undefined })}
          isDarkMode={isDarkMode}
          guides={guides}
        />
      ) : (
        <HelpCenter
          onSelectGuide={(guideId, sectionId) => setHelpView({ active: true, guideId, sectionId })}
          isDarkMode={isDarkMode}
          guides={guides}
        />
      )}
    </div>
  );
}
