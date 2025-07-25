export default function generateCostEntry({
  selectedCharge,
  newChargeDetails,
  selectedPeople,
  splitType,
  customAmounts,
  recurringType,
  customInterval,
  customUnit,
  totalSplit,
}) {
  // Helper function to get frequency from recurring type
  const getFrequency = () => {
    switch (recurringType) {
      case "daily":
        return "daily";
      case "weekly":
        return "weekly";
      case "monthly":
        return "monthly";
      case "yearly":
        return "yearly";
      case "custom":
        if (customInterval === 1) {
          switch (customUnit) {
            case "days":
              return "daily";
            case "weeks":
              return "weekly";
            case "months":
              return "monthly";
            case "years":
              return "yearly";
            default:
              return `every-${customUnit.slice(0, -1)}`;
          }
        } else {
          return `every-${customInterval}-${customUnit}`;
        }
      default:
        return "one-time";
    }
  };

  // Helper function to calculate next due date
  const getNextDueDate = () => {
    if (recurringType === "none") return null;

    const now = new Date();
    const nextDue = new Date(now);

    switch (recurringType) {
      case "daily":
        nextDue.setDate(now.getDate() + 1);
        break;
      case "weekly":
        nextDue.setDate(now.getDate() + 7);
        break;
      case "monthly":
        nextDue.setMonth(now.getMonth() + 1);
        break;
      case "yearly":
        nextDue.setFullYear(now.getFullYear() + 1);
        break;
      case "custom":
        switch (customUnit) {
          case "days":
            nextDue.setDate(now.getDate() + customInterval);
            break;
          case "weeks":
            nextDue.setDate(now.getDate() + customInterval * 7);
            break;
          case "months":
            nextDue.setMonth(now.getMonth() + customInterval);
            break;
          case "years":
            nextDue.setFullYear(now.getFullYear() + customInterval);
            break;
        }
        break;
      default:
        return null;
    }

    return nextDue.toISOString().split("T")[0];
  };

  // Generate custom splits object based on split type
  const generateCustomSplits = () => {
    const splits = {};

    if (splitType === "custom") {
      // Custom amounts for each person
      selectedPeople.forEach((person) => {
        const amount = customAmounts[person.id] || 0;
        splits[person.id] = Number(amount);
      });
    } else if (splitType === "customTotal") {
      // Custom total split equally
      const totalAmount = Number(customAmounts["total"] || 0);
      const perPersonAmount = totalAmount / selectedPeople.length;
      selectedPeople.forEach((person) => {
        splits[person.id] = perPersonAmount;
      });
    } else {
      // Equal split
      const perPersonAmount = totalSplit / selectedPeople.length;
      selectedPeople.forEach((person) => {
        splits[person.id] = perPersonAmount;
      });
    }

    return splits;
  };

  // Generate participants array
  const participants = selectedPeople.map((person) => ({
    userId: person.id,
    status: "pending", // Default status for new requests
    // paidAt will be added when status changes to "paid"
  }));

  // Get charge details
  const chargeName =
    selectedCharge?.name ||
    newChargeDetails?.customName ||
    newChargeDetails?.name ||
    "Untitled Charge";

  const chargeAmount =
    splitType === "customTotal"
      ? Number(customAmounts["total"] || 0)
      : selectedCharge?.lastAmount || totalSplit || 0;

  const currentDate = new Date().toISOString().split("T")[0];

  return {
    name: chargeName,
    amount: chargeAmount,
    isRecurring: recurringType !== "none",
    plaidMatch: selectedCharge?.plaidMatch || null,
    participants: participants,
    splitType: splitType,
    customSplits: generateCustomSplits(),
    createdAt: currentDate,
    lastMatched: selectedCharge?.lastMatched || currentDate,
    frequency: getFrequency(),
    nextDue: getNextDueDate(),

    // paymentHistory: [
    //   {
    //     id: "payment_101",
    //     requestDate: "2025-01-15",
    //     dueDate: "2025-01-22",
    //     amount: 15.99,
    //     status: "partial", // paid, pending, overdue, partial
    //     followUpSent: false,
    //     lastReminderSent: null,
    //     participants: [
    //       { userId: 1, status: "paid", paidDate: "2025-01-16", amount: 5.33 },
    //       {
    //         userId: 2,
    //         status: "pending",
    //         amount: 5.33,
    //         remindersSent: 1,
    //         lastReminderDate: "2025-01-20",
    //       },
    //       { userId: 3, status: "paid", paidDate: "2025-01-17", amount: 5.33 },
    //     ],
    //   },
    // ],

    
    // Additional metadata that might be useful
    // metadata: {
    //   recurringType,
    //   customInterval: recurringType === "custom" ? customInterval : null,
    //   customUnit: recurringType === "custom" ? customUnit : null,
    //   totalSplit,
    //   originalChargeAmount: selectedCharge?.lastAmount || 0,
    // }
  };
}
