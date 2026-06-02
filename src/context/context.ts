import type { IMessage } from "./types";

class ContextManager {
  private contextList: Map<string, IMessage[]>;
  constructor() {
    this.contextList = new Map<string, IMessage[]>();
  }

  private initializeContext(context: IMessage[]) {
    context.push({
      role: "system",
      content: "You're a helpful assistant named 'LASANTHA'.",
    });
  }

  createNewContextSession(sessionId: string) {
    const newContext: IMessage[] = [];
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

  addMessageToSessionContext(sessionId: string, message: IMessage) {
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
