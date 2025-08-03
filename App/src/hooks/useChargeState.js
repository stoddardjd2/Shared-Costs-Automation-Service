import { useState } from "react";

export const useChargeState = () => {
  const [chargeType, setChargeType] = useState("");
  const [chargeSearchQuery, setChargeSearchQuery] = useState("");
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [newChargeDetails, setNewChargeDetails] = useState({
    name: "",
    // customName: "",
    lastAmount: "",
    lastDate: "",
    frequency: "monthly",
  });
  const [isManualCharge, setIsManualCharge] = useState(null);
  const [existingCharges] = useState([
    {
      id: 1,
      name: "Netflix",
      lastAmount: 18.99,
      lastDate: "2025-07-01",
      frequency: "Monthly",
      matchCount: 12,
      plaidMatch: "Netflix Subscription",
    },
    {
      id: 2,
      name: "Spotify Premium",
      lastAmount: 15.99,
      lastDate: "2025-06-28",
      frequency: "Monthly",
      matchCount: 8,
      plaidMatch: "Spotify",
    },
    {
      id: 3,
      name: "Amazon Prime",
      lastAmount: 139.0,
      lastDate: "2025-01-15",
      frequency: "Yearly",
      matchCount: 2,
      plaidMatch: "Amazon Prime",
    },
    {
      id: 4,
      name: "Uber Eats",
      lastAmount: 34.5,
      lastDate: "2025-07-10",
      frequency: "Weekly",
      matchCount: 24,
      plaidMatch: "Uber Eats",
    },
  ]);

  const filteredCharges = existingCharges.filter((charge) =>
    charge.name.toLowerCase().includes(chargeSearchQuery.toLowerCase())
  );

  return {
    chargeType,
    setChargeType,
    chargeSearchQuery,
    setChargeSearchQuery,
    selectedCharge,
    setSelectedCharge,
    newChargeDetails,
    setNewChargeDetails,
    existingCharges,
    filteredCharges,
    setIsManualCharge,
    isManualCharge,
  };
};
