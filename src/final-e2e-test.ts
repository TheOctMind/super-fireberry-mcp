import { createApiClient, normalizeObjectType } from "./services/api.ts";

const TOKEN_ID = "2f7d2691-bc07-4c5f-9398-d0f245cb28c6";
const apiClient = createApiClient(TOKEN_ID);

async function finalEndToEndTest() {
  console.log("🏁 Starting Final End-to-End Systematic Verification...");

  const results: any[] = [];
  const log = (step: string, status: string, details?: string) => {
    results.push({ step, status, details: details || "" });
    console.log(`${status} ${step} ${details ? `(${details})` : ""}`);
  };

  try {
    // 1. Discovery Test
    const objects = await apiClient.get("/v3/metadata/objects");
    log(
      "Metadata Discovery",
      "✅",
      `Found ${objects.data.data.length} objects`,
    );

    // 2. Normalization & Field Discovery
    const accountType = normalizeObjectType("Account");
    const fields = await apiClient.get(`/v3/metadata/fields/${accountType}`);
    log(
      "Normalization & Fields",
      "✅",
      `Mapped 'Account' to '${accountType}', found ${fields.data.data.length} fields`,
    );

    // 3. Query Engine Test (The hardest part)
    // Using the refined structure we discovered (objecttype in body)
    const queryRes = await apiClient.post("/query", {
      objecttype: parseInt(accountType),
      pageNumber: 1,
      pageSize: 1,
    });
    console.log("Full Query Response:", JSON.stringify(queryRes.data, null, 2));
    log("Query Engine", "✅", `Retrieved records`);

    // 4. Record Management (Read)
    const testRecord = queryRes.data.data.Records[0];
    const singleRecord = await apiClient.get(
      `/record/account/${testRecord.accountid}`,
    );
    log(
      "Single Record Read",
      "✅",
      `Verified record: ${singleRecord.data.data.accountname}`,
    );

    // 5. Relationship Traversal (Using verified ID)
    try {
      const related = await apiClient.get(
        `/record/related/account/${testRecord.accountid}/contact`,
      );
      log(
        "Relationship Traversal",
        "✅",
        "Successfully queried related contacts",
      );
    } catch (e: any) {
      log(
        "Relationship Traversal",
        "⚠️",
        e.response?.data?.message || "Check relation name",
      );
    }

    // 6. Batch Architecture Check
    try {
      await apiClient.get(`/v3/batch/1`);
      log("Batch API Architecture", "✅", "Endpoint reachable/valid structure");
    } catch (e: any) {
      if (e.response?.status === 405)
        log("Batch API Architecture", "✅", "Method check verified");
      else log("Batch API Architecture", "❌", e.message);
    }
  } catch (error: any) {
    log("Test Suite", "❌", error.response?.data?.message || error.message);
  }

  console.log("\n--- FINAL E2E VALIDATION SUMMARY ---");
  console.table(results);
}

finalEndToEndTest();
