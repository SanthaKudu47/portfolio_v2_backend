import Groq from "groq-sdk";
import { appConfig } from "../config/config.ts";
import { contextManager } from "../context/context.ts";

declare global {
  var groqClient: Groq | null;
}

globalThis.groqClient = globalThis.groqClient ?? null;

function createClient() {
  if (globalThis.groqClient) {
    return globalThis.groqClient as Groq;
  }

  const apiKey = appConfig.groqKey;
  if (!apiKey) {
    console.log(" Error: GROQ API_KEY is not found in environment variables.");
    throw new Error("GROQ_API_KEY is not found in environment variables.");
  }
  try {
    const client = new Groq({ apiKey: apiKey });
    globalThis.groqClient = client;
    return client;
  } catch (error) {
    throw new Error("Failed to create GROQ client");
  }
}

export async function chat(message: string, userSessionId: string) {
  const groq = createClient();

  const userSessionContext = contextManager.getSessionContext(userSessionId);
  if (!userSessionContext) {
    throw new Error("No active session context found.");
  }

  contextManager.addMessageToSessionContext(userSessionId, {
    role: "user",
    content: message,
  });

  try {
    const response = await groq.chat.completions.create({
      messages: userSessionContext,
      model: "llama-3.1-8b-instant",
    });

    if (response.choices.length === 0) {
      console.error("Groq returned no choices.");
      return "I'm having trouble responding right now.";
    }

    const { role, content } = response.choices[0].message;
    // keep these destructured variables for future use, when handling tools
    // 4. Add assistant message to context
    contextManager.addMessageToSessionContext(userSessionId, {
      role: role,
      content: content,
    });
    contextManager.trimContext(userSessionId);
    return content ?? "I'm having trouble responding right now.";
  } catch (error) {
    console.error("Groq chat error:", error);
    throw new Error("Unable to communicate with the AI model.");
  }
}
