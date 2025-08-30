import React, { useState } from "react";
import { AlertTriangle, Calendar, Bell } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import RequestButton from "./RequestButton";
import PaymentHistoryParticipantDetails from "./PaymentHistoryParticipantDetails";

const OverdueAlerts = () => {
  const { costs, participants } = useData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [viewOverdueRequestsLimit, setViewOverdueRequestsLimit] = useState(5);
  const currentDate = new Date();
  const [costsPreserved, setCostsPreserved] = useState(costs);
  // ---------- Helpers ----------
  const parseDate = (d) =>
    d?.$date ? new Date(d.$date) : d instanceof Date ? d : new Date(d);

  const normalizeId = (id) => (id && id.$oid ? id.$oid : String(id ?? ""));

  const isParticipantPaid = (p) => {
    const paidAmt = Number(p?.paymentAmount ?? 0);
    const oweAmt = Number(p?.amount ?? 0);
    return Boolean(p?.markedAsPaid) || paidAmt >= oweAmt;
  };

  const outstanding = (p) => {
    const owe = Number(p?.amount ?? 0);
    const paid = Number(p?.paymentAmount ?? 0);
    return Math.max(0, owe - paid);
  };

  // Past due AND not paid in full
  const isOverdue = (participant, dueDate, now = new Date()) => {
    const due = parseDate(dueDate);
    return now > due && !isParticipantPaid(participant);
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getDaysOverdue = (dueDate) => {
    const diffTime = currentDate - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // ---------- Build + Filter Requests ----------
  const allPaymentRequests = [];
  costsPreserved.forEach((cost) => {
    if (Array.isArray(cost.paymentHistory)) {
      cost.paymentHistory.forEach((paymentRequest) => {
        allPaymentRequests.push({
          ...paymentRequest,
          costName: cost.name,
          costId: cost._id,
          _dueDateParsed: parseDate(paymentRequest.dueDate), // cache parsed
        });
      });
    }
  });

  const overduePaymentRequests = allPaymentRequests.filter((req) =>
    (req.participants || []).some((p) =>
      isOverdue(p, req._dueDateParsed, currentDate)
    )
  );

  // ---------- Stats ----------
  const overdueStats = overduePaymentRequests.reduce(
    (stats, req) => {
      const overdueParticipants = (req.participants || []).filter((p) =>
        isOverdue(p, req._dueDateParsed, currentDate)
      );

      const overdueAmount = overdueParticipants.reduce(
        (sum, p) => sum + outstanding(p),
        0
      );

      return {
        totalAmount: stats.totalAmount + overdueAmount,
        totalParticipants: stats.totalParticipants + overdueParticipants.length,
        totalRequests: stats.totalRequests + 1,
      };
    },
    { totalAmount: 0, totalParticipants: 0, totalRequests: 0 }
  );

  if (isDismissed) return null;

  // ---------- No Overdue UI ----------
  if (overduePaymentRequests.length === 0) {
    return (
      <div
 
        className="rounded-2xl bg-blue-600 shadow-sm border border-blue-200/60 p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">All Caught Up!</h3>
            <p className="text-white/80 text-sm">
              No overdue payments at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
      {/* Alert Banner */}
      <div
 
        className="bg-blue-600 p-5 relative"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                {overduePaymentRequests.length} Overdue Payment
                {overduePaymentRequests.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-white/80 text-base">
                ${overdueStats.totalAmount.toFixed(2)} from{" "}
                {overdueStats.totalParticipants}{" "}
                {overdueStats.totalParticipants !== 1 ? "people" : "person"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {/* Example bulk button if needed later:
          <RequestButton
            isRequestAll={true}
            className="px-3 py-1.5 text-sm bg-white/10 border border-white/30"
          >
            Request All Payments
          </RequestButton> */}

          <button
            onClick={() => setShowDetails((s) => !s)}
            className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10"
          >
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-4 right-4 bg-white/20 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
          title="Dismiss alert"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
          }
        >
          ×
        </button>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div>
          {overduePaymentRequests
            .slice(
              0,
              showAll ? overduePaymentRequests.length : viewOverdueRequestsLimit
            )
            .map((request) => {
              const dueDate =
                request._dueDateParsed ?? parseDate(request.dueDate);
              const overdueParticipants = (request.participants || []).filter(
                (p) => isOverdue(p, dueDate, currentDate)
              );
              const overdueAmount = overdueParticipants.reduce(
                (sum, p) => sum + outstanding(p),
                0
              );
              const daysOverdue = getDaysOverdue(dueDate);
              const requestId = normalizeId(request._id);

              return (
                <div
                  key={requestId}
                  className="p-4 transition-all duration-200 group border-b border-gray-200"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3">
                        {request.costName}
                      </h3>
                    </div>

                    {/* Due date */}
                    <div className="flex items-center gap-2 text-gray-600 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Due {formatDate(dueDate)} ({daysOverdue} day
                        {daysOverdue !== 1 ? "s" : ""} overdue)
                      </span>
                    </div>
                  </div>

                  {/* Amount summary */}
                  <div className="flex justify-start items-start mb-3">
                    <div className="text-left">
                      <div className="flex items-baseline gap-2">
                        <div className="text-lg font-bold text-black">
                          ${overdueAmount.toFixed(2)}
                        </div>
                        Total overdue
                      </div>
                      {overdueParticipants.length !== 1 && (
                        <div className="text-sm">
                          {overdueParticipants.length} of{" "}
                          {request.participants?.length ?? 0} participants
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overdue Participants */}
                  <div className="space-y-2">
                    {overdueParticipants.map((participant, index) => {
                      const participantId = normalizeId(participant._id);
                      const user = participants.find(
                        (u) => normalizeId(u._id) === participantId
                      );

                      // If participant got fully paid somehow, skip render
                      if (isParticipantPaid(participant)) return null;

                      return (
                        <PaymentHistoryParticipantDetails
                          key={`${participantId}-${index}`}
                          costId={request.costId}
                          participant={participant}
                          paymentHistoryRequest={request}
                          user={user}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {overduePaymentRequests.length > 5 && (
            <div className="p-4 bg-blue-100/40 border-t border-blue-200/60">
              <div className="text-center">
                <button
                  onClick={() => {
                    const toggled = !showAll;
                    setShowAll(toggled);
                    setViewOverdueRequestsLimit(
                      toggled ? overduePaymentRequests.length : 5
                    );
                  }}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-200/50 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  {!showAll
                    ? `View all ${overduePaymentRequests.length} overdue payment requests →`
                    : "Hide"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OverdueAlerts;
