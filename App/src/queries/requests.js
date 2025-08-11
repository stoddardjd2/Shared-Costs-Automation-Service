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
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle different content types
    let data;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Return error object instead of throwing
      return {
        success: false,
        error: {
          status: response.status,
          statusText: response.statusText,
          message:
            data?.message || `Request failed with status ${response.status}`,
          code: data?.code || "HTTP_ERROR",
          data: data,
        },
      };
    }

    // Return success object
    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    // Log error for debugging (optional - remove in production if needed)
    console.error("API request failed:", error);

    // Return error object for network/parsing errors
    return {
      success: false,
      error: {
        message: error.message || "Network or parsing error occurred",
        code: "NETWORK_ERROR",
        originalError: error,
      },
    };
  }
};

// Enhanced API functions

export const getRequests = async () => {
  const result = await apiRequest("/requests", {
    method: "GET",
  });

  if (result.success) {
    // Handle success
    console.log("Data received:", result.data);
    return result.data;
  } else {
    // Handle error gracefully without crashing
    console.log("Request failed:", result.error.message);

    // Return null or default value
    return null;
  }
};

export const getRequest = async (requestId) => {
  const result = await apiRequest(`/requests/${requestId}`, { method: "GET" });
  if (result.success) {
    // Handle success
    console.log("Data received:", result.data);
    return result.data;
  } else {
    // Handle error gracefully without crashing
    console.log("Request failed:", result.error.message);

    // Return null or default value
    return null;
  }
};

export const createRequest = async (requestData) => {
  const result = await apiRequest("/requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });

  if (result.success) {
    // Handle success
    console.log("Data received:", result.data);
    return result.data;
  } else {
    // Handle error gracefully without crashing
    console.log("Request failed:", result.error.message);
    // Return null or default value
    return null;
  }
};


export const updateRequest = async (requestId, requestData) => {
  const result = await apiRequest(`/requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify(requestData),
  });

  if (result.success) {
    // Handle success
    console.log("Data received:", result.data);
    return result.data;
  } else {
    // Handle error gracefully without crashing
    console.log("Request failed:", result.error.message);
    // Return null or default value
    return null;
  }
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
