"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ThumbsUp, ThumbsDown, PlusCircle, Search, CalendarIcon, BarChart, Send, User, Bot, FileText, MessageSquare, Lock, Unlock, Maximize2, Minimize2, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { BarChartIcon, PieChartIcon, LineChartIcon, ActivityIcon } from 'lucide-react'
import { generateChatResponse, generateSuggestions } from '@/lib/openai'

export default function CAPTAINGui() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("opportunities")
  const [selectedOpportunityIndex, setSelectedOpportunityIndex] = useState(0)
  const [isMasterResumeFrozen, setIsMasterResumeFrozen] = useState(false)
  const [masterResume, setMasterResume] = useState("")
  const [jobChats, setJobChats] = useState<{ [key: number]: { message: string, sender: 'user' | 'ai' }[] }>({})
  const [currentMessage, setCurrentMessage] = useState("")
  const [isEditingJobDescription, setIsEditingJobDescription] = useState(false)
  const [editedJobDescription, setEditedJobDescription] = useState("")
  const [jobRecommendations, setJobRecommendations] = useState([
    { id: 1, company: "TechGiant", position: "Senior Frontend Developer", description: "TechGiant is seeking a Senior Frontend Developer to lead our web application team. The ideal candidate will have 5+ years of experience with React, TypeScript, and state management libraries. You'll be responsible for architecting scalable frontend solutions and mentoring junior developers." },
    { id: 2, company: "DataDrive", position: "Machine Learning Engineer", description: "DataDrive is looking for a Machine Learning Engineer to join our AI research team. You'll work on cutting-edge projects involving natural language processing and computer vision. Strong background in Python, PyTorch or TensorFlow, and experience with large language models is required." },
    { id: 3, company: "CloudScale", position: "DevOps Engineer", description: "CloudScale needs a DevOps Engineer to streamline our CI/CD pipelines and manage our cloud infrastructure. Experience with AWS, Kubernetes, and Infrastructure as Code (e.g., Terraform) is essential. You'll be responsible for maintaining high availability and scalability of our services." }
  ]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const quickChatOptions = [
    "Analyze my resume",
    "Suggest skills to improve",
    "How to prepare for interviews",
    "Tips for salary negotiation"
  ];

  const [opportunities, setOpportunities] = useState([
    { id: 1, company: "TechCorp", position: "Software Engineer", status: "In Progress", appliedDate: "May 15, 2023", jobDescription: "We are seeking a talented Software Engineer to join our innovative team...", resume: "John Doe\n\nExperience:\n- Software Developer at XYZ Corp\n- Intern at ABC Tech\n\nSkills:\n- JavaScript, React, Node.js\n- Python, Django\n- SQL, MongoDB" },
    { id: 2, company: "DataInc", position: "Data Scientist", status: "Interview Scheduled", appliedDate: "May 10, 2023", jobDescription: "DataInc is looking for a Data Scientist to help us derive insights from our vast datasets...", resume: "John Doe\n\nExperience:\n- Data Analyst at BigData Co.\n- Research Assistant at University XYZ\n\nSkills:\n- Python, R, SQL\n- Machine Learning, Deep Learning\n- Data Visualization (Tableau, D3.js)" },
    { id: 3, company: "AIStartup", position: "Machine Learning Engineer", status: "Applied", appliedDate: "May 5, 2023", jobDescription: "Join our cutting-edge AI startup as a Machine Learning Engineer and help shape the future of AI...", resume: "John Doe\n\nExperience:\n- AI Researcher at Tech University\n- Machine Learning Intern at AI Solutions Inc.\n\nSkills:\n- Python, TensorFlow, PyTorch\n- Natural Language Processing\n- Computer Vision" }
  ]);

  // Filter opportunities based on search term and status filter
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      opp.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || opp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const [newOpportunity, setNewOpportunity] = useState({
    company: "",
    position: "",
    jobDescription: "",
    status: "Applied",
  });

  const handleNewOpportunityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewOpportunity({
      ...newOpportunity,
      [e.target.id]: e.target.value,
    });
  };

  const handleNewOpportunityStatusChange = (value: string) => {
    setNewOpportunity({
      ...newOpportunity,
      status: value,
    });
  };

  const handleSaveNewOpportunity = () => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const newOpp = {
      ...newOpportunity,
      id: opportunities.length + 1,
      appliedDate: currentDate,
      resume: masterResume, // Use the master resume for the new opportunity
    };
    setOpportunities([...opportunities, newOpp]);
    setNewOpportunity({
      company: "",
      position: "",
      jobDescription: "",
      status: "Applied",
    });
  };

  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const selectedOpportunity = opportunities[selectedOpportunityIndex];

  useEffect(() => {
    if (selectedOpportunity) {
      fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suggestions',
          resume: selectedOpportunity.resume,
          jobDescription: selectedOpportunity.jobDescription,
        }),
      })
        .then(response => response.json())
        .then(data => setSuggestions(data.suggestions))
        .catch(console.error);
    }
  }, [selectedOpportunity]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "" || !selectedOpportunity) return;

    const userMessage = { role: 'user', content: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: [
            { role: 'system', content: `You are a career advisor. The user's resume is: ${selectedOpportunity.resume}\n\nThe job description is: ${selectedOpportunity.jobDescription}` },
            ...chatMessages,
            userMessage
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.content || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, there was an error processing your request." }]);
    }
  };


  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">CAPTAIN - Career Application Tracking and Intelligence Navigation</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg shadow-md">
        <TabsList className="mb-4 p-2 bg-blue-100 rounded-t-lg">
          <TabsTrigger value="opportunities" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Opportunities</TabsTrigger>
          <TabsTrigger value="resume" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Master Resume</TabsTrigger>
          <TabsTrigger value="captain" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Captain</TabsTrigger>
          <TabsTrigger value="analytics" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="calendar" className="px-4 py-2 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-blue-700">Job Opportunities</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add New Opportunity</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Opportunity</DialogTitle>
                  <DialogDescription>Enter the details of your new job opportunity</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">Company</Label>
                    <Input
                      id="company"
                      className="col-span-3"
                      value={newOpportunity.company}
                      onChange={handleNewOpportunityChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">Position</Label>
                    <Input
                      id="position"
                      className="col-span-3"
                      value={newOpportunity.position}
                      onChange={handleNewOpportunityChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="jobDescription" className="text-right">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      className="col-span-3 font-mono whitespace-pre-wrap"
                      value={newOpportunity.jobDescription}
                      onChange={handleNewOpportunityChange}
                      rows={10}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select onValueChange={handleNewOpportunityStatusChange} value={newOpportunity.status}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interviewing">Interviewing</SelectItem>
                        <SelectItem value="Offered">Offered</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSaveNewOpportunity}>Save Opportunity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-1 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">Job List</CardTitle>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search by company or position..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                        <SelectItem value="Offered">Offered</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[700px]">
                  {filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map((opp, index) => {
                      const originalIndex = opportunities.findIndex(o => o.id === opp.id);
                      return (
                        <Card 
                          key={opp.id} 
                          className={`mb-2 cursor-pointer ${originalIndex === selectedOpportunityIndex ? 'bg-blue-200' : 'bg-white'}`} 
                          onClick={() => setSelectedOpportunityIndex(originalIndex)}
                        >
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">{opp.position}</CardTitle>
                            <CardDescription>{opp.company}</CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <Badge>{opp.status}</Badge>
                            <p className="text-sm mt-2">Applied: {opp.appliedDate}</p>
                            <p className="text-xs mt-2 text-gray-600 line-clamp-3 whitespace-pre-line">
                              {opp.jobDescription.substring(0, 150)}...
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No opportunities match your search criteria</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("All");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              {selectedOpportunity ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-blue-700">{selectedOpportunity.position} at {selectedOpportunity.company}</CardTitle>
                      <div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedOpportunityIndex(prev => (prev > 0 ? prev - 1 : opportunities.length - 1))}
                          disabled={selectedOpportunityIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedOpportunityIndex(prev => (prev < opportunities.length - 1 ? prev + 1 : 0))}
                          disabled={selectedOpportunityIndex === opportunities.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>Applied on: {selectedOpportunity.appliedDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="details">
                      <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="resume">Resume</TabsTrigger>
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">Job Description</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setIsEditingJobDescription(true);
                              setEditedJobDescription(selectedOpportunity.jobDescription);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                        {isEditingJobDescription ? (
                          <div className="space-y-2">
                            <Textarea 
                              className="h-[350px] font-mono whitespace-pre-wrap"
                              value={editedJobDescription}
                              onChange={(e) => setEditedJobDescription(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsEditingJobDescription(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => {
                                  const updatedOpportunities = [...opportunities];
                                  updatedOpportunities[selectedOpportunityIndex] = {
                                    ...selectedOpportunity,
                                    jobDescription: editedJobDescription
                                  };
                                  setOpportunities(updatedOpportunities);
                                  setIsEditingJobDescription(false);
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px] border rounded-md p-4 bg-white">
                            <pre className="whitespace-pre-wrap">{selectedOpportunity.jobDescription}</pre>
                          </ScrollArea>
                        )}
                      </TabsContent>
                      <TabsContent value="resume">
                        <h3 className="text-lg font-semibold mb-2">Submitted Resume</h3>
                        <ScrollArea className="h-[400px] border rounded-md p-4 bg-white">
                          <pre>{selectedOpportunity.resume}</pre>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="chat">
                        <ScrollArea className="h-[400px] border rounded-md p-4 mb-4 bg-white">
                          {chatMessages.map((msg, index) => (
                            <div key={index} className={`flex items-start mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                              {msg.role === 'assistant' && <Bot className="mr-2 h-6 w-6 text-blue-500" />}
                              <Card className={msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}>
                                <CardContent className="p-3">
                                  <p>{msg.content}</p>
                                </CardContent>
                              </Card>
                              {msg.role === 'user' && <User className="ml-2 h-6 w-6 text-blue-500" />}
                            </div>
                          ))}
                        </ScrollArea>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {suggestions.map((suggestion, index) => (
                            <Button key={index} variant="outline" onClick={() => setCurrentMessage(suggestion)}>
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center">
                          <Input
                            placeholder="Type your message here..."
                            className="flex-grow mr-2"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </>
              ) : (
                <CardContent>
                  <p className="text-center text-gray-500">No opportunity selected</p>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resume" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700">Master Resume</CardTitle>
              <CardDescription>Manage and edit your master resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Label htmlFor="freeze-resume" className="mr-2">
                    {isMasterResumeFrozen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    {isMasterResumeFrozen ? 'Locked' : 'Unlocked'}
                  </Label>
                  <Switch
                    id="freeze-resume"
                    checked={isMasterResumeFrozen}
                    onCheckedChange={setIsMasterResumeFrozen}
                  />
                </div>
                <Button disabled={isMasterResumeFrozen}>Save Changes</Button>
              </div>
              <Textarea
                className="min-h-[400px] mb-4 font-mono whitespace-pre-wrap"
                placeholder="Paste your master resume here..."
                value={masterResume}
                onChange={(e) => setMasterResume(e.target.value)}
                disabled={isMasterResumeFrozen}
              />
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] border rounded-md p-4">
                      <pre className="whitespace-pre-wrap">{masterResume}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Change Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] border rounded-md p-4">
                      <ul className="space-y-2">
                        <li>May 20, 2023: Updated skills section</li>
                        <li>May 15, 2023: Added new work experience</li>
                        <li>May 10, 2023: Initial resume creation</li>
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captain" className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700">CAPTAIN AI Assistant</CardTitle>
                <CardDescription>Your AI career assistant and opportunity analyzer</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-md p-4 mb-4 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Bot className="mr-2 h-6 w-6 text-blue-500" />
                      <Card className="bg-gray-100">
                        <CardContent className="p-3">
                          <p>Hello! I'm your CAPTAIN AI assistant. How can I help you with your job search today?</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex items-start justify-end">
                      <Card className="bg-blue-100">
                        <CardContent className="p-3">
                          <p>Can you analyze my current job applications and suggest improvements?</p>
                        </CardContent>
                      </Card>
                      <User className="ml-2 h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex items-start">
                      <Bot className="mr-2 h-6 w-6 text-blue-500" />
                      <Card className="bg-gray-100">
                        <CardContent className="p-3">
                          <p>Certainly! I'll analyze your applications and provide suggestions for improvement. Here's what I found:</p>
                          <ul className="list-disc pl-5 mt-2">
                            <li>Your resume for the Software Engineer position at TechCorp could benefit from more specific achievements.</li>
                            <li>For the Data Scientist role at DataInc, consider highlighting your experience with big data technologies.</li>
                            <li>Your application for the Machine Learning Engineer position at AIStartup looks strong, but you might want to elaborate on your NLP projects.</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickChatOptions.map((option, index) => (
                    <Button key={index} variant="outline" onClick={() => setCurrentMessage(option)}>
                      {option}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center">
                  <Input
                    placeholder="Ask CAPTAIN anything..."
                    className="flex-grow mr-2"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                  />
                  <Button><Send className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-blue-700">Job Recommendations</CardTitle>
                <CardDescription>Rate these job opportunities to improve recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{jobRecommendations[currentJobIndex].position}</CardTitle>
                      <CardDescription>{jobRecommendations[currentJobIndex].company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] border rounded-md p-4 mb-4">
                        <p>{jobRecommendations[currentJobIndex].description}</p>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          // Handle thumbs down logic here
                          setCurrentJobIndex((prevIndex) => (prevIndex + 1) % jobRecommendations.length);
                        }}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          // Handle thumbs up logic here
                          setCurrentJobIndex((prevIndex) => (prevIndex + 1) % jobRecommendations.length);
                        }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentJobIndex((prevIndex) => (prevIndex + 1) % jobRecommendations.length)}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700">Job Search Analytics</CardTitle>
              <CardDescription>Visualize your job search progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <BarChartIcon className="h-32 w-32 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <PieChartIcon className="h-32 w-32 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Match Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <LineChartIcon className="h-32 w-32 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-200 rounded-md">
                      <ActivityIcon className="h-32 w-32 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-blue-700">Application Calendar</CardTitle>
              <CardDescription>View your application events and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <ul className="space-y-4">
                        <li className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-semibold">Interview with TechCorp</p>
                            <p className="text-sm text-gray-500">May 25, 2023</p>
                          </div>
                        </li>
                        <li className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-semibold">Follow-up with DataInc</p>
                            <p className="text-sm text-gray-500">May 27, 2023</p>
                          </div>
                        </li>
                        <li className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-red-500" />
                          <div>
                            <p className="font-semibold">Application deadline for AIStartup</p>
                            <p className="text-sm text-gray-500">June 1, 2023</p>
                          </div>
                        </li>
                        <li className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                          <div>
                            <p className="font-semibold">Technical assessment for CloudTech</p>
                            <p className="text-sm text-gray-500">June 5, 2023</p>
                          </div>
                        </li>
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
