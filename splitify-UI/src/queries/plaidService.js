import getAPIUrl from "../config";
const API_URL = getAPIUrl();

// exported per your requirement
export const getToken = () => localStorage.getItem("token");

// keep this internal (no export)
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    method: options.method || "GET",
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || data.error || `HTTP error! status: ${response.status}`
      );
    }
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const createLinkToken = async () => {
  try {
    const data = await apiRequest(`/plaid/create_link_token`, {
      method: "POST",
    });
    return data.link_token;
  } catch (err) {
    console.error("Error creating link token:", err);
    throw err;
  }
};

export const createPublicToken = async () => {
  console.log("Creating public token...");
  try {
    const data = await apiRequest(`/plaid/public_token`, {
      method: "POST",
    });
    console.log("Public token created:", data.public_token);
    return data.public_token;
  } catch (error) {
    console.error("Error creating public token:", error);
    throw error;
  }
};

export const exchangePublicToken = async (publicToken) => {
  console.log("Getting access token...");
  try {
    const data = await apiRequest(`/plaid/exchange_public_token`, {
      method: "POST",
      body: { public_token: publicToken },
    });
    console.log("data", data);
    console.log("Access token created:", data.access_token);
    return data.access_token;
  } catch (error) {
    console.error("Error creating access token:", error);
    throw error;
  }
};

export const refreshTransactions = async (accessToken) => {
  console.log("refreshing transactions...");
  try {
    const data = await apiRequest(`/plaid/transactions/refresh`, {
      method: "POST",
      body: { access_token: accessToken },
    });
    console.log("Transactions refreshed", data);
    // keeping your original return shape:
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing transactions:", error);
    throw error;
  }
};

export const getTransactions = async (startDate, endDate) => {
  console.log("Getting transactinos...");
  try {
    const data = await apiRequest(`/plaid/transactions`, {
      method: "POST",
      body: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    console.log("Transactions retrieved", data);
    return data.transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const savePlaidAccessToken = async (accessToken) => {
  const endpoint = `/plaid/savePlaidAccessToken`;
  return await apiRequest(endpoint, {
    method: "POST",
    body: { accessToken },
  });
};

// optional convenience export (not a function, but handy to import)
// remove if you don't need it
export const plaidAPI = {
  createLinkToken,
  createPublicToken,
  exchangePublicToken,
  refreshTransactions,
  getTransactions,
};
