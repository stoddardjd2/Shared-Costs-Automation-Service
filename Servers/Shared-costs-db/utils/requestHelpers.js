const calculateNextReminderDate = (
  nextDueDate,
  reminderFrequency
) => {
  if (!reminderFrequency || reminderFrequency === "none" || !nextDueDate) {
    return null;
  }

  const dueDate = new Date(nextDueDate);

  switch (reminderFrequency) {
    case "daily":
      return new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      const monthlyDate = new Date(dueDate);
      monthlyDate.setMonth(monthlyDate.getMonth() + 1);
      return monthlyDate;
    default:
      return null;
  }
};

// JavaScript Implementation
function calculateDueDate(daysFromNow, startDate = new Date()) {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + daysFromNow);
  return dueDate;
}

module.exports = {
  calculateNextReminderDate,
  calculateDueDate,
};
