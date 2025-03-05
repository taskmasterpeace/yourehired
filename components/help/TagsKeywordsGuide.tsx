import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, BookOpen, Tag, Key, Lightbulb, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const TagsKeywordsGuide = () => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Help
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          CAPTAIN User Guide: Tags & Keywords
        </h1>
      </div>

      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="tags">Tags Feature</TabsTrigger>
          <TabsTrigger value="keywords">Keywords Feature</TabsTrigger>
          <TabsTrigger value="strategies">Tips & Strategies</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <TabsContent value="introduction" className="mt-0">
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p className="mb-4">
                  Tags and Keywords are powerful features in CAPTAIN that help you organize your job applications and optimize your application materials. While they may seem similar, they serve different purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Tags</strong> are user-defined labels that help you categorize and filter your opportunities based on criteria that matter to you.</li>
                  <li><strong>Keywords</strong> are important terms extracted from job descriptions that help you tailor your resume to match what employers are looking for.</li>
                </ul>
                <p>This guide will help you make the most of both features.</p>
              </TabsContent>

              <TabsContent value="tags" className="mt-0">
                <div className="flex items-center mb-4">
                  <Tag className="h-5 w-5 mr-2 text-blue-500" />
                  <h2 className="text-xl font-semibold">Tags Feature</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Understanding Tags</h3>
                    <p className="mb-2">
                      Tags are customizable labels that you can apply to any job opportunity in your CAPTAIN dashboard. They help you:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li>Categorize opportunities by industry, role type, location, etc.</li>
                      <li>Mark opportunities with special statuses (e.g., "Priority," "Dream Job")</li>
                      <li>Group related opportunities together</li>
                      <li>Create your own organizational system</li>
                    </ul>
                    <p>
                      Unlike the fixed "Status" field, tags are completely customizable and you can apply multiple tags to a single opportunity.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Adding Tags</h3>
                    <p className="mb-2">To add tags to an opportunity:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>Open the opportunity details page</li>
                      <li>Locate the "Tags" section (usually below the header or in the sidebar)</li>
                      <li>Click the "Add Tag" button or the "+" icon</li>
                      <li>Either:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Select from your existing tags in the dropdown</li>
                          <li>Type a new tag name and press Enter</li>
                        </ul>
                      </li>
                      <li>The tag will appear in the tags list for that opportunity</li>
                    </ol>
                    <p>You can add as many tags as you need to each opportunity.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Editing Tags</h3>
                    <p className="mb-2">To edit your tags:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>Hover over an existing tag</li>
                      <li>Click the edit (pencil) icon that appears</li>
                      <li>Modify the tag name</li>
                      <li>Press Enter or click Save</li>
                    </ol>
                    <p className="mb-2">To delete a tag from an opportunity:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>Hover over the tag</li>
                      <li>Click the "×" icon or delete button</li>
                      <li>Confirm deletion if prompted</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Filtering by Tags</h3>
                    <p className="mb-2">
                      One of the most powerful aspects of tags is the ability to filter your opportunities:
                    </p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>From the main opportunities list view</li>
                      <li>Locate the "Filter" section in the sidebar</li>
                      <li>Under "Tags," select one or more tags to filter by</li>
                      <li>Your list will update to show only opportunities with all selected tags</li>
                    </ol>
                    <p className="mb-2">You can also:</p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li>Sort opportunities by specific tags</li>
                      <li>Save filter combinations for quick access</li>
                      <li>Use tags in combination with other filters (status, company, etc.)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Tag Best Practices</h3>
                    <p className="mb-2">For the most effective tagging system:</p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li><strong>Be consistent</strong> with your naming conventions</li>
                      <li><strong>Use specific tags</strong> rather than vague ones</li>
                      <li><strong>Create a tagging system</strong> that makes sense for your job search</li>
                      <li><strong>Regularly review and clean up</strong> unused or redundant tags</li>
                      <li><strong>Consider color-coding</strong> tags by category (if supported)</li>
                    </ul>
                    <p className="mb-2">Example tag categories:</p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li>Industry: "Finance," "Healthcare," "Tech"</li>
                      <li>Role type: "Remote," "Hybrid," "On-site"</li>
                      <li>Application effort: "Quick Apply," "Custom Resume"</li>
                      <li>Personal interest: "High Priority," "Dream Company"</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="mt-0">
                <div className="flex items-center mb-4">
                  <Key className="h-5 w-5 mr-2 text-green-500" />
                  <h2 className="text-xl font-semibold">Keywords Feature</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Understanding Keywords</h3>
                    <p className="mb-2">
                      Keywords are specific terms, skills, qualifications, and phrases that employers look for in candidates. In CAPTAIN, the Keywords feature:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li>Automatically extracts important terms from job descriptions</li>
                      <li>Highlights skills and qualifications the employer is seeking</li>
                      <li>Helps you tailor your resume to match job requirements</li>
                      <li>Improves your chances of passing Applicant Tracking Systems (ATS)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Automatic Keyword Extraction</h3>
                    <p className="mb-2">CAPTAIN uses AI to automatically identify keywords in job descriptions:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>When you add a new job description, CAPTAIN will analyze the text</li>
                      <li>The system identifies important terms, skills, and qualifications</li>
                      <li>These keywords appear in the "Keywords" section of the opportunity</li>
                      <li>Keywords are categorized by type (Technical Skills, Soft Skills, Qualifications, etc.)</li>
                      <li>Each keyword shows its frequency or importance in the job description</li>
                    </ol>
                    <p>The automatic extraction saves you time and helps identify terms you might have missed.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Manual Keyword Management</h3>
                    <p className="mb-2">You can also manage keywords manually:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>Navigate to the Keywords section of an opportunity</li>
                      <li>To add a keyword:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Click "Add Keyword" or the "+" button</li>
                          <li>Type the keyword and select a category</li>
                          <li>Click Save or press Enter</li>
                        </ul>
                      </li>
                      <li>To edit a keyword:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Click on the keyword or the edit (pencil) icon</li>
                          <li>Modify the text or category</li>
                          <li>Save your changes</li>
                        </ul>
                      </li>
                      <li>To delete a keyword:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Click the delete (trash) icon next to the keyword</li>
                          <li>Confirm deletion if prompted</li>
                        </ul>
                      </li>
                    </ol>
                    <p>You can also mark keywords as "Matched" to indicate that your resume includes them.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Using Keywords in Your Resume</h3>
                    <p className="mb-2">The Keywords feature helps you optimize your resume:</p>
                    <ol className="list-decimal pl-6 space-y-1 mb-4">
                      <li>Review the extracted keywords for each opportunity</li>
                      <li>In the Resume section, incorporate relevant keywords naturally</li>
                      <li>As you add keywords to your resume, mark them as "Matched" in the Keywords section</li>
                      <li>Focus on high-importance keywords first</li>
                      <li>Use the exact phrasing from the job description when possible</li>
                      <li>Ensure keywords appear in context, not just as a list</li>
                    </ol>
                    <p>CAPTAIN may provide suggestions for incorporating keywords into your resume through the AI assistant.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Keyword Matching Score</h3>
                    <p className="mb-2">
                      CAPTAIN provides a Keyword Matching Score to help you gauge how well your resume matches the job description:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li>The score appears as a percentage at the top of the Keywords section</li>
                      <li>Higher scores indicate better alignment with the job requirements</li>
                      <li>The score updates as you mark keywords as matched</li>
                      <li>Aim for a matching score of at least 70-80% for competitive applications</li>
                    </ul>
                    <p>The score breakdown shows which categories (Technical Skills, Soft Skills, etc.) need more attention.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="strategies" className="mt-0">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Tips & Strategies</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2" id="effective-tagging-strategies">Effective Tagging Strategies</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li><strong>Create a tag hierarchy</strong>: Use broader tags ("Tech") and more specific ones ("Frontend Development")</li>
                      <li><strong>Tag for process stages</strong>: Create tags like "Need to Research," "Ready to Apply," "Follow Up"</li>
                      <li><strong>Use tags for personal notes</strong>: Tags like "Good Culture," "Competitive Salary," "Growth Opportunity"</li>
                      <li><strong>Seasonal tags</strong>: For internships or seasonal hiring, use tags like "Summer 2023," "Fall Hiring"</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2" id="keyword-optimization">Keyword Optimization</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li><strong>Focus on quality over quantity</strong>: Include the most relevant keywords rather than trying to match every single one</li>
                      <li><strong>Balance hard and soft skills</strong>: Don't neglect either category</li>
                      <li><strong>Use industry-standard terminology</strong>: Research common terms in your field</li>
                      <li><strong>Update your master resume</strong>: Add commonly requested keywords to your master resume</li>
                      <li><strong>Create skill sections</strong>: Group related keywords in dedicated resume sections</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Combining Tags and Keywords</h3>
                    <p className="mb-2">For maximum effectiveness, use tags and keywords together:</p>
                    <ul className="list-disc pl-6 space-y-1 mb-4">
                      <li>Create tags based on common keyword clusters you see in job descriptions</li>
                      <li>Tag opportunities with similar keyword requirements to quickly identify which resume version to use</li>
                      <li>Use tags to mark opportunities where you have strong keyword matches</li>
                      <li>Create a "Keyword Gap" tag for opportunities where you're missing critical keywords</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="troubleshooting" className="mt-0">
                <div className="flex items-center mb-4">
                  <HelpCircle className="h-5 w-5 mr-2 text-red-500" />
                  <h2 className="text-xl font-semibold">Troubleshooting</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Keywords aren't being extracted automatically</p>
                    <p className="text-sm text-gray-700">
                      <strong>Solution:</strong> Try refreshing the page, or copy-paste the job description again. If the problem persists, you can add keywords manually.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Can't delete a tag</p>
                    <p className="text-sm text-gray-700">
                      <strong>Solution:</strong> Make sure you're clicking directly on the delete icon. If the tag appears on multiple opportunities, it will only be removed from the current one.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Keyword matching score seems incorrect</p>
                    <p className="text-sm text-gray-700">
                      <strong>Solution:</strong> Review which keywords are marked as matched. The system weighs keywords by importance, so matching high-priority keywords has more impact.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Too many tags making the interface cluttered</p>
                    <p className="text-sm text-gray-700">
                      <strong>Solution:</strong> Regularly audit and consolidate your tags. Remove rarely used tags and combine similar ones.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Can't find a specific keyword that should be extracted</p>
                    <p className="text-sm text-gray-700">
                      <strong>Solution:</strong> The automatic extraction might miss some terms. Add important keywords manually if you don't see them in the extracted list.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default TagsKeywordsGuide;
