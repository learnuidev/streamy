// app/api/chat/route.ts
import { IChatMessage } from "@/app/features/deepseek-chat/deepseek-chat.types";
import { NextRequest } from "next/server";

interface ChatRequestBody {
  message: string;
  conversationHistory?: IChatMessage[];
}

export async function POST(req: NextRequest): Promise<Response> {
  // Verify API key
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("DEEPSEEK_API_KEY is not configured");
    return new Response("Error: API key not configured", { status: 500 });
  }

  // Parse request body
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { message, conversationHistory = [] } = body;

  const messages: IChatMessage[] = [
    { role: "system", content: "You are a helpful, friendly AI assistant." },
    ...conversationHistory,
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok || !response.body) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${errorData}`);
    }

    const decoder = new TextDecoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = response.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const cleanedLine = line.replace(/^data: /, "").trim();

              if (!cleanedLine) continue;
              if (cleanedLine === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed: {
                  choices: { delta?: { content?: string } }[];
                } = JSON.parse(cleanedLine);

                const content = parsed.choices[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch {
                console.log("Skipping line:", cleanedLine);
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("DeepSeek API error:", error);

    const err = error as Error;
    let message = "Error: Failed to get response from DeepSeek API.";
    if (err.message.includes("401")) {
      message =
        "Error: Invalid API key. Please check your DeepSeek configuration.";
    } else if (err.message.includes("429")) {
      message = "Error: Rate limit exceeded. Please try again later.";
    } else if (/5\d\d/.test(err.message)) {
      message = "Error: Service unavailable. Please try again later.";
    }

    return new Response(message, { status: 500 });
  }
}
