import PlaidConnectBanner from "./PlaidConnectBanner";
import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { plaidAPI, savePlaidAccessToken } from "../../queries/plaidService";
import PlaidTransactionsModal from "./PlaidTransactionsModal";
import { useData } from "../../contexts/DataContext";
import { Banknote, Landmark, CreditCard } from "lucide-react";
import SplitifyPremiumModal from "../premium/SplitifyPremiumModal";

export default function PlaidConnect({
  setChargeName,
  setEditableTotalAmount,
  setRecurringType,
  setIsPlaidCharge,
  setIsDynamic,
  setStartTiming,
  chargeName,
  isPlaidCharge,
  setSelectedTransaction,
  selectedTransaction,
  isEditMode,
}) {
  const [linkToken, setLinkToken] = useState("");
  const [linkKey, setLinkKey] = useState(0); // force re-mount per token
  const [shouldOpen, setShouldOpen] = useState(false);

  const [publicToken, setPublicToken] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [log, setLog] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const { userData, setUserData } = useData();

  //   const [startDate, setStartDate] = useState(() => {
  //     const d = new Date();
  //     d.setDate(d.getDate() - 30);
  //     return d.toISOString().slice(0, 10);
  //   });
  //   const [endDate, setEndDate] = useState(() =>
  //     new Date().toISOString().slice(0, 10)
  //   );

  function pushLog(msg) {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function onLinkSuccess(pubToken /*, metadata */) {
    try {
      setPublicToken(pubToken);
      pushLog("Public token received from Link.");
      setLoading(true);

      const accessToken = await plaidAPI.exchangePublicToken(pubToken);
      const res = await savePlaidAccessToken(accessToken);
      if (res.success) {
        setUserData((prev) => {
          return { ...prev, plaid: { isEnabled: true } };
        });
      }

      pushLog("Access token exchanged.");
      // update DB with access token

      //   const txns = await plaidAPI.getTransactions(at, startDate, endDate);
      //   setTransactions(Array.isArray(txns) ? txns : []);
      //   pushLog(`Fetched ${Array.isArray(txns) ? txns.length : 0} transactions.`);
    } catch (e) {
      setError(e?.message || "Error handling Plaid Link success.");
    } finally {
      setLoading(false);
      setShouldOpen(false);
      setShowTransactions(true);
      setLinkToken(""); // drop used token
    }
  }

  function onLinkExit(err /*, metadata */) {
    if (err) {
      setError(err.display_message || err.message || "Exited Link with error.");
      pushLog("Link exited with error.");
    } else {
      pushLog("Link closed by user.");
    }
    setShouldOpen(false);
    setLinkToken(""); // ensure we don't reuse an old token
  }

  function onLinkEvent(eventName /*, metadata */) {
    pushLog(`Link event: ${eventName}`);
  }

  // Always fetch a fresh token, then re-mount the Link instance and open it.
  async function handleConnect() {
    // verify is premium user
    if (userData?.plan == "premium" || userData?.plan == "plaid") {
      try {
        setError("");
        setLoading(true);
        setShouldOpen(false);

        const token = await plaidAPI.createLinkToken();
        pushLog("link_token created.");

        setLinkToken(token || "");
        setLinkKey((k) => k + 1); // force PlaidLinkOpener to re-initialize
        setShouldOpen(true); // will auto-open once ready
      } catch (e) {
        setError(e?.message || "Failed to create link_token.");
      } finally {
        setLoading(false);
      }
    } else {
      setShowPremiumPrompt(true);
      setError("Premium plan required");

      console.log("Premium plan required");
    }
  }

  function handleSelectTransaction(transaction) {
    setChargeName(transaction?.name || transaction?.merchant_name);
    setEditableTotalAmount(transaction?.amount || 0);
    setIsPlaidCharge(true);
    setRecurringType(
      transaction?.billingFrequency === "unknown"
        ? null
        : transaction?.billingFrequency
    );
    // set to dynamic if frequency is known
    // setIsDynamic(transaction?.billingFrequency === "unkown" ? false : true);
    setStartTiming(transaction?.nextExpectedChargeDate);
    setSelectedTransaction(transaction);
  }

  const getDisplayName = (transaction) => {
    return (
      transaction.name || transaction.merchant_name || "Unknown Transaction"
    );
  };

  const getMerchantName = (transaction) => {
    return transaction.merchant_name || "Unknown Merchant";
  };
  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-$${absAmount}` : `$${absAmount}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (userData?.plaid?.isEnabled)
    return (
      <>
        {!isEditMode && (
          <button
            onClick={() => {
              setShowTransactions(true);
            }}
            className="bg-gradient-to-br mb-6 from-blue-600 to-blue-700 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10"
            disabled={loading}
          >
            <Landmark className="w-6 h-6" />
            <span>Find from bank</span>
          </button>
        )}

        {isPlaidCharge && (
          // <div className="relatative bg-gradient-to-br mb-6 from-blue-600 to-blue-700 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0  shadow-none hover:shadow-lg hover:shadow-black/10">
          //   <CreditCard className="w-6 h-6" />
          //   <span>{chargeName}</span>
          //   <button
          //     class="absolute top-50% right-2  bg-white/20 hover:bg-white/30 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
          //     title="Dismiss"
          //   >
          //     ×
          //   </button>
          // </div>
          <div
            className={`relative flex items-center mb-6 p-4 rounded-lg transition-all border ${
              true
                ? "bg-blue-50 border-blue-500"
                : "hover:bg-slate-50 border-transparent hover:border-slate-200"
            }`}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
              {selectedTransaction.logo_url ? (
                <img
                  src={selectedTransaction.logo_url}
                  alt={getMerchantName(selectedTransaction)}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium"
                style={{
                  display: selectedTransaction.logo_url ? "none" : "flex",
                }}
              >
                {getMerchantName(selectedTransaction).charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {getDisplayName(selectedTransaction)}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {getMerchantName(selectedTransaction)}
              </div>
            </div>
            {/* <div className="text-right ml-3 flex-shrink-0">
              <div className={`text-sm font-semibold ${"text-blue-600"}`}>
                {formatAmount(selectedTransaction.amount)}
              </div>
              <div className="flex gap-3">
                <div className="text-xs text-slate-400 capitalize">
                  {selectedTransaction.billingFrequency}
                </div>

                <div className="text-xs min-w-[70px] text-slate-500">
                  {formatDate(selectedTransaction.date)}
                </div>
              </div>
            </div> */}
            {!isEditMode && (
              <button
                className="absolute top-50% right-4  bg-blue-600 hover:bg-blue-600/80 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
                title="Remove"
                onClick={() => {
                  setIsPlaidCharge(false);
                  setChargeName("");
                  setEditableTotalAmount(0);
                  setIsDynamic(false);
                  setRecurringType(false);
                  setStartTiming("now");
                  setSelectedTransaction(null);
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {showTransactions && (
          <PlaidTransactionsModal
            isOpen={showTransactions}
            onClose={() => {
              setShowTransactions(false);
            }}
            transactions={transactions}
            onSelect={handleSelectTransaction}
            handleConnect={handleConnect}
          />
        )}
      </>
    );

  return (
    <>
      <PlaidConnectBanner loading={loading} handleConnect={handleConnect} />
      {/* <PlaidConnectFAB /> */}
      {/* <PremiumModal isOpen={showPremiumPrompt} setIsOpen={setShowPremiumPrompt}/> */}
      <SplitifyPremiumModal
        isOpen={showPremiumPrompt}
        onClose={() => setShowPremiumPrompt(false)}
      />
      {linkToken && (
        <PlaidLinkOpener
          key={linkKey} // <-- re-mount per token
          token={linkToken}
          autoOpen={shouldOpen}
          onSuccess={onLinkSuccess}
          onExit={onLinkExit}
          onEvent={onLinkEvent}
        />
      )}
    </>
  );
}

// Mounted only after we have a token; owns the usePlaidLink hook.
function PlaidLinkOpener({ token, autoOpen, onSuccess, onExit, onEvent }) {
  const { open, ready, exit } = usePlaidLink({
    token,
    onSuccess,
    onExit,
    onEvent,
  });

  useEffect(() => {
    if (autoOpen && ready) open();
  }, [autoOpen, ready, open]);

  return null;
}
