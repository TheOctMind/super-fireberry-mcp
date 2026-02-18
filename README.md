# 🦾 Super Fireberry MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Protocol-blue?style=flat-square)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A production-grade Model Context Protocol (MCP) server that provides a high-performance bridge between LLMs and **Fireberry CRM**. Engineered for deep integration, this server enables natural language control over complex CRM workflows, financial data, and system metadata.

---

## 🏛️ Architecture & Project Structure

The project follows a modular, service-oriented architecture designed for scalability and maintainability.

```text
super-fireberry-mcp/
├── build/                 # Compiled JavaScript (Distribution)
├── src/                   # Source Code
│   ├── services/          # Core Business Logic
│   │   └── api.ts         # Axios client, interceptors & normalization
│   ├── types/             # TypeScript interfaces & API schemas
│   │   └── fireberry.ts   # CRM-specific data types
│   ├── tools/             # Tool definitions (Planned for next expansion)
│   └── index.ts           # Entry point: MCP server configuration & routing
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies & Scripts
└── README.md              # Documentation
```

### Core Design Principles
- **Abstraction Layer**: Decouples human-readable entity names (e.g., `Account`) from internal API codes (`1`).
- **Stateless Operation**: Designed to run as a lightweight stdio transport.
- **Robust Error Handling**: Comprehensive catching of API limits, permission errors, and validation issues.

---

## 🚀 Key Features

- **Dynamic Discovery**: Automatically reflects changes in your Fireberry schema (custom objects/fields).
- **Advanced Querying**: Native support for the Fireberry Query API with logical filtering.
- **Bulk Processing**: Integrated Batch API for high-throughput data operations.
- **Financial Integration**: Ready for Invoices, Receipts, and Orders.
- **Smart Normalization**: Seamlessly handles object mapping and name casing.

---

## 🛠️ Available Tools

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `get_objects` | `none` | List all available CRM modules and system objects. |
| `get_fields` | `objectType` | Fetch detailed field metadata for a specific object. |
| `query` | `objectType`, `query` | Execute complex searches with filters and sorting. |
| `manage_record` | `action`, `objectType`, `recordId?`, `data?` | Create, update, or delete CRM records. |
| `get_related_records`| `objectType`, `recordId`, `relatedObjectType`| Retrieve linked records across entities. |

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- A Fireberry API Access Token

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/TheOctMind/super-fireberry-mcp.git
   cd super-fireberry-mcp
   ```
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

### Configuration
Set the following environment variable:
`FIREBERRY_TOKEN_ID` = `your_fireberry_api_token`

---

## 🔧 Integration

### Claude Desktop
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "super-fireberry": {
      "command": "node",
      "args": ["/absolute/path/to/super-fireberry-mcp/build/index.js"],
      "env": {
        "FIREBERRY_TOKEN_ID": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

---

## 🔍 Troubleshooting

| Issue | Potential Cause | Solution |
| :--- | :--- | :--- |
| `401 Unauthorized` | Invalid API Token | Verify your `FIREBERRY_TOKEN_ID` in the config. |
| `403 Forbidden` | Insufficient Permissions | Ensure the API user has read/write access to the specific module (e.g., Invoices). |
| `400 Bad Request` | Missing Required Fields | Use `get_fields` to verify the mandatory fields for the object you are managing. |
| `404 Not Found` | Invalid Object Name | Use `get_objects` to check the correct `systemname` or `logicalName`. |

---

## 🛡️ Security
- **Token Safety**: Authentication is handled via secure environment variables.
- **Input Validation**: All tool arguments are validated using Zod schemas.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
