import type { GroqMessage} from "../types/groq.ts";

class ContextManager {
  private contextList: Map<string, GroqMessage[]>;
  constructor() {
    this.contextList = new Map<string, GroqMessage[]>();
  }

  private initializeContext(context: GroqMessage[]) {
    context.push({
      role: "system",
      content: "You're a helpful assistant named 'LASANTHA'. When a tool provides data (like game prices), accept it as absolute truth. Do not attempt to use search engines, internet tools, or any functions not provided in your tool definitions to verify it. Use the provided tool content to answer the user immediately."
    });
  }

  createNewContextSession(sessionId: string) {
    const newContext: GroqMessage[] = [];
    this.initializeContext(newContext);
    this.contextList.set(sessionId, newContext);
  }

  hasSessionContext(sessionId: string) {
    return this.contextList.has(sessionId);
  }

  getSessionContext(sessionId: string) {
    return this.contextList.get(sessionId);
  }

  removeSessionContext(sessionId: string) {
    this.contextList.delete(sessionId);
  }

  addMessageToSessionContext(sessionId: string, message: GroqMessage) {
    const session = this.contextList.get(sessionId);
    if (!session) throw new Error("Session not found.");
    session.push(message);
  }

  trimContext(sessionId: string, maxMessages = 30) {
    const session = this.contextList.get(sessionId);
    if (!session) return;

    if (session.length > maxMessages) {
      const systemMessage = session[0];
      const recent = session.slice(-maxMessages);
      this.contextList.set(sessionId, [systemMessage, ...recent]);
    }
  }
}

export const contextManager = new ContextManager();
