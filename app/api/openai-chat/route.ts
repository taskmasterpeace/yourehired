import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, action } = await req.json();

  // Handle different actions
  if (action === "suggestions") {
    return handleSuggestions(messages);
  }

  // Default chat streaming
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}

async function handleSuggestions(context: any) {
  // This would be your suggestions logic
  // For now, returning default suggestions
  return new Response(
    JSON.stringify({
      suggestions: [
        "How do my skills match this job description?",
        "What should I highlight in my application?",
        "Help me prepare for an interview for this position",
        "What questions should I ask the interviewer?",
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
