// RequestButton.js
import React, { useState } from "react";
import { Send, Loader2, Check } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { sendReminder } from "../../queries/requests";
const RequestButton = ({
  costId, // for individual requests
  participantUserId, // for individual requests
  isRequestAll = false, // for request all mode
  paymentHistoryId, // for individual requests
  paymentHistoryRequest,
  children,
  loadingText = "Sending...",
  successText = "Sent!",
  className = "",
  disabled = false,
  sentText = "SENT",
  reminderSentDate,
  color = "blue", // new color prop with blue default
  ...props
}) => {
  // restrict to only 1 reminder per day
  const thresholdDays = 1;

  const { costs, setCosts } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodaysDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get color classes based on color prop
  const getColorClasses = (color) => {
    switch (color) {
      case "red":
        return "bg-red-600 hover:bg-red-700";
      case "green":
        return "bg-green-600 hover:bg-green-700";
      case "blue":
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  // Check if already sent today
  const alreadySentToday = () => {
    const today = getTodaysDate();

    if (isRequestAll) {
      // Check if ALL overdue participants were sent a reminder today
      const overdueCosts = costs.filter((cost) =>
        cost.participants.some(
          (participant) => participant.status === "overdue"
        )
      );

      if (overdueCosts.length === 0) return false;

      // Get all overdue participants across all costs
      const allOverdueParticipants = [];
      overdueCosts.forEach((cost) => {
        const currentPayment = cost.paymentHistory?.[0];
        if (currentPayment) {
          const overdueInThisCost = currentPayment.participants.filter(
            (p) => p.status === "overdue"
          );
          allOverdueParticipants.push(...overdueInThisCost);
        }
      });

      // Check if ALL overdue participants have lastReminderDate as today
      return (
        allOverdueParticipants.length > 0 &&
        allOverdueParticipants.every(
          (participant) => participant.lastReminderDate === today
        )
      );
    } else {
      console.log("CHECKING IF REMINDER NEEDED");

      // Find the specific participant
      const participant = paymentHistoryRequest?.participants?.find(
        (p) => p._id?.$oid === participantUserId || p._id === participantUserId
      );

      if (!participant) {
        console.log("Participant not found");
        return true; // Needs reminder if participant not found
      }

      if (!participant.reminderSentDate) {
        console.log("No previous reminder sent to participant");
        return true; // Needs reminder
      }

      const now = new Date();
      const reminderDate = new Date(
        participant.reminderSentDate.$date || participant.reminderSentDate
      );
      const diffInDays = (now - reminderDate) / (1000 * 60 * 60 * 24);

      if (diffInDays > thresholdDays) {
        console.log(
          `More than ${thresholdDays} day(s) since last reminder to participant`
        );
        return false; // Needs reminder
      } else {
        console.log(
          `Reminder sent to participant within the last ${thresholdDays} day(s)`
        );
        return true; // No reminder needed
      }
    }
  };

  const handleClick = async () => {
    if (isLoading || isSuccess || disabled || alreadySentToday()) return;
    // Reset success state after 2 seconds

    setIsLoading(true);

    try {
      const today = getTodaysDate();

      if (isRequestAll) {
        // Update all overdue participants across all costs
        const updatedCosts = costs.map((cost) => {
          const hasOverdueParticipants = cost.participants.some(
            (p) => p.status === "overdue"
          );

          if (hasOverdueParticipants && cost.paymentHistory?.[0]) {
            const updatedPaymentHistory = [...cost.paymentHistory];
            const currentPayment = { ...updatedPaymentHistory[0] };

            currentPayment.participants = currentPayment.participants.map(
              (participant) => {
                if (participant.status === "overdue") {
                  return {
                    ...participant,
                    remindersSent: (participant.remindersSent || 0) + 1,
                    lastReminderDate: today,
                  };
                }
                return participant;
              }
            );

            currentPayment.lastReminderSent = today;
            updatedPaymentHistory[0] = currentPayment;

            return {
              ...cost,
              paymentHistory: updatedPaymentHistory,
            };
          }
          return cost;
        });

        setCosts(updatedCosts);
        console.log("Requesting payments from all overdue participants");
      } else {
        // Update specific participant
        const res = await sendReminder(
          costId,
          paymentHistoryId,
          participantUserId
        );
        const updatedCost = res.data.updateResult;

        console.log("UPDATEING!");
        setTimeout(() => {
          setIsLoading(false);
          setCosts(
            costs.map((cost) => {
              if (cost._id == costId) {
                return { ...updatedCost /* your updated properties here */ };
              }
              return cost;
            })
          );
          console.log(
            `Resending payment request for cost ${costId} to user ${participantUserId}`
          );
        }, 1000);
      }

      // setIsSuccess(true);
    } catch (error) {
      setIsLoading(false);
      console.error("Request failed:", error);
    }
  };

  const sentToday = alreadySentToday();
  const isDisabled = isLoading || isSuccess || disabled || sentToday;
  const colorClasses = getColorClasses(color);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={
        "bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10 disabled:opacity-70 disabled:cursor-auto " +
        className
      }
      {...props}
    >
      {sentToday ? (
        <>
          <Check className="w-5 h-5" />
          <span>{isRequestAll ? "Sent to all" : "Sent"}</span>
        </>
      ) : isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-5 h-5" />
          <span>{isRequestAll ? "Sent to all!" : "Sent!"}</span>
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default RequestButton;
