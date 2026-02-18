import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";

const FIREBERRY_API_URL = "https://api.fireberry.com/api";
const TOKEN_ID = process.env.FIREBERRY_TOKEN_ID;

if (!TOKEN_ID) {
  console.error("FIREBERRY_TOKEN_ID environment variable is required");
  process.exit(1);
}

const apiClient = axios.create({
  baseURL: FIREBERRY_API_URL,
  headers: {
    "tokenid": TOKEN_ID,
    "Content-Type": "application/json",
  },
});

const server = new Server(
  {
    name: "super-fireberry-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools.
 * Includes advanced tools like metadata discovery, complex queries, and batch operations.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_objects",
        description: "Get all CRM objects/modules available in Fireberry",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_fields",
        description: "Get all fields for a specific CRM object",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string", description: "The object type (e.g., account, contact, custom_object_1)" },
          },
          required: ["objectType"],
        },
      },
      {
        name: "query",
        description: "Perform an advanced query with filters, sorting, and pagination",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            query: { 
              type: "object", 
              description: "Fireberry query object with filter, orderby, pageNumber, etc." 
            },
          },
          required: ["objectType", "query"],
        },
      },
      {
        name: "batch_create",
        description: "Create multiple records in a single batch operation",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            records: { type: "array", items: { type: "object" } },
          },
          required: ["objectType", "records"],
        },
      },
      {
        name: "manage_record",
        description: "Create, Update, or Delete a single record",
        inputSchema: {
          type: "object",
          properties: {
            action: { enum: ["create", "update", "delete"] },
            objectType: { type: "string" },
            recordId: { type: "string", description: "Required for update and delete" },
            data: { type: "object", description: "The record data" },
          },
          required: ["action", "objectType"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_objects": {
        const response = await apiClient.get("/v3/metadata/objects");
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "get_fields": {
        const { objectType } = args as { objectType: string };
        const response = await apiClient.get(`/v3/metadata/fields/${objectType}`);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "query": {
        const { objectType, query } = args as { objectType: string, query: any };
        const response = await apiClient.post(`/record/query/${objectType}`, query);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "batch_create": {
        const { objectType, records } = args as { objectType: string, records: any[] };
        const response = await apiClient.post(`/v3/batch/${objectType}`, { records });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "manage_record": {
        const { action, objectType, recordId, data } = args as { 
          action: "create" | "update" | "delete", 
          objectType: string, 
          recordId?: string, 
          data?: any 
        };
        
        let response;
        if (action === "create") {
          response = await apiClient.post(`/record/${objectType}`, data);
        } else if (action === "update") {
          response = await apiClient.put(`/record/${objectType}/${recordId}`, data);
        } else {
          response = await apiClient.delete(`/record/${objectType}/${recordId}`);
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: error.response?.data?.message || error.message }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Fireberry Power MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
