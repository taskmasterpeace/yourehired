import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from '@/context/types';
import { Edit, X, Plus } from 'lucide-react';

// Configuration for tag colors
const TAG_COLOR_CLASSES = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    hover: "hover:bg-blue-200"
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-200"
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-200"
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
    hover: "hover:bg-purple-200"
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-200"
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-200"
  }
};

// Available tag colors for selection
const TAG_COLORS = ['blue', 'green', 'purple', 'red', 'yellow', 'gray'];

interface Tag {
  text: string;
  color: string;
}

interface TagsSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
}

export const TagsSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode
}: TagsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [tags, setTags] = useState<Tag[]>(opportunity.tags || []);

  const handleAddTag = () => {
    if (newTagText.trim() === '') return;
    
    const newTag: Tag = {
      text: newTagText.trim(),
      color: newTagColor
    };
    
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    setNewTagText('');
    
    // Update the opportunity with the new tags
    updateOpportunity(opportunity.id, { tags: updatedTags });
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    
    // Update the opportunity with the filtered tags
    updateOpportunity(opportunity.id, { tags: updatedTags });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tags</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-4 w-4 mr-1" />
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <div 
                key={index} 
                className={`flex items-center px-3 py-1 rounded-full ${TAG_COLOR_CLASSES[tag.color].bg} ${TAG_COLOR_CLASSES[tag.color].text} ${TAG_COLOR_CLASSES[tag.color].border}`}
              >
                <span>{tag.text}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 ml-1" 
                  onClick={() => handleRemoveTag(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              placeholder="Add a tag..."
              className="flex-grow"
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex space-x-1">
              {TAG_COLORS.map(color => (
                <Button
                  key={color}
                  type="button"
                  variant="outline"
                  className={`h-9 w-9 p-0 rounded-full ${TAG_COLOR_CLASSES[color].bg} ${TAG_COLOR_CLASSES[color].border} ${newTagColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  onClick={() => setNewTagColor(color)}
                  title={`${color.charAt(0).toUpperCase() + color.slice(1)} tag`}
                />
              ))}
            </div>
            
            <Button onClick={handleAddTag}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <Badge 
                key={index} 
                className={`${TAG_COLOR_CLASSES[tag.color].bg} ${TAG_COLOR_CLASSES[tag.color].text} ${TAG_COLOR_CLASSES[tag.color].border} ${TAG_COLOR_CLASSES[tag.color].hover} border`}
              >
                {tag.text}
              </Badge>
            ))
          ) : (
            <p className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No tags added yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};
