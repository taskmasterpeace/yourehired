import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from '@/context/types';
import { Edit, X, Plus, Pencil, Save, FileDown, HelpCircle, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  openGuide?: (guideId: string, sectionId?: string) => void;
}

export const TagsSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
  openGuide
}: TagsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [tags, setTags] = useState<Tag[]>(opportunity.tags || []);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editedTagText, setEditedTagText] = useState('');
  const [editedTagColor, setEditedTagColor] = useState('');
  const [showHelpDialog, setShowHelpDialog] = useState<boolean | string>(false);
  const [recentlyUsedTags, setRecentlyUsedTags] = useState<Tag[]>([]);

  // Load recently used tags from localStorage
  useEffect(() => {
    try {
      const savedTags = localStorage.getItem('recentlyUsedTags');
      if (savedTags) {
        setRecentlyUsedTags(JSON.parse(savedTags));
      }
    } catch (error) {
      console.error('Error loading recently used tags:', error);
    }
  }, []);

  // Update tags when opportunity changes
  useEffect(() => {
    setTags(opportunity.tags || []);
  }, [opportunity.id, opportunity.tags]);

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
    
    // Add to recently used tags
    updateRecentlyUsedTags(newTag);
  };

  const updateRecentlyUsedTags = (tag: Tag) => {
    // Add to recently used tags, avoiding duplicates and keeping only the last 10
    const updatedRecentTags = [
      tag,
      ...recentlyUsedTags.filter(t => t.text !== tag.text)
    ].slice(0, 10);
    
    setRecentlyUsedTags(updatedRecentTags);
    
    // Save to localStorage
    try {
      localStorage.setItem('recentlyUsedTags', JSON.stringify(updatedRecentTags));
    } catch (error) {
      console.error('Error saving recently used tags:', error);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (window.confirm('Are you sure you want to remove this tag?')) {
      const updatedTags = tags.filter((_, index) => index !== indexToRemove);
      setTags(updatedTags);
      
      // Update the opportunity with the filtered tags
      updateOpportunity(opportunity.id, { tags: updatedTags });
    }
  };

  const handleEditTag = (index: number) => {
    setEditingTagIndex(index);
    setEditedTagText(tags[index].text);
    setEditedTagColor(tags[index].color);
  };

  const handleSaveTagEdit = () => {
    if (editingTagIndex === null || editedTagText.trim() === '') return;
    
    const updatedTags = [...tags];
    updatedTags[editingTagIndex] = {
      text: editedTagText.trim(),
      color: editedTagColor
    };
    
    setTags(updatedTags);
    setEditingTagIndex(null);
    
    // Update the opportunity with the edited tags
    updateOpportunity(opportunity.id, { tags: updatedTags });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTagText('');
    } else if (e.altKey && e.key === 't') {
      // Alt+T shortcut to focus the tag input
      e.preventDefault();
      document.getElementById('new-tag-input')?.focus();
    }
  };

  const handleUseRecentTag = (tag: Tag) => {
    // Check if tag already exists
    if (!tags.some(t => t.text === tag.text)) {
      const updatedTags = [...tags, tag];
      setTags(updatedTags);
      updateOpportunity(opportunity.id, { tags: updatedTags });
      updateRecentlyUsedTags(tag);
    }
  };

  const exportTags = () => {
    if (tags.length === 0) {
      alert('No tags to export');
      return;
    }
    
    // Format tags for export
    const tagsText = tags.map(tag => `${tag.text} (${tag.color})`).join('\n');
    const exportData = `Tags for ${opportunity.company} - ${opportunity.position}\n\n${tagsText}`;
    
    // Create a blob and download
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tags-${opportunity.company.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' :  'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tags</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-1 h-6 w-6 p-0"
                  onClick={() => setShowHelpDialog("tags-feature")}
                >
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Learn how to use tags</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportTags}
            disabled={tags.length === 0}
            title="Export tags"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <div 
                key={index} 
                className={`flex items-center px-3 py-1 rounded-full ${TAG_COLOR_CLASSES[tag.color].bg} ${TAG_COLOR_CLASSES[tag.color].text} ${TAG_COLOR_CLASSES[tag.color].border}`}
              >
                {editingTagIndex === index ? (
                  <>
                    <Input
                      value={editedTagText}
                      onChange={(e) => setEditedTagText(e.target.value)}
                      className="h-6 w-24 mr-1 p-1"
                      autoFocus
                    />
                    <Select value={editedTagColor} onValueChange={setEditedTagColor}>
                      <SelectTrigger className="h-6 w-16 p-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_COLORS.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center">
                              <div className={`h-3 w-3 rounded-full mr-2 ${TAG_COLOR_CLASSES[color].bg}`}></div>
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 ml-1" 
                      onClick={handleSaveTagEdit}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{tag.text}</span>
                    <div className="flex ml-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0" 
                        onClick={() => handleEditTag(index)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0" 
                        onClick={() => handleRemoveTag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              id="new-tag-input"
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              placeholder="Add a tag... (Alt+T)"
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
          
          {recentlyUsedTags.length > 0 && (
            <div className="mt-3">
              <Label className="text-xs mb-1 block">Recently used tags:</Label>
              <div className="flex flex-wrap gap-1">
                {recentlyUsedTags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    className={`${TAG_COLOR_CLASSES[tag.color].bg} ${TAG_COLOR_CLASSES[tag.color].text} ${TAG_COLOR_CLASSES[tag.color].border} ${TAG_COLOR_CLASSES[tag.color].hover} border cursor-pointer`}
                    onClick={() => handleUseRecentTag(tag)}
                  >
                    {tag.text}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-500 hover:text-red-700"
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all tags?')) {
                  setTags([]);
                  updateOpportunity(opportunity.id, { tags: [] });
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All Tags
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
      
      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Using Tags</DialogTitle>
            <DialogDescription>
              Tags are customizable labels that help you organize your job opportunities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <h4 className="font-medium mb-1">Understanding Tags</h4>
              <p className="text-sm text-gray-500">
                Unlike the fixed "Status" field, tags are completely customizable and you can apply multiple tags to a single opportunity.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Creating Tags</h4>
              <p className="text-sm text-gray-500">
                Click "Edit", type a tag name, select a color, and click "Add". Use colors consistently (e.g., green for positive attributes).
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Managing Tags</h4>
              <p className="text-sm text-gray-500">
                Edit or remove tags by clicking the respective icons. You can also use recently used tags for quick access.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Best Practices</h4>
              <ul className="text-sm text-gray-500 list-disc pl-5">
                <li>Use consistent naming conventions</li>
                <li>Create specific tags rather than vague ones</li>
                <li>Color-code by category (location, priority, etc.)</li>
                <li>Use Alt+T keyboard shortcut to quickly add tags</li>
                <li>Regularly review and clean up unused tags</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Example Tag Categories</h4>
              <ul className="text-sm text-gray-500 list-disc pl-5">
                <li>Industry: "Finance," "Healthcare," "Tech"</li>
                <li>Role type: "Remote," "Hybrid," "On-site"</li>
                <li>Application effort: "Quick Apply," "Custom Resume"</li>
                <li>Personal interest: "High Priority," "Dream Company"</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            {openGuide && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowHelpDialog(false);
                  openGuide('tags-keywords', 'tags-feature');
                }}
              >
                View Full Guide
              </Button>
            )}
            <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
