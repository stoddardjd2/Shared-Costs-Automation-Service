import getAPIUrl from "../config";

const API_URL = getAPIUrl();
const getToken = () => localStorage.getItem("token");

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  // Extract before modifying
  const { body, headers: optionHeaders, method, ...restOptions } = options;

  // Start with default headers
  let headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(optionHeaders || {}),
  };

  // ⚠ Handle FormData vs JSON
  if (body instanceof FormData) {
    // ❗ Remove JSON content-type so browser sets multipart boundary
    if (headers["Content-Type"]) delete headers["Content-Type"];
  } else {
    // JSON request
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: method || "GET",
    body,
    headers,
    ...restOptions,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Try parse JSON safely
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `HTTP error ${response.status}`
      );
    }

    return data;
  } catch (err) {
    console.error("API request failed:", err);
    throw err;
  }
};

export async function uploadToTikTok(formData) {
  return apiRequest("/tiktok/post", {
    method: "POST",
    body: formData,
  });
}

export async function loginToTiktok() {
  return apiRequest("/tiktok/login", {
    method: "GET",
  });
}
