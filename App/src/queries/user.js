import getAPIUrl from "../config";

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

export const addContact = async (body = {}) => {
  const endpoint = `/users/contact`;
  return apiRequest(endpoint, {
    method: "POST",
    body,
  });
};

export const getUserData = async () => {
  const endpoint = `/users/data`;
  return apiRequest(endpoint, {
    method: "GET",
  });
};

export const smsOptIn = async (userId, rawPhone, isAllowed) => {
  const endpoint = `/users/sms/user-consent/${userId}`;
  return await apiRequest(endpoint, {
    method: "PATCH",
    body: { phone: rawPhone, isAllowed },
  });
};

export const addPaymentMethod = async (paymentMethod, paymentAddress) => {
  console.log("SENDING TO BACKEND WITH", paymentAddress, paymentMethod)
  const endpoint = `/users/addPaymentMethod`;
  return await apiRequest(endpoint, {
    method: "POST",
    body: {paymentMethod, paymentAddress},
  });
};
