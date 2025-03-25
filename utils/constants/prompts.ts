// Define prompts by status and category
export const promptsByStatus = {
  // Initial Contact Category
  Bookmarked: [
    "Analyze this job description and identify my top 3 matching qualifications and 2 areas I should strengthen before applying",
    "Create a detailed research plan for this company covering their culture, recent news, competitors, and growth trajectory",
    "Based on this job description, what unique skills from my resume would make me stand out from typical applicants?",
    "What industry-specific trends and technologies should I be familiar with before applying to this position?",
  ],
  Interested: [
    "Extract the top 10 keywords from this job description that I should strategically incorporate in my resume and cover letter",
    "Based on my experience, what 3-5 compelling achievements should I emphasize for this role to demonstrate my value?",
    "Generate 5 tailored questions I should research about this company that will demonstrate my genuine interest",
    "How does my career trajectory align with this role, and how should I frame this narrative in my application materials?",
  ],
  "Recruiter Contact": [
    "Draft a professional response to the recruiter that highlights my interest, qualifications, and availability for next steps",
    "What 7 specific questions should I ask the recruiter about this role, team culture, and hiring process?",
    "Help me prepare a concise 2-minute introduction for an initial screening call that highlights my relevant experience",
    "What salary research should I conduct for this specific role and location before discussing compensation expectations?",
  ],
  Networking: [
    "Draft a personalized LinkedIn connection message to an employee at this company that mentions our common interests",
    "Prepare 8 thoughtful questions for an informational interview that will provide insights about the company culture",
    "How can I leverage my existing network to get a warm introduction to someone at this company?",
    "Create a follow-up thank you message after a networking conversation that maintains the relationship",
  ],
  // Application Category
  "Preparing Application": [
    "Rewrite my resume summary and key bullet points to directly address the requirements in this job description",
    "Draft a compelling cover letter that tells a story about why I'm passionate about this role and company",
    "What specific portfolio pieces or work samples should I prepare to showcase that align with this job's requirements?",
    "Help me craft honest but effective responses to address the 2-3 qualification gaps in my application materials",
  ],
  Applied: [
    "Create a strategic follow-up plan with specific timing and communication templates for this application",
    "Help me prepare a 30-second elevator pitch that clearly articulates why I'm the ideal candidate for this role",
    "Draft a follow-up email to send in 14 days that adds value and demonstrates my continued interest",
    "What company-specific research should I conduct now to prepare for a potential interview opportunity?",
  ],
  "Application Acknowledged": [
    "Draft a brief but professional response thanking them for acknowledging my application",
    "Create a preparation checklist of things I should do while waiting to hear back about next steps",
    "What is the appropriate timeline for following up on my application status based on this company's size?",
    "Help me research this company's typical interview process based on employee reviews and Glassdoor information",
  ],
  // Interview Process Category
  Screening: [
    "Prepare concise answers for the 10 most common screening questions for this type of role",
    "Create a preparation checklist for a phone screening interview including environment, materials, and talking points",
    "Draft a compelling 90-second response to 'Tell me about yourself' that highlights my relevant experience",
    "What 5 thoughtful questions should I ask during a screening interview that demonstrate my research and interest?",
  ],
  "Technical Assessment": [
    "Based on the job description, what specific technical skills will likely be tested and how should I prepare for each?",
    "Create a 7-day study plan to prepare for this technical assessment based on the job requirements",
    "What are the 5 most common mistakes candidates make during this type of technical assessment and how can I avoid them?",
    "Help me develop a time management strategy for completing this technical assessment efficiently and accurately",
  ],
  "First Interview": [
    "Prepare STAR method responses for the 8 most likely behavioral questions based on this job description",
    "What company and team research should I conduct to demonstrate my genuine interest during this interview?",
    "Draft 3 powerful stories that demonstrate how my experience directly addresses their key requirements",
    "What 5 thoughtful questions should I ask at the end of my interview that demonstrate my strategic thinking?",
  ],
  "Second Interview": [
    "How should I adjust my interview approach for a second interview compared to what I presented in the first round?",
    "Prepare 5 in-depth questions about the team structure, projects, and day-to-day responsibilities",
    "Help me craft a diplomatic response if asked about salary expectations during this round",
    "What specific work examples or case studies should I prepare to discuss in more detail during this interview?",
  ],
  "Final Interview": [
    "How should I prepare differently for a final interview with C-level or senior leadership?",
    "Draft 5 strategic questions about the company vision and how my role contributes to broader objectives",
    "Help me prepare to discuss my compensation expectations with specific numbers and negotiation points",
    "Create a compelling closing statement that reinforces why I'm the ideal candidate and my enthusiasm for the role",
  ],
  "Reference Check": [
    "Create a briefing document to prepare my references with key points about this role and my relevant accomplishments",
    "What specific information should I provide to each reference about this position and company?",
    "Draft an email template to send to my references with details about this position and what to expect",
    "What does the reference check stage typically indicate about my candidacy, and how should I prepare for next steps?",
  ],
  // Decision Category
  Negotiating: [
    "Based on market research for this role and location, what specific salary range should I target in negotiations?",
    "Beyond base salary, what 5 benefits should I prioritize negotiating based on their value and this company's offerings?",
    "Draft a professional counter-offer email that maintains positive relations while advocating for my value",
    "What data points and accomplishments should I reference to justify my compensation requests?",
  ],
  "Offer Received": [
    "Create a comprehensive list of questions to fully understand all components of this compensation package",
    "Help me evaluate this offer against my career goals, market value, and other opportunities using a decision matrix",
    "Draft a professional email requesting additional time to consider the offer (1-2 weeks)",
    "What specific clarification should I seek about benefits, equity, bonus structure, and advancement opportunities?",
  ],
  "Offer Accepted": [
    "Create a detailed checklist of things to do before my start date to ensure a smooth transition",
    "Draft a graceful resignation letter for my current employer that maintains positive relationships",
    "What specific questions should I ask HR about onboarding, paperwork, and first-day logistics?",
    "Help me develop a strategic 30/60/90 day plan to make a strong impression in this new position",
  ],
  "Offer Declined": [
    "Draft a professional email declining the offer while expressing gratitude and maintaining the relationship",
    "What constructive feedback should I provide when declining this offer that would be helpful but not burning bridges?",
    "Help me craft language that keeps the door open for future opportunities with this company",
    "What specific lessons should I document from this experience to improve my job search strategy going forward?",
  ],
  Rejected: [
    "What specific aspects of my application or interview performance should I evaluate to improve future applications?",
    "Draft a professional email requesting constructive feedback that might help me grow professionally",
    "Based on this rejection, should I apply to other positions at this company? If so, what approach should I take?",
    "Create a personal development plan to address potential skill gaps highlighted by this rejection",
  ],
  Withdrawn: [
    "Draft a professional email withdrawing my application that maintains a positive relationship",
    "What networking follow-up would be appropriate to maintain connections with people I met during this process?",
    "Help me document specific insights from this experience to refine my job search criteria",
    "What constructive feedback could I provide about why I'm withdrawing that would be helpful to the company?",
  ],
  "Position Filled": [
    "Draft a follow-up message congratulating the hiring manager and expressing continued interest in future opportunities",
    "What specific lessons can I apply from this experience to improve my applications for similar roles?",
    "Create a strategy for maintaining connection with the hiring manager on LinkedIn despite not getting the role",
    "Based on my interest in this position, what 5 similar companies should I target in my continued search?",
  ],
  "Position Cancelled": [
    "What might this cancellation indicate about the company's stability or priorities that could inform my job search?",
    "Draft a brief message expressing continued interest in future opportunities despite the cancellation",
    "Based on this role's requirements, what 5 similar positions should I look for in my continued search?",
    "How should I adjust my job search strategy based on this experience to focus on more stable opportunities?",
  ],
  // Follow-up Category
  "Following Up": [
    "Draft a value-adding follow-up email that shares an interesting industry article relevant to our conversation",
    "What is the appropriate timing for following up after each specific interview stage (screening, technical, etc.)?",
    "Help me craft a follow-up message that demonstrates continued interest without seeming desperate",
    "What specific work sample or additional information could I provide in my follow-up to strengthen my candidacy?",
  ],
  Waiting: [
    "Create a productive daily routine to maintain momentum in my job search while waiting to hear back",
    "Based on this company's size and hiring process, when would be the appropriate time to send a follow-up?",
    "Draft a brief check-in email that's professional and adds value while demonstrating continued interest",
    "What parallel opportunities should I pursue while waiting to hear back about this position?",
  ],
};

