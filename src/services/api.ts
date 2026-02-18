import axios from "axios";

const FIREBERRY_API_URL = "https://api.fireberry.com/api";

export const createApiClient = (tokenId: string) => {
  return axios.create({
    baseURL: FIREBERRY_API_URL,
    headers: {
      "tokenid": tokenId,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Normalizes object names to their internal Fireberry ObjectTypeCodes.
 * This allows the AI to use "Account" while the API receives "1".
 */
export const normalizeObjectType = (type: string): string => {
  const mapping: Record<string, string> = {
    "account": "1",
    "contact": "2",
    "lead": "3",
    "opportunity": "4",
    "ticket": "117",
    "invoice": "10",
    "product": "11",
    "project": "101",
    "task": "9"
  };
  return mapping[type.toLowerCase()] || type;
};
