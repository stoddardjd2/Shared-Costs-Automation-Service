export const detectOvercharge = (currentAmount, historicalAmounts) => {
  if (historicalAmounts.length === 0) return null;

  const avgAmount =
    historicalAmounts.reduce((sum, amt) => sum + amt, 0) /
    historicalAmounts.length;
  const threshold = avgAmount * 1.2;

  if (currentAmount > threshold) {
    const percentIncrease = (
      ((currentAmount - avgAmount) / avgAmount) *
      100
    ).toFixed(1);
    return {
      isOvercharge: true,
      percentIncrease,
      averageAmount: avgAmount.toFixed(2),
      difference: (currentAmount - avgAmount).toFixed(2),
    };
  }

  return null;
};

export const getFrequencyColor = (frequency) => {
  console.log("FREQUENCY:", frequency);
  switch (frequency) {
    case "daily":
      return "bg-teal-100 text-teal-800";

    case "weekly":
      return "bg-purple-100 text-purple-800";
    case "monthly":
      return "bg-blue-100 text-blue-800";
    case "quarterly":
      return "bg-green-100 text-green-800";
    case "yearly":
      return "bg-orange-100 text-orange-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getNextDueStatus = (nextDue) => {
  if (!nextDue) return null;

  const today = new Date();
  const dueDate = new Date(nextDue);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "overdue",
      color: "text-red-600",
      text: `${Math.abs(diffDays)} days overdue`,
    };
  } else if (diffDays === 0) {
    return { status: "today", color: "text-orange-600", text: "Due today" };
  } else if (diffDays <= 3) {
    return {
      status: "soon",
      color: "text-yellow-600",
      text: `Due in ${diffDays} days`,
    };
  } else {
    return {
      status: "upcoming",
      color: "text-gray-600",
      text: `Due in ${diffDays} days`,
    };
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "overdue":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};
