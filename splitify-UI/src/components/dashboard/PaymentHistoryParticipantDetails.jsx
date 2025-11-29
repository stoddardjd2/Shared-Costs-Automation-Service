import { useState, useMemo } from "react";
import RequestButton from "./RequestButton";
import {
  Check,
  Send,
  RefreshCw,
  EyeIcon,
  UserCheck,
  ChevronDown,
  ChevronUp,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { handleToggleMarkAsPaid } from "../../queries/requests";
import { useData } from "../../contexts/DataContext";

export default function PaymentHistoryParticipantDetails({
  costId,
  participant,
  paymentHistoryRequest,
  user,
}) {
  const REMINDER_FREQUENCY_DAYS = 14;

  const [isPaid, setIsPaid] = useState(
    participant.paymentAmount >= participant.amount || participant.markedAsPaid
  );
  const { setCosts } = useData();

  // ✅ Hide details by default
  const [showDetails, setShowDetails] = useState(false);

  const getParticipantStatus = () => {
    if (
      participant.paymentAmount >= participant.amount ||
      participant.markedAsPaid
    )
      return "paid";

    const dueDate = new Date(paymentHistoryRequest.dueDate);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today ? "overdue" : "pending";
  };

  // subtle status dot color
  const getStatusIndicatorColor = () => {
    const status = getParticipantStatus();
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-blue-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const statusLabel = useMemo(() => {
    const s = getParticipantStatus();
    if (s === "paid") return "Paid";
    if (s === "overdue") return "Overdue";
    return "Pending";
  }, [participant, paymentHistoryRequest]);

  // Month + Day (LOCAL TIME)
  const monthDay = (input, daysToAdd = 0) => {
    try {
      const raw = input && input.$date ? input.$date : input;
      const base = new Date(raw);
      if (Number.isNaN(base)) return "";

      // Work entirely in LOCAL time
      const d = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        base.getHours(),
        base.getMinutes(),
        base.getSeconds(),
        base.getMilliseconds()
      );

      if (daysToAdd) d.setDate(d.getDate() + daysToAdd);

      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "America/Los_Angeles",
      }).format(d);
    } catch (err) {
      console.log("invalid time value @ monthDay");
      return null;
    }
  };
  // Month + Day + Hour + Minute (LOCAL TIME)
  const monthDayHourLocal = (input, daysToAdd = 0) => {
    try {
      const raw = input && input.$date ? input.$date : input;
      const base = new Date(raw);
      if (Number.isNaN(base)) return "";

      // Work entirely in LOCAL time
      const d = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        base.getHours(),
        base.getMinutes(),
        base.getSeconds(),
        base.getMilliseconds()
      );

      if (daysToAdd) d.setDate(d.getDate() + daysToAdd);

      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    } catch (err) {
      console.log("invalid time value @ monthDayHourLocal");
      return null;
    }
  };

  // Convert a "wall time" in some IANA time zone to a real UTC Date
  function zonedTimeToUtc({ y, m, d, h = 0, mi = 0, s = 0 }, timeZone) {
    // 1) start with a UTC guess for that wall time
    const utcGuess = new Date(Date.UTC(y, m - 1, d, h, mi, s));

    // 2) see what that instant looks like in the target zone
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(utcGuess);

    const get = (type) => Number(parts.find((p) => p.type === type).value);

    const tzY = get("year");
    const tzM = get("month");
    const tzD = get("day");
    const tzH = get("hour");
    const tzMi = get("minute");
    const tzS = get("second");

    // 3) compute the zone offset at the guess
    const tzMillis = Date.UTC(tzY, tzM - 1, tzD, tzH, tzMi, tzS);
    const offsetMillis = tzMillis - utcGuess.getTime();

    // 4) subtract offset -> correct UTC instant
    return new Date(utcGuess.getTime() - offsetMillis);
  }

  // Main formatter:
  // - keeps the user's local DATE from input
  // - appends the user's local TIME corresponding to 2pm Los Angeles
