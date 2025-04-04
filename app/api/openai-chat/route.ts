import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, body } = await req.json();
    const { opportunityContext } = body || {};

    // Handle different actions
    if (body?.action === "suggestions") {
      return handleSuggestions(opportunityContext);
    }

    // Get job-specific context information
    const jobTitle = opportunityContext?.position || "this position";
    const company = opportunityContext?.company || "this company";
    const status = opportunityContext?.status || "INTERESTED";

    // Calculate days since opportunity was created
    const daysSince = opportunityContext?.createdAt
      ? Math.floor(
          (Date.now() - new Date(opportunityContext.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    // Create system prompt with job-specific instructions - with better balance
    const systemPrompt = {
      role: "system",
      content: `You are a job opportunity assistant created specifically to help a user manage the job application process for the ${jobTitle} position at ${company}.

Your primary focus is this specific job opportunity, but you should interpret user questions in the context of their job search journey. When users ask about learning from experiences or improving their approach, interpret these as being related to this specific job application unless clearly stated otherwise.

Only reject questions that are clearly unrelated to job applications, career development, or professional growth (e.g., questions about coding tutorials, movie recommendations, or general knowledge unrelated to careers).

Your knowledge includes:
- Current application status: ${status}
- Days since opportunity was logged: ${daysSince}
- You help users refine application materials, provide recommendations on follow-ups, prepare for interviews, and navigate the job search process.
- You operate with a "Curiosity Engine" that asks helpful questions to gain context and provide better assistance.

You help users:
- Improve their application materials (resumes, cover letters)
- Understand how to position themselves for this specific role
- Prepare for interviews and follow-ups
- Navigate the application process at different stages
- Learn from experiences and improve their approach

When the user asks about learning from experiences, interpret this as learning from their experience with this specific job application process - offer insights based on their current status (${status}) and time in the process (${daysSince} days).

Once the application status is set to "Applied" or beyond, editing of the resume or application materials is locked.`,
    };

    // Convert any messages with role 'ai' to 'assistant' before passing to the API
    const formattedMessages = messages.map((msg: any) => {
      if (msg.role === "ai") {
        return { ...msg, role: "assistant" };
      }
      return msg;
    });

    // Simplified message array without redundant instructions
    const allMessages = [systemPrompt, ...formattedMessages];

    try {
      // Default chat streaming
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: allMessages,
        temperature: 0.7,
      });

      return result.toDataStreamResponse();
    } catch (streamError: unknown) {
      console.error("Error in stream processing:", streamError);

      // Type check and error handling
      let errorMessage = "Unknown error occurred";

      if (streamError instanceof Error) {
        errorMessage = streamError.message;
      } else if (typeof streamError === "object" && streamError !== null) {
        errorMessage = JSON.stringify(streamError);
      } else if (typeof streamError === "string") {
        errorMessage = streamError;
      }

      // Return a graceful error response
      return new Response(
        JSON.stringify({
          error:
            "An error occurred while generating the response. Please try again.",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error: unknown) {
    console.error("Error in API route:", error);

    // Type checking for error
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Return a structured error response
    return new Response(
      JSON.stringify({
        error: "Failed to process your request. Please try again.",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function handleSuggestions(opportunityContext: any) {
  try {
    // Get status to provide contextual suggestions
    const status = opportunityContext?.status?.toUpperCase() || "INTERESTED";

    // Generate different suggestions based on application status
    let suggestions = [];

    // Initial contact phase suggestions
    if (
      ["BOOKMARKED", "INTERESTED", "RECRUITER_CONTACT", "NETWORKING"].includes(
        status
      )
    ) {
      suggestions = [
        "How can I tailor my resume for this position?",
        "What skills should I highlight for this role?",
        "Can you help me research this company?",
        "How can I connect with employees at this company?",
      ];
    }
    // Application phase suggestions
    else if (
      ["PREPARING_APPLICATION", "APPLIED", "APPLICATION_ACKNOWLEDGED"].includes(
        status
      )
    ) {
      suggestions = [
        "When should I follow up on my application?",
        "What can I do while waiting to hear back?",
        "Can you help draft a follow-up email?",
        "How can I prepare for a potential interview?",
      ];
    }
    // Interview process phase suggestions
    else if (
      [
        "SCREENING",
        "TECHNICAL_ASSESSMENT",
        "FIRST_INTERVIEW",
        "SECOND_INTERVIEW",
        "FINAL_INTERVIEW",
      ].includes(status)
    ) {
      suggestions = [
        "What questions should I prepare for?",
        "How should I answer the 'tell me about yourself' question?",
        "What questions should I ask the interviewer?",
        "How can I demonstrate my value in the interview?",
      ];
    }
    // Decision phase suggestions
    else if (["NEGOTIATING", "OFFER_RECEIVED"].includes(status)) {
      suggestions = [
        "How can I negotiate a better salary?",
        "What benefits should I ask about?",
        "How can I evaluate if this offer is competitive?",
        "Help me craft a response to this offer",
      ];
    }
    // Follow-up or rejected status
    else {
      suggestions = [
        "How can I improve for future applications?",
        "What should I learn from this experience?",
        "How can I stay in touch with this company?",
        "What similar roles should I consider?",
      ];
    }

    return new Response(
      JSON.stringify({
        suggestions,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error generating suggestions:", error);

    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Return default suggestions in case of error
    return new Response(
      JSON.stringify({
        suggestions: [
          "How do my skills match this job description?",
          "What should I highlight in my application?",
          "Help me prepare for an interview for this position",
          "What questions should I ask the interviewer?",
        ],
        error: "Failed to generate personalized suggestions",
        details: errorMessage,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
