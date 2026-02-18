import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createApiClient, normalizeObjectType } from "./services/api.js";

const TOKEN_ID = process.env.FIREBERRY_TOKEN_ID;

if (!TOKEN_ID) {
  console.error("FIREBERRY_TOKEN_ID environment variable is required");
  process.exit(1);
}

const apiClient = createApiClient(TOKEN_ID);

const server = new Server(
  {
    name: "super-fireberry-mcp",
    version: "2.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_objects",
        description: "Discover all available CRM modules and custom objects.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_fields",
        description: "Retrieve detailed field definitions for any object.",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
          },
          required: ["objectType"],
        },
      },
      {
        name: "query",
        description: "Execute complex search queries with logical filters.",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            query: { type: "object" },
          },
          required: ["objectType", "query"],
        },
      },
      {
        name: "manage_record",
        description:
          "Perform CRUD operations (Create, Update, Delete) on any record.",
        inputSchema: {
          type: "object",
          properties: {
            action: { enum: ["create", "update", "delete"] },
            objectType: { type: "string" },
            recordId: { type: "string" },
            data: { type: "object" },
          },
          required: ["action", "objectType"],
        },
      },
      {
        name: "get_related_records",
        description: "Fetch records linked to a specific entity.",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            recordId: { type: "string" },
            relatedObjectType: { type: "string" },
          },
          required: ["objectType", "recordId", "relatedObjectType"],
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
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }

      case "get_fields": {
        const { objectType } = args as { objectType: string };
        const type = normalizeObjectType(objectType);
        const response = await apiClient.get(`/v3/metadata/fields/${type}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }

      case "query": {
        const { objectType, query } = args as {
          objectType: string;
          query: any;
        };
        const type = normalizeObjectType(objectType);
        // Fireberry Query API expects objecttype in the body, not the URL.
        const response = await apiClient.post("/query", {
          ...query,
          objecttype: parseInt(type) || type,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }

      case "manage_record": {
        const { action, objectType, recordId, data } = args as any;
        const type = normalizeObjectType(objectType);
        let response;
        if (action === "create")
          response = await apiClient.post(`/record/${type}`, data);
        else if (action === "update")
          response = await apiClient.put(`/record/${type}/${recordId}`, data);
        else response = await apiClient.delete(`/record/${type}/${recordId}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }

      case "get_related_records": {
        const { objectType, recordId, relatedObjectType } = args as any;
        const type = normalizeObjectType(objectType);
        const relType = normalizeObjectType(relatedObjectType);
        const response = await apiClient.get(
          `/record/related/${type}/${recordId}/${relType}`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        { type: "text", text: error.response?.data?.message || error.message },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