function formatReminderLocalDatePlus2pmPST(input) {
  try {
    // Handle Mongo-style { $date: ... } or plain ISO / Date
    const raw = input && input.$date ? input.$date : input;
    const base = new Date(raw);
    if (Number.isNaN(base)) return "";

    // --- 1) Get the LA calendar day for this reminder ---
    const laParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(base);

    const laGet = (type) =>
      Number(laParts.find((p) => p.type === type).value);

    const laY = laGet("year");
    const laM = laGet("month");
    const laD = laGet("day");

    // --- 2) Convert “2 PM Los Angeles on that date” → UTC instant ---
    // Assumes your zonedTimeToUtc helper takes a Y/M/D/H/M/S object
    const twoPmLAUtcInstant = zonedTimeToUtc(
      { y: laY, m: laM, d: laD, h: 14, mi: 0, s: 0 },
      "America/Los_Angeles"
    );

    // --- 3) Format that instant in the USER'S LOCAL TIMEZONE ---
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    return formatter.format(twoPmLAUtcInstant);
  } catch (err) {
    console.log(
      "invalid time value @ formatReminderLocalDatePlus2pmPST",
      err
    );
    return "";
  }
}

  return (
    <div className="flex flex-col gap-3 border border-gray-100 bg-white p-3 sm:p-4 rounded-2xl shadow-sm">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <Avatar user={user} color={getStatusIndicatorColor()} enableStatus />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                {user.name}
              </div>

              {/* Status pill */}
              {/* <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-100">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getStatusIndicatorColor()}`}
                />
                {statusLabel}
              </div> */}
            </div>

            <div className="text-sm text-gray-700">
              ${participant.amount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MarkAsPaidButton
            participant={participant}
            costId={costId}
            paymentHistoryRequest={paymentHistoryRequest}
            isPaid={isPaid}
            setCosts={setCosts}
            setIsPaid={setIsPaid}
          />
        </div>
      </div>

      {/* Toggle button */}
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mt-1 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 mr-3">
            <EyeIcon className="w-4 h-4" />
            {showDetails ? "Hide details" : "Show details"}
          </span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* DETAILS (collapsed by default) */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showDetails ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3 text-sm text-gray-700 bg-white">
            <DetailRow
              icon={<Send className="w-4 h-4" />}
              label="Sent"
              value={monthDayHourLocal(participant?.requestSentDate)}
            />
            <DetailRow
              icon={<RefreshCw className="w-4 h-4" />}
              label="Next Reminder"
              value={
                paymentHistoryRequest?.nextReminderDate
                  ? formatReminderLocalDatePlus2pmPST(
                      paymentHistoryRequest?.nextReminderDate
                    )
                  : "Disabled"
              }
            />
            <DetailRow
              icon={<EyeIcon className="w-4 h-4" />}
              label="Link clicked"
              value={
                participant?.paymentLinkClicked
                  ? monthDayHourLocal(participant?.paymentLinkClickedDate)
                  : "No"
              }
            />
            <DetailRow
              icon={<UserCheck className="w-4 h-4" />}
              label="Said it’s paid"
              value={
                participant?.participantMarkedAsPaid
                  ? monthDayHourLocal(participant?.participantMarkedAsPaidDate)
                  : "No"
              }
            />
            <DetailRow
              icon={<CreditCard className="w-4 h-4" />}
              label="Payment method"
              value={
                participant?.lastClickedPaymentMethod
                  ? participant.lastClickedPaymentMethod
                  : "Unknown"
              }
            />
            <DetailRow
              icon={<Check className="w-4 h-4" />}
              label="Marked as paid"
              value={
                participant?.markedAsPaid
                  ? monthDayHourLocal(participant?.markedAsPaidDate)
                  : "No"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-gray-500">{icon}</div>
      <div className="flex gap-1 text-nowrap">
        <span className="font-semibold text-gray-800">{label}:</span>
        <span className="text-gray-700">{value || "—"}</span>
      </div>
    </div>
  );
}

function Avatar({ user, color, enableStatus = false }) {
  return (
    <div
      className={`h-11 aspect-square relative rounded-xl ${
        user?.color || "bg-gray-400"
      } flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-sm`}
    >
      {user.avatar}
      {/* {enableStatus && (
        <div
          className={`absolute -bottom-1.5 -right-1.5 ${color} rounded-full w-4 h-4 border-2 border-white`}
        />
      )} */}
    </div>
  );
}

function MarkAsPaidButton({
  participant,
  paymentHistoryRequest,
  costId,
  isPaid,
  setIsPaid,
  setCosts,
}) {
  async function handleMarkAsPaid() {
    setIsPaid(!isPaid);

    try {
      const res = await handleToggleMarkAsPaid(
        costId,
        paymentHistoryRequest._id,
        participant._id
      );

      setCosts((prev) =>
        prev.map((cost) => (cost._id === costId ? res.data.data.request : cost))
      );
    } catch (err) {
      console.log("failed to mark as paid", err);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={handleMarkAsPaid}
        className={`${
          isPaid
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
        } transition-all duration-200 ease-in-out w-9 h-9 flex items-center justify-center rounded-xl border-2 shadow-sm`}
      >
        <Check
          className={`w-6 h-6 transition-all duration-200 ${
            isPaid ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
      </button>

      <span className="hidden xxs:flex text-blue-600 font-medium text-sm">
        {isPaid ? "Paid" : "Not Paid"}
      </span>
    </div>
  );
}