export const promptsByCategory = {
  "Initial Contact": [
    "Analyze this company's stated values and culture, and help me align my experience with their specific mission",
    "Create a competitive analysis of how my qualifications compare to the likely candidate pool for this position",
    "What specialized knowledge, certifications, or training would give me a competitive edge for this specific role?",
    "Based on this company's size, industry, and recent news, what business challenges could I help them solve?",
  ],
  Application: [
    "Transform my resume to explicitly match this job description while highlighting my unique value proposition",
    "Create a compelling cover letter that tells a story connecting my specific experience to their stated needs",
    "Help me quantify my achievements with metrics that would be most impressive for this particular industry",
    "Identify the 5 most relevant projects from my experience that directly address their key requirements",
  ],
  "Interview Process": [
    "Based on this job description, prepare me for the 10 most likely technical questions I'll face in the interview",
    "Help me structure powerful STAR method answers for behavioral questions specific to this role's challenges",
    "What company-specific research would demonstrate exceptional preparation to my interviewers?",
    "Craft a compelling narrative about my career path that positions this specific role as my ideal next step",
  ],
  Decision: [
    "Create a comprehensive decision matrix to evaluate this opportunity against my career goals and other options",
    "Based on industry standards and this company's size, what specific compensation package should I target?",
    "What strategic questions should I ask to understand the growth trajectory and advancement opportunities?",
    "Help me objectively analyze the pros and cons of this offer compared to my current situation",
  ],
  "Follow-up": [
    "What specific value-adding content related to their business challenges could I include in follow-up communications?",
    "Create a relationship-building strategy to maintain connections with this company regardless of the outcome",
    "Draft a check-in email that demonstrates my continued interest while sharing relevant industry insights",
    "What is the appropriate cadence for following up at each stage of this company's specific hiring process?",
  ],
};
