const PLAID_CONFIG = {
  clientId: '686ee94862386b0024d2cbcd',
  secret: 'c18250107468c87adf2934e95d0358',
  baseUrl: 'https://sandbox.plaid.com'
};

export const plaidAPI = {
  async createPublicToken() {
    try {
      const response = await fetch(`${PLAID_CONFIG.baseUrl}/sandbox/public_token/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: PLAID_CONFIG.clientId,
          secret: PLAID_CONFIG.secret,
          institution_id: 'ins_109508',
          initial_products: ['transactions'],
          public_key: 'sandbox'
        })
      });
      
      const data = await response.json();
      return data.public_token;
    } catch (error) {
      console.error('Error creating public token:', error);
      throw error;
    }
  },

  async exchangePublicToken(publicToken) {
    try {
      const response = await fetch(`${PLAID_CONFIG.baseUrl}/link/token/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: PLAID_CONFIG.clientId,
          secret: PLAID_CONFIG.secret,
          public_token: publicToken
        })
      });
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  },

  async getTransactions(accessToken, startDate, endDate) {
    try {
      const response = await fetch(`${PLAID_CONFIG.baseUrl}/transactions/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: PLAID_CONFIG.clientId,
          secret: PLAID_CONFIG.secret,
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          count: 100
        })
      });
      
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }
};
