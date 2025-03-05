import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Opportunity } from '@/context/types';
import { 
  RefreshCw, 
  Check, 
  X, 
  Plus, 
  Star, 
  FileText, 
  HelpCircle, 
  Trash2, 
  FileDown,
  Pencil,
  Save,
  Sparkles
} from 'lucide-react';
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
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Keyword {
  text: string;
  relevance: number; // 1-5 scale
  inResume: boolean;
}

interface KeywordsSectionProps {
  opportunity: Opportunity;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => void;
  isDarkMode: boolean;
  openGuide?: (guideId: string, sectionId?: string) => void;
}

export const KeywordsSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
  openGuide
}: KeywordsSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showAddKeywordDialog, setShowAddKeywordDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState({ text: '', relevance: 3 });
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  const [editedKeyword, setEditedKeyword] = useState({ text: '', relevance: 3 });
  const [showHelpDialog, setShowHelpDialog] = useState<boolean | string>(false);
  const [highlightInResume, setHighlightInResume] = useState(false);
  const [keywordMatchPercentage, setKeywordMatchPercentage] = useState(0);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  // Initialize keywords from opportunity data
  useEffect(() => {
    if (opportunity.keywords) {
      // Convert string[] to Keyword[] if needed
      if (typeof opportunity.keywords[0] === 'string') {
        const convertedKeywords = (opportunity.keywords as string[]).map(k => ({
          text: k,
          relevance: Math.floor(Math.random() * 5) + 1, // Random relevance 1-5 for demo
          inResume: checkIfInResume(k)
        }));
        setKeywords(convertedKeywords);
      } else {
        setKeywords(opportunity.keywords as unknown as Keyword[]);
      }
    }
    
    if (opportunity.selectedKeywords) {
      setSelectedKeywords(opportunity.selectedKeywords);
    }
    
    // Calculate keyword match percentage
    calculateKeywordMatchPercentage();
  }, [opportunity.id]);

  // Check if a keyword appears in the resume
  const checkIfInResume = (keyword: string): boolean => {
    if (!opportunity.resume) return false;
    return opportunity.resume.toLowerCase().includes(keyword.toLowerCase());
  };

  // Calculate what percentage of high-relevance keywords are in the resume
  const calculateKeywordMatchPercentage = () => {
    if (!keywords.length) {
      setKeywordMatchPercentage(0);
      return;
    }
    
    // Consider keywords with relevance 4-5 as high relevance
    const highRelevanceKeywords = keywords.filter(k => k.relevance >= 4);
    if (!highRelevanceKeywords.length) {
      setKeywordMatchPercentage(0);
      return;
    }
    
    const matchedKeywords = highRelevanceKeywords.filter(k => k.inResume);
    const percentage = (matchedKeywords.length / highRelevanceKeywords.length) * 100;
    setKeywordMatchPercentage(Math.round(percentage));
  };

  // Simulate extracting keywords from job description
  const extractKeywords = () => {
    setIsLoading(true);
    
    // In a real implementation, this would call an API to extract keywords
    setTimeout(() => {
      // Example keywords that might be extracted from a job description
      const keywordsList = [
        "React", "TypeScript", "JavaScript", "Node.js", "API", 
        "Frontend", "UI/UX", "Responsive Design", "Git", "Agile",
        "Communication", "Problem Solving", "Team Player", "Testing"
      ];
      
      // Create keyword objects with relevance and check if they're in the resume
      const extractedKeywords: Keyword[] = keywordsList
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(text => ({
          text,
          relevance: Math.floor(Math.random() * 5) + 1, // Random relevance 1-5
          inResume: checkIfInResume(text)
        }));
      
      setKeywords(extractedKeywords);
      updateOpportunity(opportunity.id, { keywords: extractedKeywords });
      setIsLoading(false);
      
      // Calculate keyword match percentage
      calculateKeywordMatchPercentage();
      
      // Generate optimization suggestions
      generateOptimizationSuggestions(extractedKeywords);
    }, 1500);
  };

  // Generate suggestions for resume optimization
  const generateOptimizationSuggestions = (keywordList: Keyword[] = keywords) => {
    const missingHighRelevanceKeywords = keywordList
      .filter(k => k.relevance >= 4 && !k.inResume)
      .map(k => k.text);
    
    if (missingHighRelevanceKeywords.length === 0) {
      setOptimizationSuggestions([
        "Great job! Your resume already includes all high-relevance keywords."
      ]);
      return;
    }
    
    const suggestions = [
      `Add these high-relevance keywords to your resume: ${missingHighRelevanceKeywords.join(', ')}`,
      "Consider creating a 'Skills' section that explicitly lists these keywords",
      "Incorporate keywords naturally in your experience descriptions",
      "Use exact phrasing from the job description when possible",
      "Ensure keywords appear in the first third of your resume for better ATS visibility"
    ];
    
    setOptimizationSuggestions(suggestions);
  };

  // Toggle a keyword selection
  const toggleKeywordSelection = (keyword: string) => {
    let updatedSelection;
    
    if (selectedKeywords.includes(keyword)) {
      updatedSelection = selectedKeywords.filter(k => k !== keyword);
    } else {
      updatedSelection = [...selectedKeywords, keyword];
    }
    
    setSelectedKeywords(updatedSelection);
    updateOpportunity(opportunity.id, { selectedKeywords: updatedSelection });
  };

  // Add a new keyword
  const handleAddKeyword = () => {
    if (newKeyword.text.trim() === '') return;
    
    const keywordToAdd: Keyword = {
      text: newKeyword.text.trim(),
      relevance: newKeyword.relevance,
      inResume: checkIfInResume(newKeyword.text.trim())
    };
    
    const updatedKeywords = [...keywords, keywordToAdd];
    setKeywords(updatedKeywords);
    setNewKeyword({ text: '', relevance: 3 });
    setShowAddKeywordDialog(false);
    
    // Update the opportunity
    updateOpportunity(opportunity.id, { keywords: updatedKeywords });
    
    // Recalculate match percentage
    calculateKeywordMatchPercentage();
  };

  // Edit an existing keyword
  const handleEditKeyword = (index: number) => {
    setEditingKeywordIndex(index);
    setEditedKeyword({
      text: keywords[index].text,
      relevance: keywords[index].relevance
    });
  };

  // Save edited keyword
  const handleSaveKeywordEdit = () => {
    if (editingKeywordIndex === null || editedKeyword.text.trim() === '') return;
    
    const updatedKeywords = [...keywords];
    updatedKeywords[editingKeywordIndex] = {
      text: editedKeyword.text.trim(),
      relevance: editedKeyword.relevance,
      inResume: checkIfInResume(editedKeyword.text.trim())
    };
    
    setKeywords(updatedKeywords);
    setEditingKeywordIndex(null);
    
    // Update the opportunity
    updateOpportunity(opportunity.id, { keywords: updatedKeywords });
    
    // Recalculate match percentage
    calculateKeywordMatchPercentage();
  };

  // Remove a keyword
  const handleRemoveKeyword = (index: number) => {
    if (window.confirm('Are you sure you want to remove this keyword?')) {
      const updatedKeywords = keywords.filter((_, i) => i !== index);
      setKeywords(updatedKeywords);
      
      // Update the opportunity
      updateOpportunity(opportunity.id, { keywords: updatedKeywords });
      
      // Recalculate match percentage
      calculateKeywordMatchPercentage();
    }
  };

  // Export keywords to a file
  const exportKeywords = () => {
    if (keywords.length === 0) {
      alert('No keywords to export');
      return;
    }
    
    // Format keywords for export
    const keywordsText = keywords
      .sort((a, b) => b.relevance - a.relevance)
      .map(k => {
        const stars = '★'.repeat(k.relevance) + '☆'.repeat(5 - k.relevance);
        const status = k.inResume ? '[In Resume]' : '[Missing]';
        return `${k.text} ${stars} ${status}`;
      })
      .join('\n');
    
    const exportData = `Keywords for ${opportunity.company} - ${opportunity.position}\n\nKeyword Match: ${keywordMatchPercentage}%\n\n${keywordsText}`;
    
    // Create a blob and download
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${opportunity.company.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render stars for relevance rating
  const renderRelevanceStars = (relevance: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i <= relevance ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  // Extract keywords on first load if none exist
  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      extractKeywords();
    } else {
      // Update inResume status for all keywords
      const updatedKeywords = keywords.map(k => ({
        ...k,
        inResume: checkIfInResume(k.text)
      }));
      setKeywords(updatedKeywords);
      calculateKeywordMatchPercentage();
      generateOptimizationSuggestions(updatedKeywords);
    }
  }, [opportunity.resume]);

  return (
    <div className={`p-4 mb-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Skills & Requirements</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-1 h-6 w-6 p-0"
                  onClick={() => setShowHelpDialog("keywords-feature")}
                >
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Learn how to use keywords</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowOptimizeDialog(true)}
            disabled={keywords.length === 0}
            className="hidden sm:flex"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Optimize Resume
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportKeywords}
            disabled={keywords.length === 0}
            title="Export keywords"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={extractKeywords}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Extract'}
          </Button>
        </div>
      </div>

      {/* Keyword match percentage */}
      {keywords.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm">Keyword Match</Label>
            <span className={`text-sm font-medium ${
              keywordMatchPercentage >= 80 ? 'text-green-500' : 
              keywordMatchPercentage >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {keywordMatchPercentage}%
            </span>
          </div>
          <Progress 
            value={keywordMatchPercentage} 
            className={`h-2 ${
              keywordMatchPercentage >= 80 ? 'bg-green-100' : 
              keywordMatchPercentage >= 60 ? 'bg-yellow-100' : 
              'bg-red-100'
            }`}
            indicatorClassName={
              keywordMatchPercentage >= 80 ? 'bg-green-500' : 
              keywordMatchPercentage >= 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Needs improvement</span>
            <span className="text-xs text-gray-500">Excellent</span>
          </div>
        </div>
      )}

      {/* Highlight in resume toggle */}
      {keywords.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="highlight-keywords"
            checked={highlightInResume}
            onCheckedChange={setHighlightInResume}
          />
          <Label htmlFor="highlight-keywords" className="text-sm cursor-pointer">
            Highlight keywords in resume (Alt+H)
          </Label>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Analyzing job description...
            </p>
          </div>
        </div>
      ) : (
        <>
          {keywords.length > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Keywords by relevance:
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddKeywordDialog(true)}
                    className="h-7 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {/* High relevance keywords (4-5) */}
                  <div>
                    <Label className="text-xs mb-1 block">High Relevance</Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords
                        .filter(k => k.relevance >= 4)
                        .map((keyword, index) => {
                          const keywordIndex = keywords.findIndex(k => k.text === keyword.text);
                          return editingKeywordIndex === keywordIndex ? (
                            <div key={index} className="flex items-center space-x-1 p-1 border rounded">
                              <Input
                                value={editedKeyword.text}
                                onChange={(e) => setEditedKeyword({...editedKeyword, text: e.target.value})}
                                className="h-6 w-24 p-1"
                                autoFocus
                              />
                              <div className="flex items-center">
                                <Label className="text-xs mr-1">Relevance:</Label>
                                <Slider
                                  value={[editedKeyword.relevance]}
                                  min={1}
                                  max={5}
                                  step={1}
                                  className="w-20"
                                  onValueChange={(value) => setEditedKeyword({...editedKeyword, relevance: value[0]})}
                                />
                                {renderRelevanceStars(editedKeyword.relevance)}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0" 
                                onClick={handleSaveKeywordEdit}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge 
                              key={index} 
                              variant="outline"
                              className={`flex items-center gap-1 ${
                                keyword.inResume 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}
                            >
                              <div className="flex items-center">
                                {keyword.text}
                                <span className="ml-1 text-xs">{renderRelevanceStars(keyword.relevance)}</span>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleEditKeyword(keywordIndex)}
                                >
                                  <Pencil className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleRemoveKeyword(keywordIndex)}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </Badge>
                          );
                        })}
                      {keywords.filter(k => k.relevance >= 4).length === 0 && (
                        <p className="text-xs text-gray-500 italic">No high relevance keywords found</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Medium relevance keywords (2-3) */}
                  <div>
                    <Label className="text-xs mb-1 block">Medium Relevance</Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords
                        .filter(k => k.relevance >= 2 && k.relevance <= 3)
                        .map((keyword, index) => {
                          const keywordIndex = keywords.findIndex(k => k.text === keyword.text);
                          return editingKeywordIndex === keywordIndex ? (
                            <div key={index} className="flex items-center space-x-1 p-1 border rounded">
                              <Input
                                value={editedKeyword.text}
                                onChange={(e) => setEditedKeyword({...editedKeyword, text: e.target.value})}
                                className="h-6 w-24 p-1"
                                autoFocus
                              />
                              <div className="flex items-center">
                                <Label className="text-xs mr-1">Relevance:</Label>
                                <Slider
                                  value={[editedKeyword.relevance]}
                                  min={1}
                                  max={5}
                                  step={1}
                                  className="w-20"
                                  onValueChange={(value) => setEditedKeyword({...editedKeyword, relevance: value[0]})}
                                />
                                {renderRelevanceStars(editedKeyword.relevance)}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0" 
                                onClick={handleSaveKeywordEdit}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge 
                              key={index} 
                              variant="outline"
                              className={`flex items-center gap-1 ${
                                keyword.inResume 
                                  ? 'bg-green-50 text-green-700 border-green-100' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center">
                                {keyword.text}
                                <span className="ml-1 text-xs">{renderRelevanceStars(keyword.relevance)}</span>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleEditKeyword(keywordIndex)}
                                >
                                  <Pencil className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleRemoveKeyword(keywordIndex)}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </Badge>
                          );
                        })}
                      {keywords.filter(k => k.relevance >= 2 && k.relevance <= 3).length === 0 && (
                        <p className="text-xs text-gray-500 italic">No medium relevance keywords found</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Low relevance keywords (1) */}
                  <div>
                    <Label className="text-xs mb-1 block">Low Relevance</Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords
                        .filter(k => k.relevance === 1)
                        .map((keyword, index) => {
                          const keywordIndex = keywords.findIndex(k => k.text === keyword.text);
                          return editingKeywordIndex === keywordIndex ? (
                            <div key={index} className="flex items-center space-x-1 p-1 border rounded">
                              <Input
                                value={editedKeyword.text}
                                onChange={(e) => setEditedKeyword({...editedKeyword, text: e.target.value})}
                                className="h-6 w-24 p-1"
                                autoFocus
                              />
                              <div className="flex items-center">
                                <Label className="text-xs mr-1">Relevance:</Label>
                                <Slider
                                  value={[editedKeyword.relevance]}
                                  min={1}
                                  max={5}
                                  step={1}
                                  className="w-20"
                                  onValueChange={(value) => setEditedKeyword({...editedKeyword, relevance: value[0]})}
                                />
                                {renderRelevanceStars(editedKeyword.relevance)}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0" 
                                onClick={handleSaveKeywordEdit}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge 
                              key={index} 
                              variant="outline"
                              className="flex items-center gap-1 bg-gray-50 text-gray-600 border-gray-100"
                            >
                              <div className="flex items-center">
                                {keyword.text}
                                <span className="ml-1 text-xs">{renderRelevanceStars(keyword.relevance)}</span>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleEditKeyword(keywordIndex)}
                                >
                                  <Pencil className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleRemoveKeyword(keywordIndex)}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </Badge>
                          );
                        })}
                      {keywords.filter(k => k.relevance === 1).length === 0 && (
                        <p className="text-xs text-gray-500 italic">No low relevance keywords found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => setShowOptimizeDialog(true)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Optimize Resume
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className={`h-12 w-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No keywords extracted yet
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Click "Extract" to analyze the job description and identify key skills
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddKeywordDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Keywords Manually
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Add Keyword Dialog */}
      <Dialog open={showAddKeywordDialog} onOpenChange={setShowAddKeywordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Keyword</DialogTitle>
            <DialogDescription>
              Add a keyword or skill from the job description
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="keyword-text">Keyword</Label>
              <Input
                id="keyword-text"
                value={newKeyword.text}
                onChange={(e) => setNewKeyword({...newKeyword, text: e.target.value})}
                placeholder="e.g., React, Project Management"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="keyword-relevance">Relevance</Label>
                <span className="text-sm text-gray-500">{newKeyword.relevance}/5</span>
              </div>
              <div className="flex items-center space-x-2">
                <Slider
                  id="keyword-relevance"
                  value={[newKeyword.relevance]}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-grow"
                  onValueChange={(value) => setNewKeyword({...newKeyword, relevance: value[0]})}
                />
                <div className="flex">
                  {renderRelevanceStars(newKeyword.relevance)}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Higher relevance indicates keywords that are more important for this position
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKeywordDialog(false)}>Cancel</Button>
            <Button onClick={handleAddKeyword}>Add Keyword</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Help Dialog */}
      <Dialog open={Boolean(showHelpDialog)} onOpenChange={(open) => setShowHelpDialog(open ? showHelpDialog : false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Using Keywords</DialogTitle>
            <DialogDescription>
              Keywords help you optimize your resume for applicant tracking systems (ATS)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <h4 className="font-medium mb-1">Understanding Keywords</h4>
              <p className="text-sm text-gray-500">
                Keywords are specific terms, skills, and qualifications that employers look for in candidates. Each keyword has:
              </p>
              <ul className="text-sm text-gray-500 list-disc pl-5 mt-1">
                <li>A relevance score (1-5 stars)</li>
                <li>Green highlighting if found in your resume</li>
                <li>Yellow highlighting if missing from your resume</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Automatic Extraction</h4>
              <p className="text-sm text-gray-500">
                CAPTAIN uses AI to automatically identify important terms from job descriptions. You can also add keywords manually.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Optimizing Your Resume</h4>
              <p className="text-sm text-gray-500">
                Focus on adding high-relevance keywords (4-5 stars) to your resume. Use the "Optimize Resume" button for suggestions.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Best Practices</h4>
              <ul className="text-sm text-gray-500 list-disc pl-5">
                <li>Use exact matches from the job description</li>
                <li>Distribute keywords throughout your resume</li>
                <li>Include keywords in section headings when possible</li>
                <li>Use Alt+H to highlight keywords in your resume</li>
                <li>Aim for a keyword match rate of 80% or higher</li>
                <li>Balance hard skills and soft skills</li>
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
                  openGuide('tags-keywords', 'keywords-feature');
                }}
              >
                View Full Guide
              </Button>
            )}
            <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Optimize Resume Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Optimization</DialogTitle>
            <DialogDescription>
              Suggestions to improve your keyword match rate
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Current Keyword Match</h4>
              <span className={`font-medium ${
                keywordMatchPercentage >= 80 ? 'text-green-500' : 
                keywordMatchPercentage >= 60 ? 'text-yellow-500' : 
                'text-red-500'
              }`}>
                {keywordMatchPercentage}%
              </span>
            </div>
            
            <Progress 
              value={keywordMatchPercentage} 
              className="h-2"
              indicatorClassName={
                keywordMatchPercentage >= 80 ? 'bg-green-500' : 
                keywordMatchPercentage >= 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }
            />
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Optimization Suggestions</h4>
              <ul className="space-y-2">
                {optimizationSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <Sparkles className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Implementation Tips</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">1</div>
                  <p className="text-sm">Focus on quality over quantity - incorporate keywords naturally</p>
                </li>
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">2</div>
                  <p className="text-sm">Create dedicated skills sections to highlight key technical abilities</p>
                </li>
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">3</div>
                  <p className="text-sm">Use exact phrasing from the job description when possible</p>
                </li>
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">4</div>
                  <p className="text-sm">Ensure keywords appear in context, not just as a list</p>
                </li>
              </ul>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                After updating your resume, click "Extract Keywords" again to recalculate your match rate.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('#', '_blank')}
              className="hidden" // Hide this button until we implement the full routing
            >
              View Guide
            </Button>
            <Button onClick={() => setShowOptimizeDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
