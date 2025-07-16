import { useState } from 'react';

export const useSplitState = () => {
  const [splitType, setSplitType] = useState('equal');
  const [totalAmount, setTotalAmount] = useState('');
  const [customAmounts, setCustomAmounts] = useState({});
  const [showSplitPanel, setShowSplitPanel] = useState(false);

  const updateCustomAmount = (personId, amount) => {
    console.log("Updating custom amount for person:", personId, "Amount:", amount);
    setCustomAmounts(prev => ({
      ...prev,
      [personId]: amount
    }));
  };

  const calculateSplitAmounts = (selectedPeople) => {
    if (!selectedPeople || selectedPeople.length === 0) return {};
    
    if (splitType === 'equal') {
      const total = parseFloat(totalAmount) || 0;
      const perPerson = total / selectedPeople.length;
      return selectedPeople.reduce((acc, person) => {
        acc[person.id] = perPerson;
        return acc;
      }, {});
    } else if (splitType === 'custom') {
      return customAmounts;
    } else if (splitType === 'customTotal') {
      const customTotal = Object.values(customAmounts).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
      const perPerson = customTotal / selectedPeople.length;
      return selectedPeople.reduce((acc, person) => {
        acc[person.id] = perPerson;
        return acc;
      }, {});
    }
    return {};
  };

  return {
    splitType,
    setSplitType,
    totalAmount,
    setTotalAmount,
    customAmounts,
    setCustomAmounts,
    showSplitPanel,
    setShowSplitPanel,
    updateCustomAmount,
    calculateSplitAmounts
  };
};
