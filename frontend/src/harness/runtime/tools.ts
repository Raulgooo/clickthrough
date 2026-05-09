import type { ToolDefinition } from "./contracts";
import { exaSearch, exaFetch } from "./exa";
import type { WebSearchInput, WebSearchOutput, WebFetchInput, WebFetchOutput } from "./contracts";

export const webSearchTool: ToolDefinition<WebSearchInput, WebSearchOutput> = {
  name: "web.search",
  description: "Search the web for evidence, sources, or general information.",
  readOnly: true,
  risk: "low",
  requiresApproval: () => false,
  execute: async (input) => exaSearch(input),
};

export const webFetchTool: ToolDefinition<WebFetchInput, WebFetchOutput> = {
  name: "web.fetch",
  description: "Fetch and extract content from a specific URL.",
  readOnly: true,
  risk: "low",
  requiresApproval: () => false,
  execute: async (input) => exaFetch(input),
};

export const TOOL_REGISTRY: ToolDefinition<any, any>[] = [webSearchTool, webFetchTool];

export function getTool(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((t) => t.name === name);
}
