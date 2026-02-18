# 🦾 Super Fireberry MCP

A high-performance Model Context Protocol (MCP) server for Fireberry CRM. This server provides a comprehensive bridge between Large Language Models (LLMs) and the Fireberry API, enabling advanced CRM operations through natural language.

Unlike standard integrations, **Super Fireberry MCP** exposes the full power of the Fireberry API, including metadata discovery, complex queries, financial records, and high-efficiency batch operations.

## 🚀 Features

- **Dynamic Metadata Discovery**: Automatically maps custom objects and fields without manual configuration.
- **Advanced Query Engine**: Full support for the Fireberry Query API, allowing for complex filtering, sorting, and pagination.
- **Financial Suite**: Deep integration with Invoices (Credit, Delivery, Draft), Receipts, and Transaction items.
- **High-Throughput Batching**: Efficiently create, update, or delete hundreds of records in a single request.
- **Relationship Intelligence**: Intuitively navigate and retrieve related records across the CRM schema.
- **Smart Normalization**: Automatically handles the mapping between human-readable names and internal API type codes.

## 🛠️ Tools

| Tool | Description |
| --- | --- |
| `get_objects` | Discover all available CRM modules and custom objects. |
| `get_fields` | Retrieve detailed field definitions for any object. |
| `query` | Execute complex search queries with logical filters. |
| `manage_record` | Perform CRUD operations (Create, Update, Delete) on any record. |
| `get_related_records` | Fetch records linked to a specific entity. |
| `batch_ops` | Perform bulk create/update/delete operations. |
| `get_financial_items` | Access granular data for invoices and orders. |
| `get_picklist_values` | Fetch valid options for status and category fields. |

## 📦 Installation

```bash
npm install
npm run build
```

## ⚙️ Configuration

Set the following environment variable:
- `FIREBERRY_TOKEN_ID`: Your Fireberry API Access Token.

### Claude Desktop Configuration
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "super-fireberry": {
      "command": "node",
      "args": ["/path/to/super-fireberry-mcp/build/index.js"],
      "env": {
        "FIREBERRY_TOKEN_ID": "your-api-token"
      }
    }
  }
}
```

## 🏗️ Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js / Bun
- **SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: Axios with interceptors for error handling and normalization.

## 📄 License

MIT License. Developed for high-efficiency CRM management.
