import { tools } from "@/lib/tools";
import { generateId, Message, streamText } from "ai";
import { google } from "@ai-sdk/google";

export const POST = async (request: Request) => {
  const { messages, todos }: { messages: Message[]; todos: unknown } =
    await request.json();

  const updatedMessages = messages.concat({
    id: generateId(),
    content:
      "These are my current todos. Do not repeat them back to me in your response.\n" +
      JSON.stringify(todos, null, 2),
    role: "user",
  });

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system:
      "You are a helpful assistant. Do not include a summary of todos in your responses. You are helping a user manage their todo list. If the user says they've done something, use the todo tool.",
    messages: updatedMessages,
    tools,
  });

  return result.toDataStreamResponse();
};
