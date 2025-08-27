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
  participant,
  isPaid,
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

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Check if already sent today
  const alreadySentToday = () => {
    const today = getTodaysDate();
    // Find the specific participant
    const participant = paymentHistoryRequest?.participants?.find(
      (p) => p._id === participantUserId
    );

    if (!participant) {
      console.log("Participant not found");
      return false; // Needs reminder if participant not found
    }

    if (!participant.reminderSentDate) {
      return false; // Needs reminder
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
      } else {
        // Update specific participant

        const res = await sendReminder(
          costId,
          paymentHistoryRequest._id,
          participantUserId
        );

        const updatedCost = res.data.updateResult;

        if (updatedCost) {
          setTimeout(() => {
            setIsLoading(false);
            console.log("UPdATING COST", updatedCost);
            setIsSuccess(true);
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
      }

      // setIsSuccess(true);
    } catch (error) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      console.error("Request failed:", error);
    }
  };

  function getSentInitialRecently() {
    function hasBeenOneWeek(nextReminderDate) {
      const now = new Date();
      const reminderDate = new Date(nextReminderDate);

      // Calculate difference in days
      const diffTime = Math.abs(now - reminderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 7;
    }

    if (hasBeenOneWeek(paymentHistoryRequest.requestDate)) {
      return false;
    }
    return true;
  }

  const sentToday = alreadySentToday();
  const sentInitialRecently = getSentInitialRecently();
  const isDisabled =
    isLoading ||
    isSuccess ||
    disabled ||
    sentToday ||
    sentInitialRecently ||
    isPaid;
  const colorClasses = getColorClasses(color);


  const sendIcon = <Send className="w-6 h-6 " />;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={
          `${
            isPaid && "!opacity-0 !transition-none"
          } bg-blue-600 h-10  border border-white/30 text-white px-3 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-4 backdrop-blur-md translate-y-0 ${
            !isDisabled
              ? "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 hover:bg-blue-600/90"
              : ""
          } shadow-none disabled:opacity-50 disabled:cursor-auto ` + className
        }
        {...props}
      >
        {sentToday ? (
          <>
            {/* <Check className="w-5 h-5" /> */}
            {sendIcon}

            <span>
              {isRequestAll
                ? "Sent to all"
                : `Sent on ${formatDate(
                    new Date(participant.reminderSentDate)
                  )}`}
            </span>
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : isSuccess ? (
          <>
            {/* <Check className="w-5 h-5" /> */}
            {sendIcon}

            <span>{isRequestAll ? "Sent to all!" : "Sent!"}</span>
          </>
        ) : sentInitialRecently ? (
          <>
            {/* <Check className="w-5 h-5" /> */}
            {sendIcon}

            <span>{`Sent ${formatDate(
              new Date(paymentHistoryRequest.requestDate)
            )}`}</span>
          </>
        ) : (
          <>
            {sendIcon}
            <span>{children}</span>
          </>
        )}
      </button>
    </>
  );
};

export default RequestButton;
