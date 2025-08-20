
export const plaidAPI = {
  async createPublicToken() {
    console.log("Creating public token...");
    try {
      const response = await fetch(
        ` http://localhost:3001/api/sandbox/public_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("Public token created:", data.public_token);
      return data.public_token;
    } catch (error) {
      console.error("Error creating public token:", error);
      throw error;
    }
  },

  async exchangePublicToken(publicToken) {
    console.log("Getting access token...");
    try {
      const response = await fetch(`http://localhost:3001/api/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_token: publicToken,
        }),
      });
      const data = await response.json();
      console.log("data", data);
      console.log("Access token created:", data.access_token);
      return data.access_token;
    } catch (error) {
      console.error("Error creating access token:", error);
      throw error;
    }
  },

  async refreshTransactions(accessToken) {
    console.log("refreshing transactions...");
    try {
      const response = await fetch(`http://localhost:3001/api/transactions/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      });
      const data = await response.json();
      console.log("Transactions refreshed", data);
      return data.access_token;
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      throw error;
    }
  },

  async getTransactions(accessToken, startDate, endDate) {
    console.log("Getting transactinos...");
    try {
      const response = await fetch(`http://localhost:3001/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const data = await response.json();
      console.log("Transactions retrieved", data);
      return data.transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
};
