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
  const getNextDueDate = (targetHourPST = 14) => {
    if (recurringType === "none") return null;

    // Treat PST as fixed UTC-8
    const PST_OFFSET_HOURS = 8;
    const PST_OFFSET_MS = PST_OFFSET_HOURS * 60 * 60 * 1000;

    // Convert real UTC -> "pseudo PST" (for calendar math)
    function utcToPseudoPST(dateUtc) {
      return new Date(dateUtc.getTime() - PST_OFFSET_MS);
    }

    // Convert "pseudo PST" -> real UTC
    function pseudoPSTToUtc(datePseudo) {
      return new Date(datePseudo.getTime() + PST_OFFSET_MS);
    }

    // Parse 'YYYY-MM-DD' as a PST calendar date at midnight (pseudo PST)
    function pstFromYMD(ymd) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        throw new Error("Date must be 'YYYY-MM-DD'");
      }
      const [y, m, d] = ymd.split("-").map(Number);
      // In pseudo PST world, we can just use Date.UTC for Y/M/D
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    }

    // Add in PST calendar units (days/weeks/months/years) using UTC setters
    function addPseudoPST(base, count, unit) {
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

    // --- Now / Today in PST world (pseudo) ---

    const nowUtc = new Date();
    const nowPstPseudo = utcToPseudoPST(nowUtc);

    const todayPstMidnight = new Date(
      Date.UTC(
        nowPstPseudo.getUTCFullYear(),
        nowPstPseudo.getUTCMonth(),
        nowPstPseudo.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );

    // --- Anchor base date (in pseudo PST) ---

    const basePst =
      startTiming === "now"
        ? new Date(todayPstMidnight.getTime()) // copy
        : pstFromYMD(startTiming);

    // If explicit start date is in the future (PST), just use that date at targetHourPST
    if (startTiming !== "now" && basePst.getTime() > nowPstPseudo.getTime()) {
      const future = new Date(basePst.getTime());
      // Set wall-clock time in PST world
      future.setUTCHours(targetHourPST, 0, 0, 0);
      return pseudoPSTToUtc(future);
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

    // --- Find the next PST date ≥ today (by calendar) ---

    let nextPst = addPseudoPST(basePst, count, unit);
    while (nextPst < todayPstMidnight) {
      nextPst = addPseudoPST(nextPst, count, unit);
    }

    // Set time to targetHourPST (2pm by default) in PST world
    nextPst.setUTCHours(targetHourPST, 0, 0, 0);

    // Convert from pseudo PST back to real UTC
    const nextUtc = pseudoPSTToUtc(nextPst);

    // For debugging:
    // console.log("nextUtc ISO:", nextUtc.toISOString());
    // console.log(
    //   "as PST (manual):",
    //   new Date(nextUtc.getTime() - PST_OFFSET_MS).toISOString()
    // );

    return nextUtc;
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

  console.log("getNextDueDate()", getNextDueDate());
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
