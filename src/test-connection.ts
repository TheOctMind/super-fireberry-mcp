import axios from "axios";

const FIREBERRY_API_URL = "https://api.fireberry.com/api";
const TOKEN_ID = "2f7d2691-bc07-4c5f-9398-d0f245cb28c6";

const apiClient = axios.create({
  baseURL: FIREBERRY_API_URL,
  headers: {
    "tokenid": TOKEN_ID,
    "Content-Type": "application/json",
  },
});

async function test() {
  try {
    console.log("Testing connection to Fireberry (v3 Metadata)...");
    const response = await apiClient.get("/v3/metadata/objects");
    console.log("Success! Objects found:", response.data.data.length);
    console.log("First 3 objects:", JSON.stringify(response.data.data.slice(0, 3), null, 2));
  } catch (error: any) {
    console.error("Connection failed:", error.response?.data || error.message);
  }
}

test();
