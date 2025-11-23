import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  handlePaymentDetails,
  handleToggleMarkAsPaid,
} from "../../queries/requests";

const MIN_LOADING_MS = 900; // configurable spinner delay

const formatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function MarkAsPaidConfirmPage() {
  // ✅ works with: /markAsPaid?userId=...&paymentHistoryId=...&requestId=...
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const paymentHistoryId = searchParams.get("paymentHistoryId");
  const userId = searchParams.get("userId");

  console.log("params", requestId, paymentHistoryId, userId);

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);
  const [error, setError] = useState(null);

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paidDate, setPaidDate] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      const start = Date.now();

      try {
        if (!requestId || !paymentHistoryId || !userId) {
          throw new Error("Invalid payment link.");
        }

        // 1) Fetch details
        const detailsRes = await handlePaymentDetails(
          requestId,
          paymentHistoryId,
          userId
        );

        console.log("detailsRes", detailsRes);
        if (!detailsRes?.success) {
          throw new Error(
            detailsRes?.error || "Could not load payment details."
          );
        }

        const details = detailsRes.data;
        if (!mounted) return;
        setPaymentDetails(details);

        // Already paid?
        if (details.paymentAmount >= details.amount || details.markedAsPaid) {
          setIsAlreadyPaid(true);
          setPaidDate(
            formatDate(details.datePaid || details.participantPaidDate)
          );
        } else {
          // 2) automatically mark as paid using toggle endpoint
          const toggleRes = await handleToggleMarkAsPaid(
            requestId,
            paymentHistoryId,
            userId,
            "textLink"
          );

          if (!mounted) return;

          if (toggleRes?.success) {
            setIsConfirmed(true);
            setPaidDate(formatDate(new Date()));
          } else if (toggleRes?.error?.includes("already")) {
            setIsAlreadyPaid(true);
            setPaidDate(formatDate(new Date()));
          } else {
            throw new Error(toggleRes?.error || "Unable to confirm payment.");
          }
        }
      } catch (e) {
        if (mounted) setError(e.message || "Something went wrong.");
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
        await new Promise((r) => setTimeout(r, remaining));
        if (mounted) setIsLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [requestId, paymentHistoryId, userId]);

  // ------------------------
  // LOADING VIEW
  // ------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Confirming payment…
            </h1>
            <p className="text-sm text-gray-500">One moment please.</p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------
  // ERROR VIEW
  // ------------------------
  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-red-500 px-8 py-10 text-white text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Unable to confirm</h1>
            <p className="mt-2 text-white/90 text-sm">{error}</p>
          </div>

          <div className="p-6 text-center">
            <p className="text-xs text-gray-500">Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("paymentDetails.owedTo", paymentDetails)
  // ------------------------
  // SUCCESS / ALREADY PAID
  // ------------------------
  const headerTitle = isAlreadyPaid
    ? "Already marked as paid"
    : "Payment confirmed!";
  const headerSubtitle = isAlreadyPaid
    ? "This payment was already completed."
    : `You're all set — no more reminders will be sent to ${paymentDetails.participantName} for this request.`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-500 px-8 py-10 text-white text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">{headerTitle}</h1>
          <p className="mt-2 text-white/90 text-sm">{headerSubtitle}</p>
        </div>

        {/* SUMMARY */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Payment Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentDetails.amountOwed)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment for</span>
                <span className="font-semibold text-gray-900">
                  {paymentDetails.requestName}
                </span>
              </div>

              {paymentDetails.owedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">From</span>
                  <span className="font-semibold text-gray-900">
                    {paymentDetails.participantName}
                  </span>
                </div>
              )}

              {paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date marked paid</span>
                  <span className="font-semibold text-gray-900">
                    {paidDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can close this page now.
          </p>
        </div>
      </div>
    </div>
  );
}
