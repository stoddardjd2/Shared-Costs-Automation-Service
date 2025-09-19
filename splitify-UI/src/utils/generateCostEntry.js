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

    // Parse 'YYYY-MM-DD' into a UTC-midnight Date
    function dateFromYMD(ymd, mode = "utc") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        throw new Error("Date must be 'YYYY-MM-DD'");
      }
      const [y, m, d] = ymd.split("-").map(Number);
      const dt =
        mode === "utc"
          ? new Date(Date.UTC(y, m - 1, d))
          : new Date(y, m - 1, d);
      const ok =
        mode === "utc"
          ? dt.getUTCFullYear() === y &&
            dt.getUTCMonth() === m - 1 &&
            dt.getUTCDate() === d
          : dt.getFullYear() === y &&
            dt.getMonth() === m - 1 &&
            dt.getDate() === d;
      if (!ok) throw new Error("Invalid calendar date");
      return dt;
    }

    // Format a Date (assumed UTC) as 'YYYY-MM-DD'
    function toYMDUTC(d) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    // Add interval in UTC
    function addUTC(base, count, unit) {
      const dt = new Date(base.getTime());
      switch (unit) {
        case "days":
          dt.setUTCDate(dt.getUTCDate() + count);
          break;
        case "weeks":
          dt.setUTCDate(dt.getUTCDate() + count * 7);
          break;
        case "months":
          dt.setUTCMonth(dt.getUTCMonth() + count);
          break;
        case "years":
          dt.setUTCFullYear(dt.getUTCFullYear() + count);
          break;
        default:
          throw new Error("Unsupported unit");
      }
      return dt;
    }

    // Anchor date: 'now' at UTC midnight, or the provided start date
    const now = new Date();
    const base =
      startTiming === "now"
        ? new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
          )
        : dateFromYMD(startTiming, "utc");

    if (startTiming !== "now" && base.getTime() > Date.now()) {
      return toYMDUTC(base);
    }

    let next;
    switch (recurringType) {
      case "daily":
        next = addUTC(base, 1, "days");
        break;
      case "weekly":
        next = addUTC(base, 1, "weeks");
        break;
      case "biweekly":
        next = addUTC(base, 2, "weeks");
        break;
      case "monthly":
        next = addUTC(base, 1, "months");
        break;
      case "yearly":
        next = addUTC(base, 1, "years");
        break;
      case "custom": {
        const count = Number(customInterval || 0);
        if (!count) return null;
        const unit = String(customUnit || "").toLowerCase();
        if (unit === "days") next = addUTC(base, count, "days");
        else if (unit === "weeks") next = addUTC(base, count, "weeks");
        else if (unit === "months") next = addUTC(base, count, "months");
        else if (unit === "years") next = addUTC(base, count, "years");
        else return null;
        break;
      }
      default:
        return null;
    }

    return toYMDUTC(next);
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

  console.log("recurringType", recurringType);
  return {
    name: chargeName,
    amount: chargeAmount,
    isRecurring: recurringType == "one-time" ? false : true,
    plaidMatch: selectedCharge?.plaidMatch || null,
    participants: participants,
    splitType: splitType,
    // customSplits: generateCustomSplits(),
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
