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
  startTiming,
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

    // Strip time from a Date in local timezone
    function toLocalMidnight(date) {
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0
      );
    }

    // Parse 'YYYY-MM-DD' as a local calendar date at midnight
    function localFromYMD(ymd) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        throw new Error("Date must be 'YYYY-MM-DD'");
      }
      const [y, m, d] = ymd.split("-").map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0); // local midnight
    }

    // Add whole calendar units (days/weeks/months/years) in local time
    function addLocalUnits(base, count, unit) {
      // Work from a clean local-midnight copy
      const dt = toLocalMidnight(base);

      switch (unit) {
        case "days":
          dt.setDate(dt.getDate() + count);
          break;
        case "weeks":
          dt.setDate(dt.getDate() + count * 7);
          break;
        case "months":
          dt.setMonth(dt.getMonth() + count);
          break;
        case "years":
          dt.setFullYear(dt.getFullYear() + count);
          break;
        default:
          throw new Error("Unsupported unit");
      }
      return dt;
    }

    // --- Today in local time (date-only) ---
    const now = new Date();
    const todayLocalMidnight = toLocalMidnight(now); // e.g. 11/30/2025 00:00 local

    // --- Anchor base date (in local time) ---
    const baseLocal =
      startTiming === "now" || !startTiming
        ? todayLocalMidnight
        : localFromYMD(startTiming);

    // If explicit start date is in the future (local), first due is that date
    if (startTiming !== "now" && baseLocal > todayLocalMidnight) {
      // Return local midnight of that start date
      return baseLocal;
    }

    // --- Determine step ---
    let count = 1;
    let unit;

    switch (recurringType) {
      case "daily":
        unit = "days";
        break;
      case "weekly":
        unit = "weeks";
        break;
      case "biweekly":
        unit = "weeks";
        count = 2;
        break;
      case "monthly":
        unit = "months";
        break;
      case "yearly":
        unit = "years";
        break;
      case "custom": {
        const c = Number(customInterval);
        const u = String(customUnit || "").toLowerCase();
        if (!(c > 0)) return null;
        if (!["days", "weeks", "months", "years"].includes(u)) return null;
        count = c;
        unit = u;
        break;
      }
      default:
        return null;
    }

    // --- Find the next local date ≥ today (by calendar) ---
    let nextLocal = addLocalUnits(baseLocal, count, unit);

    while (nextLocal < todayLocalMidnight) {
      nextLocal = addLocalUnits(nextLocal, count, unit);
    }

    // Final: Date at **local midnight** of the next due day
    return nextLocal;
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

  const currentDate = new Date().toISOString().split("T")[0];

  return {
    name: chargeName,
    isRecurring: recurringType == "one-time" ? false : true,
    plaidMatch: selectedCharge?.plaidMatch || null,
    participants: participants,
    splitType: splitType,
    // customSplits: generateCustomSplits(),
    createdAt: currentDate,
    lastMatched: selectedCharge?.lastMatched || currentDate,
    frequency: getFrequency(),
    nextDue: getNextDueDate(),
    createdInTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
