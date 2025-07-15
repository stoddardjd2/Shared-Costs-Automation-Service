import { useState } from 'react';

export const useChargeState = () => {
  const [chargeType, setChargeType] = useState('');
  const [chargeSearchQuery, setChargeSearchQuery] = useState('');
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [newChargeDetails, setNewChargeDetails] = useState({
    name: '',
    customName: '',
    lastAmount: '',
    lastDate: '',
    frequency: 'monthly'
  });

  const [existingCharges] = useState([
    { 
      id: 1, 
      name: 'Netflix', 
      lastAmount: 18.99, 
      lastDate: '2025-07-01', 
      frequency: 'Monthly',
      matchCount: 12 
    },
    { 
      id: 2, 
      name: 'Spotify Premium', 
      lastAmount: 15.99, 
      lastDate: '2025-06-28', 
      frequency: 'Monthly',
      matchCount: 8 
    },
    { 
      id: 3, 
      name: 'Amazon Prime', 
      lastAmount: 139.00, 
      lastDate: '2025-01-15', 
      frequency: 'Yearly',
      matchCount: 2 
    },
    { 
      id: 4, 
      name: 'Uber Eats', 
      lastAmount: 34.50, 
      lastDate: '2025-07-10', 
      frequency: 'Weekly',
      matchCount: 24 
    }
  ]);

  const filteredCharges = existingCharges.filter(charge =>
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
    filteredCharges
  };
};
