import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Slider } from "../../components/ui/slider";
import { Progress } from "../../components/ui/progress";
import { Opportunity } from "../../context/types";
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
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

interface Keyword {
  text: string;
  relevance: number; // 1-5 scale
  inResume: boolean;
  matchScore?: number; // 1-5 scale indicating how well the resume demonstrates this skill
  category?: "must-have" | "should-have" | "could-have"; // importance category
}

interface KeywordsSectionProps {
  opportunity: Opportunity;
  // Update the type here
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isDarkMode: boolean;
  openGuide?: (guideId: string, sectionId?: string) => void;
}

export const KeywordsSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
  openGuide,
}: KeywordsSectionProps) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showAddKeywordDialog, setShowAddKeywordDialog] = useState(false);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(
    null
  );
  const [editedKeyword, setEditedKeyword] = useState<Keyword>({
    text: "",
    relevance: 3,
    inResume: false,
    category: "should-have",
  });
  const [showHelpDialog, setShowHelpDialog] = useState<boolean | string>(false);
  const [highlightInResume, setHighlightInResume] = useState(false);
  const [keywordMatchPercentage, setKeywordMatchPercentage] = useState(0);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<
    string[]
  >([]);

  // Initialize keywords from opportunity data
  useEffect(() => {
    if (opportunity.keywords) {
      // Convert string[] to Keyword[] if needed
      if (typeof opportunity.keywords[0] === "string") {
        const convertedKeywords = (opportunity.keywords as string[]).map(
          (k) => ({
            text: k,
            relevance: Math.floor(Math.random() * 5) + 1, // Random relevance 1-5 for demo
            inResume: checkIfInResume(k),
          })
        );
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
    const highRelevanceKeywords = keywords.filter((k) => k.relevance >= 4);
    if (!highRelevanceKeywords.length) {
      setKeywordMatchPercentage(0);
      return;
    }

    const matchedKeywords = highRelevanceKeywords.filter((k) => k.inResume);
    const percentage =
      (matchedKeywords.length / highRelevanceKeywords.length) * 100;
    setKeywordMatchPercentage(Math.round(percentage));
  };

  // Simulate extracting keywords from job description
  const extractKeywords = () => {
    setIsLoading(true);

    // In a real implementation, this would call an API to extract keywords
    setTimeout(() => {
      // Example keywords that might be extracted from a job description
      const keywordsList = [
        "React",
        "TypeScript",
        "JavaScript",
        "Node.js",
        "API",
        "Frontend",
        "UI/UX",
        "Responsive Design",
        "Git",
        "Agile",
        "Communication",
        "Problem Solving",
        "Team Player",
        "Testing",
      ];

      // Assign categories based on relevance
      const getCategoryFromRelevance = (relevance: number) => {
        if (relevance >= 4) return "must-have";
        if (relevance >= 2) return "should-have";
        return "could-have";
      };

      // Calculate match score based on how well the keyword appears in resume
      const calculateMatchScore = (text: string): number => {
        if (!opportunity.resume) return 0;

        const resumeText = opportunity.resume.toLowerCase();
        const keyword = text.toLowerCase();

        // Check for exact match
        if (
          resumeText.includes(` ${keyword} `) ||
          resumeText.includes(`${keyword}.`) ||
          resumeText.includes(`${keyword},`)
        ) {
          return 5; // Excellent match
        }

        // Check for partial matches
        const partialMatches = resumeText.split(keyword).length - 1;
        if (partialMatches > 2) return 4; // Good match
        if (partialMatches > 0) return 3; // Basic match

        // Check for related terms (simplified example)
        const relatedTerms: Record<string, string[]> = {
          react: ["reactjs", "react.js", "jsx", "tsx"],
          javascript: ["js", "ecmascript", "frontend development"],
          typescript: ["ts", "typed javascript"],
          "node.js": ["nodejs", "server-side javascript"],
          // Add more related terms as needed
        };

        const related = relatedTerms[keyword.toLowerCase()];
        if (related && related.some((term) => resumeText.includes(term))) {
          return 2; // Minimal match through related terms
        }

        // Check for very loose association
        const fieldTerms = {
          frontend: ["html", "css", "web development", "ui"],
          backend: ["server", "api", "database"],
          devops: ["ci/cd", "pipeline", "deployment"],
          // Add more field associations as needed
        };

        for (const [field, terms] of Object.entries(fieldTerms)) {
          if (
            keyword.toLowerCase().includes(field) &&
            terms.some((term) => resumeText.includes(term))
          ) {
            return 1; // Poor match through field association
          }
        }

        return 0; // No match
      };

      // Create keyword objects with relevance, category, match score, and check if they're in resume
      const extractedKeywords: Keyword[] = keywordsList
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map((text) => {
          const relevance = Math.floor(Math.random() * 5) + 1; // Random relevance 1-5
          const inResume = checkIfInResume(text);
          const matchScore = calculateMatchScore(text);
          const category = getCategoryFromRelevance(relevance);

          return {
            text,
            relevance,
            inResume,
            matchScore,
            category,
          };
        });

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
  const generateOptimizationSuggestions = (
    keywordList: Keyword[] = keywords
  ) => {
    const missingHighRelevanceKeywords = keywordList
      .filter((k) => k.relevance >= 4 && !k.inResume)
      .map((k) => k.text);

    if (missingHighRelevanceKeywords.length === 0) {
      setOptimizationSuggestions([
        "Great job! Your resume already includes all high-relevance keywords.",
      ]);
      return;
    }

    const suggestions = [
      `Add these high-relevance keywords to your resume: ${missingHighRelevanceKeywords.join(
        ", "
      )}`,
      "Consider creating a 'Skills' section that explicitly lists these keywords",
      "Incorporate keywords naturally in your experience descriptions",
      "Use exact phrasing from the job description when possible",
      "Ensure keywords appear in the first third of your resume for better ATS visibility",
    ];

    setOptimizationSuggestions(suggestions);
  };

  // Toggle a keyword selection
  const toggleKeywordSelection = (keyword: string) => {
    let updatedSelection;

    if (selectedKeywords.includes(keyword)) {
      updatedSelection = selectedKeywords.filter((k) => k !== keyword);
    } else {
      updatedSelection = [...selectedKeywords, keyword];
    }

    setSelectedKeywords(updatedSelection);
    updateOpportunity(opportunity.id, { selectedKeywords: updatedSelection });
  };

  // Add a new keyword
  const handleAddKeyword = () => {
    if (editedKeyword.text.trim() === "") return;

    const updatedKeywords = [...keywords, editedKeyword];
    setKeywords(updatedKeywords);
    setEditedKeyword({
      text: "",
      relevance: 3,
      inResume: false,
      category: "should-have",
    });
    setShowAddKeywordDialog(false);

    // Update the opportunity
    updateOpportunity(opportunity.id, { keywords: updatedKeywords });

    // Recalculate match percentage
    calculateKeywordMatchPercentage();
  };

  // Edit an existing keyword
  const handleEditKeyword = (index: number) => {
    setEditingKeywordIndex(index);
    setEditedKeyword(keywords[index]);
  };

  // Save edited keyword
  const handleSaveKeywordEdit = () => {
    if (editingKeywordIndex === null || editedKeyword.text.trim() === "")
      return;

    const updatedKeywords = [...keywords];
    updatedKeywords[editingKeywordIndex] = editedKeyword;

    setKeywords(updatedKeywords);
    setEditingKeywordIndex(null);

    // Update the opportunity
    updateOpportunity(opportunity.id, { keywords: updatedKeywords });

    // Recalculate match percentage
    calculateKeywordMatchPercentage();
  };

  // Remove a keyword
  const handleRemoveKeyword = (index: number) => {
    if (window.confirm("Are you sure you want to remove this keyword?")) {
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
      alert("No keywords to export");
      return;
    }

    // Format keywords for export
    const keywordsText = keywords
      .sort((a, b) => b.relevance - a.relevance)
      .map((k) => {
        const stars = "★".repeat(k.relevance) + "☆".repeat(5 - k.relevance);
        const status = k.inResume ? "[In Resume]" : "[Missing]";
        return `${k.text} ${stars} ${status}`;
      })
      .join("\n");

    const exportData = `Keywords for ${opportunity.company} - ${opportunity.position}\n\nKeyword Match: ${keywordMatchPercentage}%\n\n${keywordsText}`;

    // Create a blob and download
    const blob = new Blob([exportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords-${opportunity.company
      .replace(/\s+/g, "-")
      .toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render stars for relevance or match rating
  const renderStars = (
    rating: number,
    filled: string = "text-yellow-500 fill-yellow-500",
    empty: string = "text-gray-300"
  ) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-3 w-3 ${i <= rating ? filled : empty}`} />
        ))}
      </div>
    );
  };

  // Get badge color based on category
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "must-have":
        return "bg-green-100 text-green-800 border-green-200";
      case "should-have":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "could-have":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "must-have":
        return "Must-have";
      case "should-have":
        return "Should-have";
      case "could-have":
        return "Could-have";
      default:
        return category;
    }
  };

  // Extract keywords on first load if none exist
  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      extractKeywords();
    } else {
      // Update inResume status for all keywords
      const updatedKeywords = keywords.map((k) => ({
        ...k,
        inResume: checkIfInResume(k.text),
      }));
      setKeywords(updatedKeywords);
      calculateKeywordMatchPercentage();
      generateOptimizationSuggestions(updatedKeywords);
    }
  }, [opportunity.resume]);

  return (
    <div
      className={`p-4 mb-4 rounded-lg border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Skills Gap Analyzer
          </h3>
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
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Analyzing..." : "Extract Requirements"}
          </Button>
        </div>
      </div>

      {/* Keyword match percentage */}
      {keywords.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-sm">Skills Match</Label>
            <span
              className={`text-sm font-medium ${
                keywordMatchPercentage >= 80
                  ? "text-green-500"
                  : keywordMatchPercentage >= 60
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {keywordMatchPercentage}%
            </span>
          </div>
          <Progress
            value={keywordMatchPercentage}
            className={`h-2 ${
              keywordMatchPercentage >= 80
                ? "bg-green-100"
                : keywordMatchPercentage >= 60
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
            indicatorClassName={
              keywordMatchPercentage >= 80
                ? "bg-green-500"
                : keywordMatchPercentage >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
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
          <Label
            htmlFor="highlight-keywords"
            className="text-sm cursor-pointer"
          >
            Highlight skills in resume (Alt+H)
          </Label>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
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
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Skills by match quality:
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

                <div className="space-y-4">
                  {/* Strong Matches (4-5 stars) */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      STRONG MATCHES
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords
                        .filter((k) => (k.matchScore || 0) >= 4)
                        .map((keyword, index) => {
                          const keywordIndex = keywords.findIndex(
                            (k) => k.text === keyword.text
                          );
                          return editingKeywordIndex === keywordIndex ? (
                            <div
                              key={index}
                              className="flex items-center space-x-1 p-1 border rounded"
                            >
                              <Input
                                value={editedKeyword.text}
                                onChange={(e) =>
                                  setEditedKeyword({
                                    ...editedKeyword,
                                    text: e.target.value,
                                  })
                                }
                                className="h-6 w-24 p-1"
                                autoFocus
                              />
                              <div className="flex items-center">
                                <Label className="text-xs mr-1">
                                  Importance:
                                </Label>
                                <select
                                  className="text-xs p-1 border rounded"
                                  value={editedKeyword.relevance}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    setEditedKeyword({
                                      ...editedKeyword,
                                      relevance: value,
                                      category:
                                        value >= 4
                                          ? "must-have"
                                          : value >= 2
                                          ? "should-have"
                                          : "could-have",
                                    });
                                  }}
                                >
                                  <option value="5">Must-have (5)</option>
                                  <option value="4">Must-have (4)</option>
                                  <option value="3">Should-have (3)</option>
                                  <option value="2">Should-have (2)</option>
                                  <option value="1">Could-have (1)</option>
                                </select>
                                {renderStars(editedKeyword.relevance)}
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
                              className={`flex items-center gap-1 ${getCategoryBadgeColor(
                                keyword.category || ""
                              )}`}
                            >
                              <div className="flex items-center">
                                <span>{keyword.text}</span>
                                <span className="mx-1 text-xs opacity-70">
                                  ({getCategoryLabel(keyword.category || "")})
                                </span>
                                <span className="ml-1 text-xs">
                                  {renderStars(keyword.matchScore || 0)}
                                </span>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleEditKeyword(keywordIndex)
                                  }
                                >
                                  <Pencil className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleRemoveKeyword(keywordIndex)
                                  }
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </Badge>
                          );
                        })}
                      {keywords.filter((k) => (k.matchScore || 0) >= 4)
                        .length === 0 && (
                        <p className="text-xs text-gray-500 italic">
                          No strong matches found
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Partial Matches (2-3 stars) */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      PARTIAL MATCHES
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords
                        .filter(
                          (k) =>
                            (k.matchScore || 0) >= 2 && (k.matchScore || 0) <= 3
                        )
                        .map((keyword, index) => {
                          const keywordIndex = keywords.findIndex(
                            (k) => k.text === keyword.text
                          );
                          return editingKeywordIndex === keywordIndex ? (
                            <div
                              key={index}
                              className="flex items-center space-x-1 p-1 border rounded"
                            >
                              <Input
                                value={editedKeyword.text}
                                onChange={(e) =>
                                  setEditedKeyword({
                                    ...editedKeyword,
                                    text: e.target.value,
                                  })
                                }
                                className="h-6 w-24 p-1"
                                autoFocus
                              />
                              <div className="flex items-center">
                                <Label className="text-xs mr-1">
                                  Relevance:
                                </Label>
                                <Slider
                                  value={[editedKeyword.relevance]}
                                  min={1}
                                  max={5}
                                  step={1}
                                  className="w-20"
                                  onValueChange={(value) =>
                                    setEditedKeyword({
                                      ...editedKeyword,
                                      relevance: value[0],
                                    })
                                  }
                                />
                                {renderStars(editedKeyword.relevance)}
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
                              className={`flex items-center gap-1 ${getCategoryBadgeColor(
                                keyword.category || ""
                              )}`}
                            >
                              <div className="flex items-center">
                                <span>{keyword.text}</span>
                                <span className="mx-1 text-xs opacity-70">
                                  ({getCategoryLabel(keyword.category || "")})
                                </span>
                                <span className="ml-1 text-xs">
                                  {renderStars(keyword.matchScore || 0)}
                                </span>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleEditKeyword(keywordIndex)
                                  }
                                >
                                  <Pencil className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleRemoveKeyword(keywordIndex)
                                  }
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </Badge>
                          );
                        })}
                      {keywords.filter(
                        (k) =>
                          (k.matchScore || 0) >= 2 && (k.matchScore || 0) <= 3
                      ).length === 0 && (
                        <p className="text-xs text-gray-500 italic">
                          No partial matches found
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills (0-1 stars) */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      MISSING SKILLS
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {keywords
                        .filter((k) => (k.matchScore || 0) <= 1)
                        .map((keyword, index) => {
                          const keywordIndex = keywords.findIndex(
                            (k) => k.text === keyword.text
                          );
                          return editingKeywordIndex === keywordIndex ? (
                            <div
                              key={index}
                              className="flex items-center space-x-1 p-1 border rounded"
                            >
                              <Input
                                value={editedKeyword.text}
                                onChange={(e) =>
                                  setEditedKeyword({
                                    ...editedKeyword,
                                    text: e.target.value,
                                  })
                                }
                                className="h-6 w-24 p-1"
                                autoFocus
                              />
                              <div className="flex items-center">
                                <Label className="text-xs mr-1">
                                  Relevance:
                                </Label>
                                <Slider
                                  value={[editedKeyword.relevance]}
                                  min={1}
                                  max={5}
                                  step={1}
                                  className="w-20"
                                  onValueChange={(value) =>
                                    setEditedKeyword({
                                      ...editedKeyword,
                                      relevance: value[0],
                                    })
                                  }
                                />
                                {renderStars(editedKeyword.relevance)}
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
                              className={`flex items-center gap-1 ${getCategoryBadgeColor(
                                keyword.category || ""
                              )}`}
                            >
                              <div className="flex items-center">
                                <span>{keyword.text}</span>
                                <span className="mx-1 text-xs opacity-70">
                                  ({getCategoryLabel(keyword.category || "")})
                                </span>
                                <span className="ml-1 text-xs">
                                  {renderStars(keyword.matchScore || 0)}
                                </span>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleEditKeyword(keywordIndex)
                                  }
                                >
                                  <Pencil className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleRemoveKeyword(keywordIndex)
                                  }
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </Badge>
                          );
                        })}
                      {keywords.filter((k) => (k.matchScore || 0) <= 1)
                        .length === 0 && (
                        <p className="text-xs text-gray-500 italic">
                          No missing skills found
                        </p>
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
              <FileText
                className={`h-12 w-12 mx-auto mb-2 ${
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                No skills analyzed yet
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Click "Extract Requirements" to analyze the job description and
                identify required skills
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddKeywordDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Skills Manually
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Keyword Dialog */}
      <Dialog
        open={showAddKeywordDialog}
        onOpenChange={setShowAddKeywordDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Add a skill or requirement from the job description
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <Label htmlFor="keyword-text">Skill</Label>
              <Input
                id="keyword-text"
                value={editedKeyword.text}
                onChange={(e) =>
                  setEditedKeyword({ ...editedKeyword, text: e.target.value })
                }
                placeholder="e.g., React, Project Management"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="keyword-relevance">Relevance</Label>
                <span className="text-sm text-gray-500">
                  {editedKeyword.relevance}/5
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="text-xs p-1 border rounded mr-2"
                  value={editedKeyword.relevance}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setEditedKeyword({
                      ...editedKeyword,
                      relevance: value,
                      category:
                        value >= 4
                          ? "must-have"
                          : value >= 2
                          ? "should-have"
                          : "could-have",
                    });
                  }}
                >
                  <option value="5">Must-have (5)</option>
                  <option value="4">Must-have (4)</option>
                  <option value="3">Should-have (3)</option>
                  <option value="2">Should-have (2)</option>
                  <option value="1">Could-have (1)</option>
                </select>
                <div className="flex">
                  {renderStars(editedKeyword.relevance)}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Higher relevance indicates skills that are more important for
                this position
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddKeywordDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddKeyword}>Add Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={Boolean(showHelpDialog)}
        onOpenChange={(open) =>
          setShowHelpDialog(open ? showHelpDialog : false)
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Using Skills Gap Analyzer</DialogTitle>
            <DialogDescription>
              Identify and close the gaps between job requirements and your
              resume
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <h4 className="font-medium mb-1">
                Understanding the Skills Gap Analyzer
              </h4>
              <p className="text-sm text-gray-500">
                The Skills Gap Analyzer identifies how well your skills match
                job requirements. Each skill is categorized by:
              </p>
              <ul className="text-sm text-gray-500 list-disc pl-5 mt-1">
                <li>
                  <span className="text-green-700 font-medium">
                    Must-have skills
                  </span>{" "}
                  - Explicitly required in the job description
                </li>
                <li>
                  <span className="text-yellow-700 font-medium">
                    Should-have skills
                  </span>{" "}
                  - Strongly preferred by the employer
                </li>
                <li>
                  <span className="text-gray-700 font-medium">
                    Could-have skills
                  </span>{" "}
                  - Beneficial but optional
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Match Rating System</h4>
              <p className="text-sm text-gray-500">
                Each skill is rated with stars showing how well your resume
                demonstrates that skill:
              </p>
              <ul className="text-sm text-gray-500 list-disc pl-5 mt-1">
                <li>
                  <span className="font-medium">5 stars:</span> Excellent match
                  (prominently featured in resume)
                </li>
                <li>
                  <span className="font-medium">4 stars:</span> Good match
                  (clearly mentioned in resume)
                </li>
                <li>
                  <span className="font-medium">3 stars:</span> Basic match
                  (mentioned but not emphasized)
                </li>
                <li>
                  <span className="font-medium">2 stars:</span> Minimal match
                  (implied but not explicit)
                </li>
                <li>
                  <span className="font-medium">1 star:</span> Poor match (only
                  tangentially related skills)
                </li>
                <li>
                  <span className="font-medium">No stars:</span> Not found (no
                  evidence in resume)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">How to Use This Feature</h4>
              <p className="text-sm text-gray-500">
                Focus on addressing the "Missing Skills" and "Partial Matches"
                sections, especially for must-have skills, to improve your
                application.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Best Practices</h4>
              <ul className="text-sm text-gray-500 list-disc pl-5">
                <li>
                  Prioritize adding must-have skills that are missing from your
                  resume
                </li>
                <li>Use exact terminology from the job description</li>
                <li>Provide specific examples that demonstrate your skills</li>
                <li>
                  Use the "Optimize Resume" button for tailored suggestions
                </li>
                <li>
                  Aim for strong matches on at least 80% of must-have skills
                </li>
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
                  openGuide("tags-keywords", "keywords-feature");
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
              Suggestions to close your skills gaps
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Current Keyword Match</h4>
              <span
                className={`font-medium ${
                  keywordMatchPercentage >= 80
                    ? "text-green-500"
                    : keywordMatchPercentage >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {keywordMatchPercentage}%
              </span>
            </div>

            <Progress
              value={keywordMatchPercentage}
              className="h-2"
              indicatorClassName={
                keywordMatchPercentage >= 80
                  ? "bg-green-500"
                  : keywordMatchPercentage >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }
            />

            <div className="mt-4">
              <h4 className="font-medium mb-2">Skills Gap Recommendations</h4>
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
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">
                    1
                  </div>
                  <p className="text-sm">
                    Focus on quality over quantity - incorporate keywords
                    naturally
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">
                    2
                  </div>
                  <p className="text-sm">
                    Create dedicated skills sections to highlight key technical
                    abilities
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">
                    3
                  </div>
                  <p className="text-sm">
                    Use exact phrasing from the job description when possible
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0 flex items-center justify-center">
                    4
                  </div>
                  <p className="text-sm">
                    Ensure keywords appear in context, not just as a list
                  </p>
                </li>
              </ul>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                After updating your resume, click "Extract Requirements" again
                to recalculate your skills match.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("#", "_blank")}
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
