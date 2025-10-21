import { useState, useEffect, useCallback, useRef } from "react";
import { plaidAPI } from "../../queries/plaidService";
import TransactionsDatePicker from "./TransactionsDatePicker";
import { getTransactions } from "../../queries/plaidService";
// Configurable lazy loading settings
const LAZY_LOAD_CONFIG = {
  initialLoadCount: 20, // Number of transactions to load initially
  loadMoreCount: 15, // Number of transactions to load when scrolling
  scrollThreshold: 0.8, // Trigger load when 80% scrolled (0.1 = 10%, 1.0 = 100%)
  debounceDelay: 100, // Debounce scroll events (ms)
  enableVirtualization: false, // Enable for very large datasets (experimental)
  showLoadingIndicator: true, // Show loading spinner when fetching more
};

export default function PlaidTransactionsModal({
  isOpen,
  onClose,
  onSelect,
  accessToken,
  handleConnect,
  setReloginRequired,
  lazyLoadConfig = {}, // Allow overriding default config
}) {
  const config = { ...LAZY_LOAD_CONFIG, ...lazyLoadConfig };

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitialTransactions, setIsLoadingInitialTransactions] =
    useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const scrollContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // NEW: track initial fetch errors + retry timer
  const [initialLoadError, setInitialLoadError] = useState(null);
  const retryTimeoutRef = useRef(null);

  // Filter transactions (exclude negative amounts, apply search, and date range)
  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      // Filter out negative transactions (expenses)
      if (transaction.amount < 0) {
        return false;
      }

      // Filter by date range
      if (transaction.date) {
        const transactionDate = transaction.date; // Assuming format is YYYY-MM-DD
        if (startDate && transactionDate < startDate) {
          return false;
        }
        if (endDate && transactionDate > endDate) {
          return false;
        }
      }

      // Apply search filter
      if (searchQuery) {
        const name = transaction.name || "";
        const merchantName = transaction.merchant_name || "";
        const query = searchQuery.toLowerCase();

        return (
          name.toLowerCase().includes(query) ||
          merchantName.toLowerCase().includes(query)
        );
      }

      return true;
    });

    setFilteredTransactions(filtered);
    setCurrentIndex(0);
    setHasMore(filtered.length > config.initialLoadCount);

    // Load initial batch
    setDisplayedTransactions(filtered.slice(0, config.initialLoadCount));
  }, [searchQuery, startDate, endDate, transactions, config.initialLoadCount]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedTransaction(null);
      setCurrentIndex(0);
      setIsLoading(false);

      // Reset date range to defaults
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(new Date().toISOString().slice(0, 10));

      // Reset scroll position
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }

    // Cleanup any pending retry when modal closes/unmounts
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [isOpen]);

  // Load more transactions
  const loadMoreTransactions = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate async loading with setTimeout (remove in real implementation)
    setTimeout(() => {
      const newIndex = currentIndex + config.initialLoadCount;
      const nextBatch = filteredTransactions.slice(
        newIndex,
        newIndex + config.loadMoreCount
      );

      setDisplayedTransactions((prev) => [...prev, ...nextBatch]);
      setCurrentIndex(newIndex);
      setHasMore(newIndex + config.loadMoreCount < filteredTransactions.length);
      setIsLoading(false);
    }, 200); // Simulate network delay
  }, [currentIndex, filteredTransactions, hasMore, isLoading, config]);

  // Handle scroll events with debouncing
  const handleScroll = useCallback(
    (e) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        if (
          scrollPercentage >= config.scrollThreshold &&
          hasMore &&
          !isLoading
        ) {
          loadMoreTransactions();
        }
      }, config.debounceDelay);
    },
    [
      hasMore,
      isLoading,
      loadMoreTransactions,
      config.scrollThreshold,
      config.debounceDelay,
    ]
  );

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleSelect = () => {
    if (selectedTransaction) {
      onSelect(selectedTransaction);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedTransaction(null);
    setSearchQuery("");
    setCurrentIndex(0);
    // Reset dates will happen in useEffect when modal reopens
  };

  const getDisplayName = (transaction) => {
    return (
      transaction.name || transaction.merchant_name || "Unknown Transaction"
    );
  };

  const getMerchantName = (transaction) => {
    return transaction.merchant_name || "Unknown Merchant";
  };

  // need to move accessTOken to backend
  useEffect(() => {
    let isMounted = true;

    async function fetchTransactions(isRetry = false) {
      // keep the primary loader visible during retries
      if (!isRetry) setIsLoadingInitialTransactions(true);

      try {
        setInitialLoadError(null);
        const transactions = await getTransactions(startDate, endDate);
        console.log("TRANSACTIONs", transactions);
        if (transactions.loginRequired) {
          alert("Login required for bank");
          setReloginRequired(true);
          handleConnect();
          return;
        }
        if (!isMounted) return;
        setTransactions(transactions || []);
        setIsLoadingInitialTransactions(false);

        // clear any scheduled retry on success
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } catch (err) {
        console.log("failed to fetch transactions", err);
        if (!isMounted) return;

        // show loader + helpful note and schedule retry every 15s
        setInitialLoadError(err?.message || "Request failed");
        setIsLoadingInitialTransactions(true);

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          // only retry if still mounted and modal still open
          if (isMounted && isOpen) {
            fetchTransactions(true);
          }
        }, 15000);
      }
    }

    fetchTransactions();

    return () => {
      isMounted = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [startDate, endDate, isOpen]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[51] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white h-[calc(100dvh*3/4)] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900">
              Select Transaction
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Showing {displayedTransactions.length} of{" "}
              {filteredTransactions.length} transactions
              {hasMore && " • Scroll for more"}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg p-2 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/*Date Range */}
        <div className="p-4 border-b border-slate-200 space-y-4">
          {/* Date Range */}
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <TransactionsDatePicker
                position={"left"}
                setDate={setStartDate}
                currentDate={startDate}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                End Date
              </label>
              <TransactionsDatePicker
                setDate={setEndDate}
                currentDate={endDate}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Transaction List */}
        {isLoadingInitialTransactions ? (
          <div className="h-full flex items-center justify-center py-6">
            <div className="flex items-center space-x-2 text-slate-500 max-w-[90%]">
              <div className="animate-spin rounded-full flex-shrink-0 h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
              <span className="text-sm">
                {initialLoadError
                  ? "Loading transactions… If you just linked your account, Plaid may need up to a minute to prepare your data. We'll retry automatically every 15 seconds."
                  : "Loading transactions..."}
              </span>
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-2"
            onScroll={handleScroll}
          >
            {displayedTransactions.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="text-4xl mb-4 opacity-50">🔍</div>
                <p>No transactions found</p>
                {searchQuery && (
                  <p className="text-xs mt-2">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  {displayedTransactions.map((transaction, index) => (
                    <div
                      key={`${transaction.transaction_id}-${index}`}
                      onClick={() => handleTransactionSelect(transaction)}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedTransaction?.transaction_id ===
                        transaction.transaction_id
                          ? "bg-blue-50 border-blue-500"
                          : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                        {transaction.logo_url ? (
                          <img
                            src={transaction.logo_url}
                            alt={getMerchantName(transaction)}
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
                            display: transaction.logo_url ? "none" : "flex",
                          }}
                        >
                          {getMerchantName(transaction).charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {getDisplayName(transaction)}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {getMerchantName(transaction)}
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div
                          className={`text-sm font-semibold ${"text-blue-600"}`}
                        >
                          {formatAmount(transaction.amount)}
                        </div>
                        <div className="flex gap-3">
                          <div className="hidden sm:flex text-xs text-slate-400 capitalize">
                            {transaction.billingFrequency}
                          </div>

                          <div className="text-xs min-w-[70px] text-slate-500">
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loading indicator */}
                {isLoading && config.showLoadingIndicator && (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <div className="animate-spin flex-shrink-0 rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                      <span className="text-sm">
                        Loading more transactions...
                      </span>
                    </div>
                  </div>
                )}

                {/* End indicator */}
                {!hasMore &&
                  displayedTransactions.length > config.initialLoadCount && (
                    <div className="text-center py-4 text-xs text-slate-400">
                      All transactions loaded
                    </div>
                  )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTransaction}
            style={{
              backgroundColor: selectedTransaction
                ? "rgb(37, 99, 235)"
                : undefined,
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              selectedTransaction
                ? "hover:bg-blue-700"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Select Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
