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
        name: "get_record",
        description: "Get a single record by its ID",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            recordId: { type: "string" },
          },
          required: ["objectType", "recordId"],
        },
      },
      {
        name: "get_all_records",
        description: "Get all records of a specific type (paginated)",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            pageSize: { type: "number", default: 50 },
            pageNumber: { type: "number", default: 1 },
          },
          required: ["objectType"],
        },
      },
      {
        name: "get_related_records",
        description: "Get records related to a specific record",
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
      {
        name: "batch_update",
        description: "Update multiple records in a single batch operation",
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
        name: "get_picklist_values",
        description: "Get all available values for a specific picklist field",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            fieldName: { type: "string" },
          },
          required: ["objectType", "fieldName"],
        },
      },
      {
        name: "upload_file",
        description: "Upload a file and link it to a record",
        inputSchema: {
          type: "object",
          properties: {
            objectType: { type: "string" },
            recordId: { type: "string" },
            fileName: { type: "string" },
            fileContentBase64: { type: "string", description: "Base64 encoded file content" },
          },
          required: ["objectType", "recordId", "fileName", "fileContentBase64"],
        },
      },
      {
        name: "get_financial_items",
        description: "Get items associated with an invoice, order, or receipt",
        inputSchema: {
          type: "object",
          properties: {
            parentObjectType: { type: "string", enum: ["invoice", "order", "receipt", "invoicecredit", "invoicedelivery", "invoicedraft", "reciptinvoice"] },
            parentId: { type: "string" },
          },
          required: ["parentObjectType", "parentId"],
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
        const response = await apiClient.post(`/record/query/${objectType.toLowerCase()}`, query);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "get_record": {
        const { objectType, recordId } = args as { objectType: string, recordId: string };
        const response = await apiClient.get(`/record/${objectType.toLowerCase()}/${recordId}`);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "get_all_records": {
        const { objectType, pageSize, pageNumber } = args as { objectType: string, pageSize?: number, pageNumber?: number };
        const response = await apiClient.get(`/record/${objectType.toLowerCase()}`, {
          params: { page_size: pageSize, page_number: pageNumber }
        });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "get_related_records": {
        const { objectType, recordId, relatedObjectType } = args as { objectType: string, recordId: string, relatedObjectType: string };
        const response = await apiClient.get(`/record/related/${objectType.toLowerCase()}/${recordId}/${relatedObjectType.toLowerCase()}`);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "batch_create": {
        const { objectType, records } = args as { objectType: string, records: any[] };
        const response = await apiClient.post(`/v3/batch/${objectType}`, { records });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "batch_update": {
        const { objectType, records } = args as { objectType: string, records: any[] };
        const response = await apiClient.put(`/v3/batch/${objectType}`, { records });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "batch_delete": {
        const { objectType, recordIds } = args as { objectType: string, recordIds: string[] };
        const response = await apiClient.delete(`/v3/batch/${objectType}`, { data: { ids: recordIds } });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "get_picklist_values": {
        const { objectType, fieldName } = args as { objectType: string, fieldName: string };
        const response = await apiClient.get(`/v3/metadata/picklist/${objectType}/${fieldName.toLowerCase()}`);
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "upload_file": {
        const { objectType, recordId, fileName, fileContentBase64 } = args as { 
          objectType: string, 
          recordId: string, 
          fileName: string, 
          fileContentBase64: string 
        };
        const response = await apiClient.post(`/files/${objectType}/${recordId}`, {
          file: fileContentBase64,
          filename: fileName
        });
        return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
      }

      case "get_financial_items": {
        const { parentObjectType, parentId } = args as { parentObjectType: string, parentId: string };
        // Map types to specific endpoints based on docs
        const endpointMap: Record<string, string> = {
          invoice: "invoiceitems",
          order: "orderitems",
          receipt: "receiptitems",
          invoicecredit: "invoicecredititems",
          invoicedelivery: "invoicedeliveryitems",
          invoicedraft: "invoicedraftitems",
          reciptinvoice: "reciptinvoiceitems"
        };
        const endpoint = endpointMap[parentObjectType];
        const response = await apiClient.get(`/record/${endpoint}/${parentId}`);
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
