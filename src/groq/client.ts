import Groq from "groq-sdk";
import { appConfig } from "../config/config.ts";
import type { IMessage } from "../context/types.ts";
import { context } from "../context/context.ts";

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

function initializeContext(context: IMessage[]) {
  context.push({
    role: "system",
    content: "Your a helpful assistant named 'LASANTHA'",
  });
}

function updateContext(context: IMessage[], message: IMessage) {
  context.push(message);
}

export async function setupGroq() {
  initializeContext(context);
}

export async function chat(message: string) {
  const grock = createClient();
  updateContext(context, { role: "user", content: message }); //context hidden dependency
  try {
    const response = await grock.chat.completions.create({
      messages: context,
      model: "llama-3.1-8b-instant",
    });
    if (response.choices.length === 0) {
      console.log("No choices in response object");
      return null;
    }
    const { role, content } = response.choices[0].message;
    //tools are later
    // if(role ==='assistant'){

    // }
    updateContext(context, { role: role, content: content });
    return content;
  } catch (error) {
    console.log("Failed to call model");
    console.log(error);
    return null;
  }
}
