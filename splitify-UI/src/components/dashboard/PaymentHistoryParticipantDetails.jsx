import { useState } from "react";
import RequestButton from "./RequestButton";
import {
  Check,
  Timer,
  Hourglass,
  Pause,
  Send,
  Repeat,
  RefreshCw,
} from "lucide-react";
import { handleToggleMarkAsPaid } from "../../queries/requests";
import { useData } from "../../contexts/DataContext";
export default function PaymentHistoryParticipantDetails({
  costId,
  participant,
  paymentHistoryRequest,
  user,
}) {
  const REMINDER_FREQUENCY_DAYS = 7;

  const [isPaid, setIsPaid] = useState(
    participant.paymentAmount >= participant.amount || participant.markedAsPaid
  );
  const isPaidEscapeLocalState =
    participant.paymentAmount >= participant.amount || participant.markedAsPaid;
  const { setCosts } = useData();

  // Get subtle status indicator color
  const getParticipantStatus = () => {
    // check if paid full balance or greater
    if (participant.paymentAmount >= participant.amount) {
      return "paid";
    }

    // Check if overdue
    const dueDate = new Date(paymentHistoryRequest.dueDate);
    const today = new Date();

    // Set both dates to start of day for accurate comparison
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today ? "overdue" : "pending";
  };

  const monthDay = (input, daysToAdd = 0) => {
    try{
    const raw = input && input.$date ? input.$date : input;
    const base = new Date(raw);
    if (Number.isNaN(base)) return "";

    // Add days in UTC to avoid DST edge cases
    const d = new Date(base);
    if (daysToAdd) d.setUTCDate(d.getUTCDate() + daysToAdd);

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    }).format(d);
  }catch(err){
    console.log("invalid time value @ monthDay")
    return null
  }
  };

  const getStatusIndicatorColor = () => {
    const status = getParticipantStatus(participant, paymentHistoryRequest);
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-blue-500";
      case "partial":
        return "bg-yellow-500"; // Added specific color for partial
      case "overdue":
        return "bg-red-500"; // Changed from orange to red for more distinction
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex flex-col gap-[13px] border border-b-2 p-3 rounded-xl">
      <div className="flex gap-4 flex-wrap justify-between">
        <div className="flex justify-between w-full">
          <div className="flex gap-4 min-w-[200px] max-w-[300px]">
            <Avatar user={user} color={getStatusIndicatorColor()} />
            <div className="flex-col flex justify-between">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-800">${participant.amount}</div>
            </div>
          </div>
          <MarkAsPaidButton
            participant={participant}
            // status={getParticipantStatus()}
            costId={costId}
            paymentHistoryRequest={paymentHistoryRequest}
            isPaid={isPaid}
            setCosts={setCosts}
            setIsPaid={setIsPaid}
          />
        </div>

        {!isPaidEscapeLocalState && (
          <div className="flex gap-5 justify-between w-full">
            <div className="h-10 w-full justify-between border border-white/30 text-gray-600 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-4 shadow-none disabled:opacity-50 disabled:cursor-auto text-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <Send className="w-6 h-6 " />
                <span>Last Sent {monthDay(participant?.requestSentDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 " />
                <span>
                  Next{" "}
                  {monthDay(
                    participant?.requestSentDate,
                    REMINDER_FREQUENCY_DAYS
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ user, color, enableStatus = false }) {
  return (
    <div
      className={`h-11 aspect-square relative rounded-lg ${user?.color} flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-sm`}
    >
      {user.avatar}
      {enableStatus && (
        <div
          className={`absolute -bottom-1.5 -right-1.5 ${color} rounded-full w-4 h-4 border-2 border-white`}
        />
      )}
    </div>
  );
}

function MarkAsPaidButton({
  status,
  participant,
  paymentHistoryRequest,
  costId,
  isPaid,
  setIsPaid,
  setCosts,
}) {
  async function handleMarkAsPaid() {
    setIsPaid(!isPaid);
    console.log(
      "toggle with:",
      costId,
      paymentHistoryRequest._id,
      participant._id
    );
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
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={handleMarkAsPaid}
        className={`${
          isPaid
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
        } transition-all duration-200 ease-in-out w-8 h-8 flex items-center justify-center rounded-lg border-2`}
      >
        <Check
          className={`w-6 h-6 transition-all duration-200 ${
            isPaid ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
      </button>

      {/* Simple working animation */}
      <span
        className={`text-blue-600 font-medium text-sm transition-all duration-300 ease-out ${
          isPaid ? "opacity-100 translate-x-0" : "opacity-100 translate-x-0"
        }`}
      >
        {isPaid ? "Paid" : "Not Paid"}
      </span>
    </div>
  );
}
