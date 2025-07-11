import React, { useState, createContext, useContext } from 'react';
import { plaidAPI } from '../services/plaidService';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', avatar: 'MJ' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', avatar: 'SW' }
  ]);

  const [costs, setCosts] = useState([
    {
      id: 1,
      name: 'Netflix Subscription',
      amount: 15.99,
      isRecurring: true,
      plaidMatch: 'Netflix',
      participants: [
        { userId: 1, status: 'paid', paidAt: '2025-01-16' },
        { userId: 2, status: 'pending' },
        { userId: 3, status: 'paid', paidAt: '2025-01-17' }
      ],
      splitType: 'equal',
      customSplits: {},
      createdAt: '2025-01-15',
      lastMatched: '2025-01-15',
      frequency: 'monthly',
      nextDue: '2025-02-15'
    },
    {
      id: 2,
      name: 'Electric Utility',
      amount: 127.45,
      isRecurring: true,
      plaidMatch: 'Electric Company',
      participants: [
        { userId: 1, status: 'paid', paidAt: '2025-01-09' },
        { userId: 2, status: 'paid', paidAt: '2025-01-10' },
        { userId: 4, status: 'overdue' }
      ],
      splitType: 'equal',
      customSplits: {},
      createdAt: '2024-12-08',
      lastMatched: '2025-01-08',
      frequency: 'monthly',
      nextDue: '2025-02-08'
    },
    {
      id: 3,
      name: 'Spotify Premium',
      amount: 9.99,
      isRecurring: true,
      plaidMatch: 'Spotify',
      participants: [
        { userId: 1, status: 'paid', paidAt: '2025-01-10' },
        { userId: 2, status: 'paid', paidAt: '2025-01-10' },
        { userId: 3, status: 'paid', paidAt: '2025-01-11' },
        { userId: 4, status: 'pending' }
      ],
      splitType: 'equal',
      customSplits: {},
      createdAt: '2024-12-10',
      lastMatched: '2025-01-10',
      frequency: 'monthly',
      nextDue: '2025-02-10'
    },
    {
      id: 4,
      name: 'Dinner at Italian Restaurant',
      amount: 85.50,
      isRecurring: false,
      participants: [
        { userId: 1, status: 'paid', paidAt: '2025-01-12' },
        { userId: 2, status: 'pending' },
        { userId: 3, status: 'pending' }
      ],
      splitType: 'equal',
      customSplits: {},
      createdAt: '2025-01-12'
    }
  ]);

  const [bankTransactions, setBankTransactions] = useState([]);
  const [plaidAccessToken, setPlaidAccessToken] = useState(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const addParticipant = (participant) => {
    const newParticipant = {
      ...participant,
      id: Date.now(),
      avatar: participant.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    setParticipants(prev => [...prev, newParticipant]);
    return newParticipant;
  };

  const removeParticipant = (id) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    setCosts(prev => prev.map(cost => ({
      ...cost,
      participants: cost.participants.filter(p => p.userId !== id)
    })));
  };

  const addCost = (costData) => {
    const newCost = {
      ...costData,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCosts(prev => [...prev, newCost]);
    return newCost;
  };

  const updateCost = (id, updates) => {
    setCosts(prev => prev.map(cost => 
      cost.id === id ? { ...cost, ...updates } : cost
    ));
  };

  const connectPlaid = async () => {
    try {
      setIsLoadingTransactions(true);
      
      const publicToken = await plaidAPI.createPublicToken();
      const accessToken = await plaidAPI.exchangePublicToken(publicToken);
      setPlaidAccessToken(accessToken);
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const transactions = await plaidAPI.getTransactions(accessToken, startDate, endDate);
      
      const formattedTransactions = transactions.map(t => ({
        id: t.transaction_id,
        description: t.name,
        amount: Math.abs(t.amount),
        date: t.date,
        category: t.category?.[0] || 'Other',
        merchant: t.merchant_name,
        matched: false
      }));
      
      setBankTransactions(formattedTransactions);
      
    } catch (error) {
      console.error('Error connecting to Plaid:', error);
      alert('Error connecting to bank. Using demo data instead.');
      
      setBankTransactions([
        { id: 1, description: 'Netflix', amount: 15.99, date: '2025-01-15', matched: true, category: 'Entertainment' },
        { id: 2, description: 'Netflix', amount: 18.99, date: '2024-12-15', matched: true, category: 'Entertainment' },
        { id: 3, description: 'Spotify Premium', amount: 9.99, date: '2025-01-10', matched: true, category: 'Entertainment' },
        { id: 4, description: 'Electric Company', amount: 187.45, date: '2025-01-08', matched: true, category: 'Utilities' },
        { id: 5, description: 'Electric Company', amount: 127.45, date: '2024-12-08', matched: true, category: 'Utilities' },
        { id: 6, description: 'Internet Service Provider', amount: 89.99, date: '2025-01-05', matched: true, category: 'Utilities' },
        { id: 7, description: 'Disney Plus', amount: 7.99, date: '2025-01-12', matched: false, category: 'Entertainment' },
        { id: 8, description: 'Amazon Prime', amount: 14.99, date: '2025-01-08', matched: false, category: 'Shopping' }
      ]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const value = {
    participants,
    costs,
    bankTransactions,
    plaidAccessToken,
    isLoadingTransactions,
    addParticipant,
    removeParticipant,
    addCost,
    updateCost,
    connectPlaid
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
