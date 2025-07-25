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
    ...options,
  };

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

// Enhanced API functions
export const getRequests = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const endpoint = `/requests${queryParams ? `?${queryParams}` : ""}`;
  return apiRequest(endpoint, { method: "GET" });
};

export const getRequest = async (requestId) => {
  return apiRequest(`/requests/${requestId}`, { method: "GET" });
};


export const createRequest = async (requestData) => {
  return apiRequest("/requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
};

export const updateRequest = async (requestId, requestData) => {
  return apiRequest(`/requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify(requestData),
  });
};

export const updateDynamicCost = async (requestId, amount, reason = "") => {
  return apiRequest(`/requests/${requestId}/dynamic-cost`, {
    method: "PUT",
    body: JSON.stringify({ amount, reason }),
  });
};

export const deleteRequest = async (requestId) => {
  return apiRequest(`/requests/${requestId}`, { method: "DELETE" });
};

export const markParticipantPaid = async (
  requestId,
  participantId,
  paymentHistoryId = null
) => {
  return apiRequest(
    `/requests/${requestId}/participants/${participantId}/paid`,
    {
      method: "PUT",
      body: JSON.stringify({ paymentHistoryId }),
    }
  );
};

export const createPaymentCycle = async (requestId) => {
  return apiRequest(`/requests/${requestId}/payment-cycle`, { method: "POST" });
};
