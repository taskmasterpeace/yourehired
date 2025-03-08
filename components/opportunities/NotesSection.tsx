import React, { useState } from 'react';
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Opportunity } from '../../context/types';
import { Edit } from 'lucide-react';

interface NotesSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
}

export const NotesSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode
}: NotesSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(opportunity.notes || '');

  return (
    <div className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notes</h3>
        {!isEditing ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setEditedNotes(opportunity.notes || "");
              setIsEditing(true);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => {
                updateOpportunity(opportunity.id, { notes: editedNotes });
                setIsEditing(false);
              }}
            >
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
          placeholder="Add notes about this opportunity..."
          rows={5}
        />
      ) : (
        <div>
          {opportunity.notes ? (
            <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {opportunity.notes}
            </p>
          ) : (
            <p className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No notes added yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};
