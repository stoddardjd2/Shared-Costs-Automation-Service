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

  // Automatically stringify the body if it exists and isn't already a string
  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

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

export const handleVideoPromptHook = async (
  productDescription,
  template,
  generationMode = "template",
  additionalHookRules = "",
  painPoint = ""
) => {
  try {
    const data = await apiRequest(`/admin/video-prompts/hook`, {
      method: "POST",
      body: {
        productDescription,
        hookTemplate: template,
        generationMode,
        additionalHookRules,
        painPoint,
      },
    });
    return data;
  } catch (error) {
    console.error("Error creating hook:", error);
    throw error;
  }
};

export const handleVideoPromptPainPoint = async (
  productDescription,
  category = "uncategorized",
  existingPainPoints = []
) => {
  try {
    const data = await apiRequest(`/admin/video-prompts/pain-point`, {
      method: "POST",
      body: { productDescription, category, existingPainPoints },
    });
    return data;
  } catch (error) {
    console.error("Error creating pain point:", error);
    throw error;
  }
};

export const handleVideoPromptClothes = async (
  clothingIdea = "",
  character = ""
) => {
  try {
    const data = await apiRequest(`/admin/video-prompts/clothes`, {
      method: "POST",
      body: { clothingIdea, character },
    });
    return data;
  } catch (error) {
    console.error("Error creating clothes description:", error);
    throw error;
  }
};

export const handleCategorizeHookLibrary = async (hooks, productDescription) => {
  try {
    const data = await apiRequest(`/admin/video-prompts/categorize/hooks`, {
      method: "POST",
      body: { hooks, productDescription },
    });
    return data;
  } catch (error) {
    console.error("Error categorizing hooks:", error);
    throw error;
  }
};

export const handleCategorizePainPointLibrary = async (
  painPoints,
  productDescription
) => {
  try {
    const data = await apiRequest(`/admin/video-prompts/categorize/pain-points`, {
      method: "POST",
      body: { painPoints, productDescription },
    });
    return data;
  } catch (error) {
    console.error("Error categorizing pain points:", error);
    throw error;
  }
};

export const handleVideoPromptScript = async (body) => {
  try {
    const data = await apiRequest(`/admin/video-prompts/script`, {
      method: "POST",
      body: { ...body },
    });
    return data;
  } catch (error) {
    console.error("Error creating script:", error);
    throw error;
  }
};
