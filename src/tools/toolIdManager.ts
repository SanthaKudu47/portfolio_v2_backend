class ToolIdStore {
  private toolIdStore: Map<string, string>;
  constructor() {
    this.toolIdStore = new Map<string, string>();
  }

  storeLastToolId(userSessionId: string, toolId: string) {
    this.toolIdStore.set(userSessionId, toolId);
  }
}

export const toolIdStore = new ToolIdStore();
