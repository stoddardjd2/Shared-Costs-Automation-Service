const API_URL = "http://localhost:3002/api";

// Simple function to create user - call directly from React components
const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      //   throw new Error(data.message || "Failed to create user");
      console.log("Signup failed", data.message);
    }

    // Store token in localStorage if registration is successful
    if (data.success && data.data.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Login function (bonus)
const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      //   throw new Error(data.message || "Login failed");
      console.log("Login failed", data.message);
      return false;
    }

    // Store token in localStorage if login is successful
    if (data.success && data.data.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Forgot Password - Send reset email
const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send reset email");
    }

    return data;
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error;
  }
};

// Reset Password - With token
const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/users/reset-password/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

const verifyToken = async (token) => {
  console.log("VERIFYT TIME", token);
  try {
    const response = await fetch(`${API_URL}/users/check-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("verification failed", data.message);
      return false;
    }

    // clear token if expired
    if (!data.success) {
      console.log("expired token, login again");
      localStorage.removeItem("token");
      return false;
    }
    return data.data.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
export {
  createUser,
  loginUser,
  resetPassword,
  forgotPassword,
  verifyToken,
  API_URL,
};
