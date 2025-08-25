// src/components/PlaidSandboxConnect.jsx
import React, { useEffect, useMemo, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { plaidAPI } from "../../queries/plaidService"; // adjust path if needed

function fmt(date) {
  return new Date(date).toISOString().slice(0, 10);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
}

export default function PlaidSandboxConnect() {
  const [linkToken, setLinkToken] = useState("");
  const [publicToken, setPublicToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(fmt(new Date()));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  const pushLog = (msg) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // 1) Get link_token from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await plaidAPI.createLinkToken();
        if (!mounted) return;
        setLinkToken(token || "");
        pushLog("link_token created.");
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to create link_token.");
      }
    })();
    return () => (mounted = false);
  }, []);

  // 2) Configure Plaid Link
  const { open, ready, exit } = usePlaidLink({
    token: linkToken,
    onSuccess: async (pubToken, metadata) => {
      try {
        setPublicToken(pubToken);
        pushLog("Public token received from Link.");
        setLoading(true);

        // 3) Exchange public_token -> access_token
        const at = await plaidAPI.exchangePublicToken(pubToken);
        setAccessToken(at || "");
        pushLog("Access token exchanged.");

        // 4) (Optional) Immediately pull recent transactions
        const txns = await plaidAPI.getTransactions(at, startDate, endDate);
        setTransactions(Array.isArray(txns) ? txns : []);
        pushLog(
          `Fetched ${Array.isArray(txns) ? txns.length : 0} transactions.`
        );
      } catch (e) {
        setError(e?.message || "Error during Link success handling.");
      } finally {
        setLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        setError(err.display_message || err.message || "Exited Link with error.");
        pushLog("Link exited with error.");
      } else {
        pushLog("Link closed by user.");
      }
    },
    onEvent: (eventName, metadata) => {
      pushLog(`Link event: ${eventName}`);
    },
  });

  const runRefresh = async () => {
    if (!accessToken) return;
    setError("");
    setLoading(true);
    try {
      const maybeNew = await plaidAPI.refreshTransactions(accessToken);
      if (maybeNew && typeof maybeNew === "string") {
        setAccessToken(maybeNew);
        pushLog("Transactions refresh (token updated).");
      } else {
        pushLog("Transactions refresh requested.");
      }
    } catch (e) {
      setError(e?.message || "Failed to refresh transactions.");
    } finally {
      setLoading(false);
    }
  };

  const runGetTransactions = async () => {
    if (!accessToken) return;
    setError("");
    setLoading(true);
    try {
      const txns = await plaidAPI.getTransactions(accessToken, startDate, endDate);
      setTransactions(Array.isArray(txns) ? txns : []);
      pushLog(`Fetched ${Array.isArray(txns) ? txns.length : 0} transactions.`);
    } catch (e) {
      setError(e?.message || "Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  const total = useMemo(
    () =>
      transactions.reduce((sum, t) => {
        const val = typeof t?.amount === "number" ? t.amount : Number(t?.amount || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0),
    [transactions]
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Plaid Sandbox (Link)</h2>
          <button
            onClick={() => open()}
            disabled={!ready || !linkToken || loading}
            className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {ready ? "Connect your bank" : "Preparing…"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Sandbox: use <code>user_good</code> / <code>pass_good</code> (and <code>1234</code> for MFA if prompted).
        </p>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="flex items-center gap-2">
            <span className="w-28 text-sm text-gray-600">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28 text-sm text-gray-600">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={runRefresh}
            disabled={loading || !accessToken}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh Transactions
          </button>
          <button
            onClick={runGetTransactions}
            disabled={loading || !accessToken}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Get Transactions
          </button>
        </div>

        {/* Tokens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">Public Token</div>
            <code className="text-[12px] break-all">{publicToken || "—"}</code>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">Access Token</div>
            <code className="text-[12px] break-all">{accessToken || "—"}</code>
          </div>
        </div>

        {/* Error / Log */}
        {!!error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="mb-4 p-3 rounded-lg bg-gray-50 text-xs h-28 overflow-auto whitespace-pre-wrap">
          {log.length ? log.join("\n") : "Logs will appear here…"}
        </div>

        {/* Transactions */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Transactions</h3>
            <div className="text-sm text-gray-600">
              Count: {transactions.length} · Total: ${total.toFixed(2)}
            </div>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Pending</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, i) => (
                    <tr key={`${t.transaction_id || i}`} className="border-t">
                      <td className="p-2">{t.date || "—"}</td>
                      <td className="p-2">{t.name || "—"}</td>
                      <td className="p-2 text-right">
                        {typeof t.amount === "number" ? t.amount.toFixed(2) : t.amount}
                      </td>
                      <td className="p-2">
                        {Array.isArray(t.category) ? t.category.join(" › ") : t.category || "—"}
                      </td>
                      <td className="p-2">{t.pending ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Reconnect any time via “Connect your bank”. Use Sandbox test creds.
        </p>
      </div>
    </div>
  );
}
