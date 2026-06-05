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
    console.log(`price of  ${rest[0]} is 25.00 USD`);
    return `price of  ${rest[0]} is 25.00 USD`;
  },
});

toolManager.assignTool("calculate_sum", {
  args: ["a", "b"],
  function: function (...rest: any[]) {
    return (rest[0] + rest[1]).toString();
  },
});

export { toolManager };
