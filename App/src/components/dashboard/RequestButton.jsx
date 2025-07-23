import React, { useState } from "react";
import { Send, Loader2, Check } from "lucide-react";
import { useData } from "../../contexts/DataContext";

const RequestButton = ({ 
  costId, // for individual requests
  participantUserId, // for individual requests
  isRequestAll = false, // for request all mode
  children, 
  loadingText = "Sending...", 
  successText = "Sent!",
  className = "",
  disabled = false,
  sentText = "SENT",
  ...props 
}) => {
  const { costs, setCosts } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if already sent today
  const alreadySentToday = () => {
    const today = getTodaysDate();
    
    if (isRequestAll) {
      // Check if ALL overdue participants were sent a reminder today
      const overdueCosts = costs.filter((cost) =>
        cost.participants.some((participant) => participant.status === "overdue")
      );
      
      if (overdueCosts.length === 0) return false;
      
      // Get all overdue participants across all costs
      const allOverdueParticipants = [];
      overdueCosts.forEach(cost => {
        const currentPayment = cost.paymentHistory?.[0];
        if (currentPayment) {
          const overdueInThisCost = currentPayment.participants.filter(p => p.status === "overdue");
          allOverdueParticipants.push(...overdueInThisCost);
        }
      });
      
      // Check if ALL overdue participants have lastReminderDate as today
      return allOverdueParticipants.length > 0 && 
             allOverdueParticipants.every(participant => participant.lastReminderDate === today);
    } else {
      // Check if specific participant was sent a reminder today
      const cost = costs.find(c => c.id === costId);
      if (!cost?.paymentHistory?.[0]) return false;
      
      const currentPayment = cost.paymentHistory[0];
      const participant = currentPayment.participants.find(p => p.userId === participantUserId);
      
      return participant?.lastReminderDate === today;
    }
  };

  const handleClick = async () => {
    if (isLoading || isSuccess || disabled || alreadySentToday()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, isRequestAll ? 1500 : 1000));
      
      const today = getTodaysDate();
      
      if (isRequestAll) {
        // Update all overdue participants across all costs
        const updatedCosts = costs.map(cost => {
          const hasOverdueParticipants = cost.participants.some(p => p.status === "overdue");
          
          if (hasOverdueParticipants && cost.paymentHistory?.[0]) {
            const updatedPaymentHistory = [...cost.paymentHistory];
            const currentPayment = { ...updatedPaymentHistory[0] };
            
            currentPayment.participants = currentPayment.participants.map(participant => {
              if (participant.status === "overdue") {
                return {
                  ...participant,
                  remindersSent: (participant.remindersSent || 0) + 1,
                  lastReminderDate: today
                };
              }
              return participant;
            });
            
            currentPayment.lastReminderSent = today;
            updatedPaymentHistory[0] = currentPayment;
            
            return {
              ...cost,
              paymentHistory: updatedPaymentHistory
            };
          }
          return cost;
        });
        
        setCosts(updatedCosts);
        console.log("Requesting payments from all overdue participants");
      } else {
        // Update specific participant
        const updatedCosts = costs.map(cost => {
          if (cost.id === costId && cost.paymentHistory?.[0]) {
            const updatedPaymentHistory = [...cost.paymentHistory];
            const currentPayment = { ...updatedPaymentHistory[0] };
            
            currentPayment.participants = currentPayment.participants.map(participant => {
              if (participant.userId === participantUserId) {
                return {
                  ...participant,
                  remindersSent: (participant.remindersSent || 0) + 1,
                  lastReminderDate: today
                };
              }
              return participant;
            });
            
            currentPayment.lastReminderSent = today;
            updatedPaymentHistory[0] = currentPayment;
            
            return {
              ...cost,
              paymentHistory: updatedPaymentHistory
            };
          }
          return cost;
        });
        
        setCosts(updatedCosts);
        console.log(`Resending payment request for cost ${costId} to user ${participantUserId}`);
      }
      
      setIsLoading(false);
      setIsSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      console.error('Request failed:', error);
    }
  };

  const sentToday = alreadySentToday();
  const isDisabled = isLoading || isSuccess || disabled || sentToday;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium ${className}`}
      {...props}
    >
      {sentToday ? (
        <>
          <Check className="w-4 h-4" />
          <span>{isRequestAll ? "Sent to all" : "Sent"}</span>
        </>
      ) : isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-4 h-4" />
          <span>{isRequestAll ? "Sent to all!" : "Sent!"}</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default RequestButton;