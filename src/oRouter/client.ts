import { OpenRouter } from "@openrouter/agent";
import { OpenRouter as SDK } from "@openrouter/sdk";
import { appConfig } from "../config/config.ts";

declare global {
  var openRouterClient: OpenRouter | null;
}

globalThis.openRouterClient = globalThis.openRouterClient ?? null;

function createClient() {
  if (globalThis.openRouterClient) {
    return globalThis.openRouterClient as OpenRouter;
  }

  const apiKey = appConfig.openRouterKey;
  if (!apiKey) {
    console.log(
      " Error: OPENROUTER_API_KEY is not found in environment variables.",
    );
    throw new Error(
      "OPENROUTER_API_KEY is not found in environment variables.",
    );
  }
  try {
    const client = new OpenRouter({
      apiKey: apiKey,
    });
    globalThis.openRouterClient = client;
    return client;
  } catch (error) {
    throw new Error("Failed to create OPENROUTER client");
  }
}

export async function keyStatus() {
  const openRouter = new SDK({
    apiKey: appConfig.openRouterKey ?? "",
  });
  const keyInfo = await openRouter.apiKeys.getCurrentKeyMetadata();
  console.log(keyInfo);
}

export async function sendMessage(message: string) {
  const client = createClient();
  try {
    const result = client.callModel({
      model: "z-ai/glm-4.5-air:free", //"z-ai/glm-4.5-air:free",//"google/gemma-4-31b-it:free",//"qwen/qwen3-next-80b-a3b-instruct:free",//"poolside/laguna-m.1:free",
      input: message,
    });
    const reply = await result.getText();
    return reply;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to call model");
  }
}
