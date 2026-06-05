type ToolType = (...args: any[]) => string;
type toolSchema = {
  args: string[];
  function: ToolType;
};

class ToolManager {
  private tools: Map<string, toolSchema>;
  constructor() {
    this.tools = new Map<string, toolSchema>();
  }

  assignTool(name: string, tool: toolSchema) {
    this.tools.set(name, tool);
  }

  executeTool(name: string, params: object) {
    console.log("Executing tool", name, params);
    const toolSchema = this.tools.get(name);
    if (!toolSchema) {
      throw new Error("Tool not found!");
    }
    const tool = toolSchema.function;
    const args = toolSchema.args;

    const formattedArgs: any[] = [];
    args.forEach((paramName) => {
      Object.entries(params).forEach(([key, value]) => {
        if (paramName === key) {
          formattedArgs.push(value);
        }
      });
    });
    if (formattedArgs.length != args.length) {
      throw new Error("Invalid argument count");
    }
    return tool(...formattedArgs);
  }
}

//register tool
const toolManager = new ToolManager();

toolManager.assignTool("get_game_price", {
  args: ["gameName"],
  function: function (...rest: any[]) {
    try {
      return JSON.stringify({
        ok: true,
        data: `price of  ${rest[0]} is 25.00 USD`,
      });
    } catch (err) {
      if (err instanceof Error) {
        return JSON.stringify({
          ok: false,
          error: err.message,
        });
      }

      return JSON.stringify({
        ok: false,
        error: "Unknown error occurred",
      });
    }
  },
});

toolManager.assignTool("calculate_sum", {
  args: ["a", "b"],
  function: function (...rest: any[]) {
    return (rest[0] + rest[1]).toString();
  },
});

export { toolManager };
