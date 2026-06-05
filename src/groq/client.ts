import Groq from "groq-sdk";
import { appConfig } from "../config/config.ts";
import { contextManager } from "../context/context.ts";
import { toolManager } from "../tools/tools.ts";
import type { GroqMessage } from "../types/groq.ts";

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
  let userSessionContext = contextManager.getSessionContext(userSessionId);

  if (!userSessionContext) {
    throw new Error("No active session context found.");
  }

  contextManager.addMessageToSessionContext(userSessionId, {
    role: "user",
    content: message,
  });

  while (true) {
    userSessionContext = contextManager.getSessionContext(userSessionId)!;
    try {
      const response = await groq.chat.completions.create({
        messages: userSessionContext,
        model: "llama-3.3-70b-versatile",
        tools: [
          {
            type: "function",
            function: {
              name: "get_game_price",
              description:
                "Retrieves the current price of a specific video game.",

              parameters: {
                type: "object",
                properties: {
                  gameName: {
                    type: "string",
                    description: "The full title or name of the video game.",
                  },
                },

                required: ["gameName"],
              },
            },
          },
        ],
      });

      //got reply from model

      if (response.choices.length === 0) {
        console.error("Groq returned no choices.");
        return "I'm having trouble responding right now.";
      }

      const { role, content, tool_calls } = response.choices[0].message;
      const finish_reason = response.choices[0].finish_reason;

      //Finish the loop
      if (finish_reason === "stop") {
        const assistantMessage: GroqMessage = {
          role: role,
          content: content,
        };

        contextManager.addMessageToSessionContext(
          userSessionId,
          assistantMessage,
        );
        contextManager.trimContext(userSessionId);
        return content ?? "I'm having trouble responding right now.";
      }

      //tool call handle
      if (role === "assistant" && tool_calls) {
        const toolCallObj = tool_calls[0];
        const toolId = toolCallObj.id;
        const functionName = toolCallObj.function.name;
        const args = JSON.parse(toolCallObj.function.arguments);

        const assistantMessage: GroqMessage = {
          role: role,
          tool_calls: [
            {
              id: toolId,
              type: "function",
              function: {
                name: functionName,
                arguments: toolCallObj.function.arguments,
              },
            },
          ],
          content: "",
        };

        contextManager.addMessageToSessionContext(
          userSessionId,
          assistantMessage,
        );

        const toolResult = toolManager.executeTool(functionName, args);

        const toolResponseMsg: GroqMessage = {
          content: toolResult,
          tool_call_id: toolId,
          role: "tool",
          name: functionName,
        };

        contextManager.addMessageToSessionContext(
          userSessionId,
          toolResponseMsg,
        );

        continue;
      }
    } catch (error) {
      console.error("Groq chat error:", error);
      throw new Error("Unable to communicate with the AI model.");
    }
  }
}

// rec(m=8){
//   if(m===0) return 0;
//   return rec(m--);
// }
