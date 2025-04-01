import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// This enables the streaming capabilities for this Next.js route
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messages, resume, jobDescription } = body;

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured on server" },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
    });

    // Handle different action types
    switch (action) {
      case "chat":
        return handleChat(openai, messages);
      case "suggestions":
        return handleSuggestions(openai, resume, jobDescription);
      case "stream_chat":
        return streamChat(openai, messages);
      default:
        return NextResponse.json(
          { error: "Invalid action type" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// Handler for regular chat
async function handleChat(openai: OpenAI, messages: any[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();

    // Validation
    if (!content || content.length < 1) {
      console.error("OpenAI returned empty result for chat");
      return NextResponse.json(
        {
          error: "No valid response generated",
        },
        { status: 422 }
      );
    }

    // Return the result
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error in handleChat:", error);
    return NextResponse.json(
      {
        error: "Error processing chat message",
      },
      { status: 500 }
    );
  }
}

// Stream handler for chat
async function streamChat(openai: OpenAI, messages: any[]) {
  // Create a text encoder
  const encoder = new TextEncoder();

  // Create a ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Set up streaming response
        const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
          stream: true,
        });

        let resultText = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          resultText += content;

          // Send the accumulated text to the client
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: resultText })}\n\n`
            )
          );
        }

        // Make sure we ALWAYS send the done signal
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error: unknown) {
        console.error("Error in stream:", error);
        // Safely extract error message with proper type checking
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = String((error as { message: unknown }).message);
        }

        // Send error message and done signal to client
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "Stream failed",
              message: errorMessage,
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    },
  });

  // Return the stream as a response with appropriate headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Handler for generating prompt suggestions
async function handleSuggestions(
  openai: OpenAI,
  resume: string,
  jobDescription: string
) {
  const systemPrompt = `You are an AI assistant specialized in helping job seekers. 
  Based on the user's resume and the job description, generate 4-5 helpful prompt suggestions. 
  These should be questions the user might want to ask you to improve their application.
  
  Format the output as a JSON array of strings.
  
  Example output format:
  ["How do my skills match this job description?", "What weaknesses should I address in my resume?"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ suggestions: [] });
    }

    try {
      // Try to parse the JSON response
      const parsed = JSON.parse(content);
      return NextResponse.json({ suggestions: parsed.suggestions || [] });
    } catch (parseError) {
      console.error("Error parsing suggestions JSON:", parseError);
      // If parsing fails, try to extract an array using regex as a fallback
      const arrayMatch = content.match(/\[(.*)\]/s);
      if (arrayMatch && arrayMatch[0]) {
        try {
          const extractedArray = JSON.parse(arrayMatch[0]);
          return NextResponse.json({ suggestions: extractedArray });
        } catch {
          // If that fails too, return empty array
          return NextResponse.json({ suggestions: [] });
        }
      }
      return NextResponse.json({ suggestions: [] });
    }
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
