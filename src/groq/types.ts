export interface GroqChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: GroqChatChoice[];
  usage: GroqUsage;
  system_fingerprint?: string;
  x_groq?: {
    id: string;
  };
}

export interface GroqChatChoice {
  index: number;
  message: GroqMessage;
  logprobs: null | any;
  finish_reason: GroqFinishReason;
}

export type GroqFinishReason =
  | "stop"          // normal completion
  | "length"        // max tokens reached
  | "tool_calls"    // model wants to call a tool
  | "content_filter"
  | "error";

export interface GroqMessage {
  role: "assistant" | "user" | "system" | "tool";
  content: string | null;

  // For tool-calling models
  tool_calls?: GroqToolCall[];
}

export interface GroqToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface GroqUsage {
  queue_time: number;
  prompt_tokens: number;
  prompt_time: number;
  completion_tokens: number;
  completion_time: number;
  total_tokens: number;
  total_time: number;
}
