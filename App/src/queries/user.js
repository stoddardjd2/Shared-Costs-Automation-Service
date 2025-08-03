import getAPIUrl from "./config";

const API_URL = getAPIUrl();

const getToken = () => localStorage.getItem("token");

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    method: options.method || "GET",
    ...options, // ← spread options FIRST
  };

  // Then override .body to ensure it's JSON if present
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const addContact = async (body = {}, queryParams = {}) => {
  console.log("BOXDY", body);
  const query = new URLSearchParams(queryParams).toString();
  const endpoint = `/users/contact${query ? `?${query}` : ""}`;
  return apiRequest(endpoint, {
    method: "POST",
    body,
  });
};

export const getUserData = async (body = {}, queryParams = {}) => {
  const query = new URLSearchParams(queryParams).toString();
  const endpoint = `/users/data${query ? `?${query}` : ""}`;
  return apiRequest(endpoint, {
    method: "GET",
  });
};
