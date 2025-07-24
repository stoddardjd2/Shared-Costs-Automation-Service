import React, { useState, createContext, useContext } from "react";
import { plaidAPI } from "../services/plaidService";

const DataContext = createContext();

export const DataProvider = ({ children }) => {

  const [participants, setParticipants] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      avatar: "JD",
      color: "bg-sky-500",
      HELLO: "HELOO!",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 234-5678",
      avatar: "JS",
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1 (555) 345-6789",
      avatar: "MJ",
      color: "bg-pink-500",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      phone: "+1 (555) 456-7890",
      avatar: "SW",
      color: "bg-indigo-500",
    },
  ]);
  // costs represents requested payments
  const [costs, setCosts] = useState([
    {
      id: 1,
      name: "Netflix Subscription",
      amount: 15.99,
      isRecurring: true,
      plaidMatch: "Netflix",
      participants: [
        { userId: 1, status: "paid", paidAt: "2025-01-16" },
        { userId: 2, status: "pending" },
        { userId: 3, status: "paid", paidAt: "2025-01-17" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2025-01-15",
      lastMatched: "2025-01-15",
      frequency: "monthly",
      nextDue: "2025-02-15",
      paymentHistory: [
        {
          id: "payment_101",
          requestDate: "2025-01-15",
          dueDate: "2025-01-22",
          amount: 15.99,
          status: "partial", // paid, pending, overdue, partial
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2025-01-16", amount: 5.33 },
            {
              userId: 2,
              status: "pending",
              amount: 5.33,
              remindersSent: 1,
              lastReminderDate: "2025-01-20",
            },
            { userId: 3, status: "paid", paidDate: "2025-01-17", amount: 5.33 },
          ],
        },
        {
          id: "payment_102",
          requestDate: "2024-12-15",
          dueDate: "2024-12-22",
          amount: 15.99,
          status: "paid",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-12-16", amount: 5.33 },
            { userId: 2, status: "paid", paidDate: "2024-12-18", amount: 5.33 },
            { userId: 3, status: "paid", paidDate: "2024-12-17", amount: 5.33 },
          ],
        },
        {
          id: "payment_103",
          requestDate: "2024-11-15",
          dueDate: "2024-11-22",
          amount: 15.99,
          status: "paid",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-11-16", amount: 5.33 },
            { userId: 2, status: "paid", paidDate: "2024-11-19", amount: 5.33 },
            { userId: 3, status: "paid", paidDate: "2024-11-17", amount: 5.33 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Spotify Family Plan",
      amount: 19.99,
      isRecurring: true,
      plaidMatch: "Spotify",
      participants: [
        { userId: 1, status: "paid", paidAt: "2025-01-10" },
        { userId: 2, status: "overdue" },
        { userId: 3, status: "paid", paidAt: "2025-01-11" },
        { userId: 4, status: "pending" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2025-01-05",
      lastMatched: "2025-01-10",
      frequency: "monthly",
      nextDue: "2025-02-10",
      paymentHistory: [
        {
          id: "payment_201",
          requestDate: "2025-01-10",
          dueDate: "2025-01-17",
          amount: 19.99,
          status: "overdue",
          followUpSent: true,
          lastReminderSent: "2025-01-25",
          participants: [
            { userId: 1, status: "paid", paidDate: "2025-01-10", amount: 5.0 },
            {
              userId: 2,
              status: "overdue",
              amount: 5.0,
              remindersSent: 3,
              lastReminderDate: "2025-01-25",
            },
            { userId: 3, status: "paid", paidDate: "2025-01-11", amount: 5.0 },
            {
              userId: 4,
              status: "pending",
              amount: 4.99,
              remindersSent: 1,
              lastReminderDate: "2025-01-20",
            },
          ],
        },
        {
          id: "payment_202",
          requestDate: "2024-12-10",
          dueDate: "2024-12-17",
          amount: 19.99,
          status: "paid",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-12-11", amount: 5.0 },
            { userId: 2, status: "paid", paidDate: "2024-12-15", amount: 5.0 },
            { userId: 3, status: "paid", paidDate: "2024-12-12", amount: 5.0 },
            { userId: 4, status: "paid", paidDate: "2024-12-16", amount: 4.99 },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Internet Bill",
      amount: 89.99,
      isRecurring: true,
      plaidMatch: "Comcast",
      participants: [
        { userId: 1, status: "paid", paidAt: "2025-01-20" },
        { userId: 2, status: "paid", paidAt: "2025-01-21" },
        { userId: 3, status: "overdue" },
        { userId: 4, status: "overdue" },
        { userId: 5, status: "pending" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2024-12-01",
      lastMatched: "2025-01-20",
      frequency: "monthly",
      nextDue: "2025-02-20",
      paymentHistory: [
        {
          id: "payment_301",
          requestDate: "2025-01-20",
          dueDate: "2025-01-27",
          amount: 89.99,
          status: "overdue",
          followUpSent: true,
          lastReminderSent: "2025-02-05",
          participants: [
            { userId: 1, status: "paid", paidDate: "2025-01-20", amount: 18.0 },
            { userId: 2, status: "paid", paidDate: "2025-01-21", amount: 18.0 },
            {
              userId: 3,
              status: "overdue",
              amount: 18.0,
              remindersSent: 2,
              lastReminderDate: "2025-02-05",
            },
            {
              userId: 4,
              status: "overdue",
              amount: 18.0,
              remindersSent: 2,
              lastReminderDate: "2025-02-05",
            },
            {
              userId: 5,
              status: "pending",
              amount: 17.99,
              remindersSent: 1,
              lastReminderDate: "2025-01-30",
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Gym Membership",
      amount: 45.0,
      isRecurring: true,
      plaidMatch: "Planet Fitness",
      participants: [
        { userId: 1, status: "paid", paidAt: "2025-01-05" },
        { userId: 3, status: "paid", paidAt: "2025-01-06" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2024-11-15",
      lastMatched: "2025-01-05",
      frequency: "monthly",
      nextDue: "2025-02-05",
      paymentHistory: [
        {
          id: "payment_401",
          requestDate: "2025-01-05",
          dueDate: "2025-01-12",
          amount: 45.0,
          status: "paid",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2025-01-05", amount: 22.5 },
            { userId: 3, status: "paid", paidDate: "2025-01-06", amount: 22.5 },
          ],
        },
        {
          id: "payment_402",
          requestDate: "2024-12-05",
          dueDate: "2024-12-12",
          amount: 45.0,
          status: "paid",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-12-06", amount: 22.5 },
            { userId: 3, status: "paid", paidDate: "2024-12-07", amount: 22.5 },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Cloud Storage",
      amount: 9.99,
      isRecurring: true,
      plaidMatch: "Google",
      participants: [
        { userId: 1, status: "paid", paidAt: "2025-01-12" },
        { userId: 2, status: "paid", paidAt: "2025-01-13" },
        { userId: 4, status: "pending" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2024-10-01",
      lastMatched: "2025-01-12",
      frequency: "monthly",
      nextDue: "2025-02-12",
      paymentHistory: [
        {
          id: "payment_501",
          requestDate: "2025-01-12",
          dueDate: "2025-01-19",
          amount: 9.99,
          status: "partial",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2025-01-12", amount: 3.33 },
            { userId: 2, status: "paid", paidDate: "2025-01-13", amount: 3.33 },
            { userId: 4, status: "pending", amount: 3.33, remindersSent: 0 },
          ],
        },
      ],
    },
    {
      id: 6,
      name: "Annual Software License",
      amount: 240.0,
      isRecurring: true,
      plaidMatch: "Adobe",
      participants: [
        { userId: 1, status: "paid", paidAt: "2024-12-15" },
        { userId: 2, status: "paid", paidAt: "2024-12-16" },
        { userId: 3, status: "paid", paidAt: "2024-12-17" },
        { userId: 4, status: "pending" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2024-11-01",
      lastMatched: "2024-12-15",
      frequency: "yearly",
      nextDue: "2025-12-15",
      paymentHistory: [
        {
          id: "payment_601",
          requestDate: "2024-12-15",
          dueDate: "2024-12-22",
          amount: 240.0,
          status: "partial",
          followUpSent: true,
          lastReminderSent: "2025-01-15",
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-12-15", amount: 60.0 },
            { userId: 2, status: "paid", paidDate: "2024-12-16", amount: 60.0 },
            { userId: 3, status: "paid", paidDate: "2024-12-17", amount: 60.0 },
            {
              userId: 4,
              status: "pending",
              amount: 60.0,
              remindersSent: 2,
              lastReminderDate: "2025-01-15",
            },
          ],
        },
      ],
    },
    {
      id: 7,
      name: "Food Delivery Service",
      amount: 25.99,
      isRecurring: true,
      plaidMatch: "DoorDash",
      participants: [
        { userId: 1, status: "paid", paidAt: "2025-01-08" },
        { userId: 2, status: "overdue" },
        { userId: 3, status: "overdue" },
        { userId: 5, status: "paid", paidAt: "2025-01-10" },
      ],
      splitType: "equal",
      customSplits: {},
      createdAt: "2024-09-01",
      lastMatched: "2025-01-08",
      frequency: "monthly",
      nextDue: "2025-02-08",
      isDynamic: true,

      paymentHistory: [
        {
          id: "payment_701",
          requestDate: "2025-01-08",
          dueDate: "2025-01-15",
          amount: 25.99,
          status: "overdue",
          followUpSent: true,
          lastReminderSent: "2025-02-01",
          participants: [
            { userId: 1, status: "paid", paidDate: "2025-01-08", amount: 6.5 },
            {
              userId: 2,
              status: "overdue",
              amount: 6.5,
              remindersSent: 4,
              lastReminderDate: "2025-02-01",
            },
            {
              userId: 3,
              status: "overdue",
              amount: 6.5,
              remindersSent: 3,
              lastReminderDate: "2025-01-28",
            },
            { userId: 5, status: "paid", paidDate: "2025-01-10", amount: 6.49 },
          ],
        },
        {
          id: "payment_702",
          requestDate: "2024-12-08",
          dueDate: "2024-12-15",
          amount: 25.99,
          status: "paid",
          followUpSent: false,
          lastReminderSent: null,
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-12-08", amount: 6.5 },
            { userId: 2, status: "paid", paidDate: "2024-12-12", amount: 6.5 },
            { userId: 3, status: "paid", paidDate: "2024-12-14", amount: 6.5 },
            { userId: 5, status: "paid", paidDate: "2024-12-09", amount: 6.49 },
          ],
        },
        {
          id: "payment_703",
          requestDate: "2024-11-08",
          dueDate: "2024-11-15",
          amount: 25.99,
          status: "overdue",
          followUpSent: true,
          lastReminderSent: "2024-11-25",
          participants: [
            { userId: 1, status: "paid", paidDate: "2024-11-08", amount: 6.5 },
            {
              userId: 2,
              status: "overdue",
              amount: 6.5,
              remindersSent: 2,
              lastReminderDate: "2024-11-25",
            },
            { userId: 3, status: "paid", paidDate: "2024-11-18", amount: 6.5 },
            { userId: 5, status: "paid", paidDate: "2024-11-09", amount: 6.49 },
          ],
        },
      ],
    },
  ]);

  const [bankTransactions, setBankTransactions] = useState([]);
  const [plaidAccessToken, setPlaidAccessToken] = useState(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const addParticipant = (participant) => {
    const colors = [
      // "bg-blue-500",
      "bg-purple-500",
      // "bg-green-500",
      "bg-pink-500",
      "bg-indigo-500",
      // "bg-red-500",
      "bg-yellow-500",
      // "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-rose-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-lime-500",
      "bg-sky-500",
      "bg-fuchsia-500",
      "bg-slate-500",
    ];

    const newParticipant = {
      ...participant,
      id: Date.now(),
      color: colors[Math.floor(Math.random() * colors.length)],
      avatar: participant.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    };
    setParticipants((prev) => [...prev, newParticipant]);
    return newParticipant;
  };

  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setCosts((prev) =>
      prev.map((cost) => ({
        ...cost,
        participants: cost.participants.filter((p) => p.userId !== id),
      }))
    );
  };

  // const addCost = (costData) => {
  //   const newCost = {
  //     ...costData,
  //     id: Date.now(),
  //     createdAt: new Date().toISOString().split("T")[0],
  //   };
  //   setCosts((prev) => [...prev, newCost]);
  //   return newCost;
  // };

  const updateCost = (id, updates) => {
    console.log("Updating cost with ID:", id, "Updates:", updates);
    setCosts((prev) =>
      prev.map((cost) => (cost.id === id ? { ...cost, ...updates } : cost))
    );
  };

  const connectPlaid = async () => {
    try {
      setIsLoadingTransactions(true);

      const publicToken = await plaidAPI.createPublicToken();
      const accessToken = await plaidAPI.exchangePublicToken(publicToken);
      setPlaidAccessToken(accessToken);

      // const endDate = new Date().toISOString().split('T')[0];
      // const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // refresh transactions
      await plaidAPI.refreshTransactions(accessToken);

      const transactions = await plaidAPI.getTransactions(accessToken);
      console.log("Fetched transactions:", transactions);
      // const transactions = await plaidAPI.getTransactions(accessToken, startDate, endDate);

      const formattedTransactions = transactions.map((transaction) => ({
        id: transaction.transaction_id,
        description: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        matched: !transaction.pending, // true if not pending
        category: transaction.personal_finance_category?.primary || "Other",
      }));

      console.log("Formatted transactions:", formattedTransactions);
      setBankTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error connecting to Plaid:", error);
      alert("Error connecting to bank. Using demo data instead.");

      setBankTransactions([
        // {
        //   id: 1,
        //   description: "Netflix",
        //   amount: 15.99,
        //   date: "2025-01-15",
        //   matched: true,
        //   category: "Entertainment",
        // },
        // {
        //   id: 2,
        //   description: "Netflix",
        //   amount: 18.99,
        //   date: "2024-12-15",
        //   matched: true,
        //   category: "Entertainment",
        // },
        // {
        //   id: 3,
        //   description: "Spotify Premium",
        //   amount: 9.99,
        //   date: "2025-01-10",
        //   matched: true,
        //   category: "Entertainment",
        // },
        // {
        //   id: 4,
        //   description: "Electric Company",
        //   amount: 187.45,
        //   date: "2025-01-08",
        //   matched: true,
        //   category: "Utilities",
        // },
        // {
        //   id: 5,
        //   description: "Electric Company",
        //   amount: 127.45,
        //   date: "2024-12-08",
        //   matched: true,
        //   category: "Utilities",
        // },
        // {
        //   id: 6,
        //   description: "Internet Service Provider",
        //   amount: 89.99,
        //   date: "2025-01-05",
        //   matched: true,
        //   category: "Utilities",
        // },
        // {
        //   id: 7,
        //   description: "Disney Plus",
        //   amount: 7.99,
        //   date: "2025-01-12",
        //   matched: false,
        //   category: "Entertainment",
        // },
        // {
        //   id: 8,
        //   description: "Amazon Prime",
        //   amount: 14.99,
        //   date: "2025-01-08",
        //   matched: false,
        //   category: "Shopping",
        // },
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
    setCosts,
    updateCost,
    connectPlaid,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
