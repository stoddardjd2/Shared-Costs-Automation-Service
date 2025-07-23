import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Plus,
  Settings,
  Calendar,
  Link,
  MoreVertical,
  TrendingUp,
  Info,
  RotateCcw,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { getFrequencyColor, getNextDueStatus } from "../../utils/helpers";
import ManageRecurringCostModal from "./ManageRecurringCostModal";

const RecurringCostsSection = () => {
  const { costs, participants, updateCost } = useData();
  const navigate = useNavigate();

  // Tab and filtering state
  const [activeTab, setActiveTab] = useState("recurring");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const itemsPerPage = 5;

  // Modal state
  const [selectedCost, setSelectedCost] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCostTooltip, setShowCostTooltip] = useState(false);
  const [hoveredCostId, setHoveredCostId] = useState(null);

  // Filter costs based on active tab
  const filteredByType = useMemo(() => {
    return costs.filter((cost) =>
      activeTab === "recurring" ? cost.isRecurring : !cost.isRecurring
    );
  }, [costs, activeTab]);

  // Apply search and status filters
  const filteredCosts = useMemo(() => {
    return filteredByType.filter((cost) => {
      const matchesSearch = cost.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== "all") {
        const hasStatus = cost.participants.some(
          (p) => p.status === statusFilter
        );
        matchesStatus = hasStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }, [filteredByType, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCosts = filteredCosts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest(".status-dropdown")) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Helper function to generate avatar for users
  const getUserAvatar = (user) => {
    const name = user?.name || "";
    const nameParts = name.split(" ");
    const avatar =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : name.slice(0, 2);

    return {
      avatar: avatar.toUpperCase(),
    };
  };

  // Format the amount per person based on split type
  const formatAmountDisplay = (cost) => {
    const totalParticipants = cost.participants.length;
    const amountPerPerson =
      totalParticipants > 0 ? cost.amount / totalParticipants : cost.amount;
    return {
      amount: `$${Number(amountPerPerson).toFixed(2)}`,
      label: "each",
    };
  };

  // Format billing frequency for display
  const formatBillingFrequency = (frequency) => {
    if (!frequency || frequency === "monthly") {
      return "Monthly requests";
    }
    if (frequency === "weekly") {
      return "Weekly requests";
    }
    if (frequency === "quarterly") {
      return "Quarterly requests";
    }
    if (frequency === "yearly") {
      return "Yearly requests";
    }
    return `${frequency} requests`;
  };

  // Get status color for solid indicator
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-orange-500";
      case "overdue":
        return "bg-red-500";
      default:
        return null;
    }
  };

  const handleManageCost = (cost) => {
    setSelectedCost(cost);
    setShowManageModal(true);
  };

  const handleCloseModal = () => {
    setShowManageModal(false);
    setSelectedCost(null);
  };

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return "All Status";
    }
  };

  return (
    <>
      <div className="w-full bg-gray-50 min-h-screen">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Requests</h1>
          <p className="text-gray-600">Manage your recurring and one-time payment requests</p>
        </div> */}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200/60">
            <button
              onClick={() => setActiveTab("recurring")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === "recurring"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Recurring Payments
            </button>
            <button
              onClick={() => setActiveTab("onetime")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === "onetime"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              One-time Payments
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search payment requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative status-dropdown">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200/60 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 min-w-[140px]"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {getStatusFilterLabel()}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showStatusDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      statusFilter === "all"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("paid");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      statusFilter === "paid"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("pending");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      statusFilter === "pending"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("overdue");
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      statusFilter === "overdue"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Overdue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-slate-600">
          Showing {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredCosts.length)} of{" "}
          {filteredCosts.length}{" "}
          {activeTab == "onetime" ? "one-time" : activeTab} payments
        </div>

        {/* Payment Requests Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                {activeTab === "recurring" ? (
                  <RefreshCw className="w-5 h-5 text-white" />
                ) : (
                  <Calendar className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-slate-900">
                  {activeTab === "recurring" ? "Recurring" : "One-time"} Payment
                  Requests
                </h2>
                <p className="text-gray-600 text-sm">
                  {activeTab === "recurring"
                    ? "Manage your ongoing payment requests"
                    : "Manage your one-time payment requests"}
                </p>
              </div>
            </div>
          </div>

          {paginatedCosts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                {activeTab === "recurring" ? (
                  <RefreshCw className="w-10 h-10 text-slate-400" />
                ) : (
                  <Calendar className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No {activeTab == "onetime" ? "one-time" : activeTab} requests
                found
              </h3>
              {/* <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : `Add a ${
                      activeTab == "onetime" ? "one-time" : activeTab
                    } payment request.`}
              </p> */}
              {/* <button
                onClick={() => navigate("/costs/new")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-sm"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add {activeTab === "recurring" ? "Recurring" : "One-time"} Cost
              </button> */}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedCosts.map((cost) => {
                const totalParticipants = cost.participants.length;
                const dueStatus = getNextDueStatus(cost.nextDue);

                return (
                  <div
                    key={cost.id}
                    className="p-6 hover:bg-slate-50/50 transition-all duration-200 group"
                  >
                    {/* Header line with cost name and manage button */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {cost.isDynamic ? (
                          <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3 bg-gradient-to-r from-orange-300 via-orange-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
                            {cost.name}
                          </h3>
                        ) : (
                          <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3">
                            {cost.name}
                          </h3>
                        )}
                      </div>

                      {/* Manage button */}
                      <button
                        onClick={() => handleManageCost(cost)}
                        className="opacity-60 hover:opacity-100 text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-all duration-200 group-hover:opacity-80 shrink-0"
                        title="Manage cost"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Price and People section - full width */}
                    <div className="flex justify-between items-start mb-4">
                      {/* Price section */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                {formatAmountDisplay(cost).amount}
                              </span>
                              <span className="text-sm font-medium text-gray-500">
                                {formatAmountDisplay(cost).label}
                              </span>
                            </div>
                          </div>

                          {/* Dynamic cost tracking badge */}
                          {cost.isDynamic && (
                            <div className="relative">
                              <div
                                className="flex items-center justify-center bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer relative"
                                onMouseEnter={() => setHoveredCostId(cost.id)}
                                onMouseLeave={() => setHoveredCostId(null)}
                              >
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                                <Info className="w-4 h-4 text-gray-500 absolute -top-2 -right-2" />
                              </div>

                              {/* Tooltip - only show for the specific hovered cost */}
                              {hoveredCostId === cost.id && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
                                  <p className="mb-2">
                                    <strong>Dynamic Costs:</strong> Track when
                                    amounts change between payment cycles
                                  </p>
                                  <p>
                                    Dynamic costs are useful for any recurring
                                    cost that varies each period, like utilities
                                  </p>
                                  <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {cost.isRecurring ? (
                            <>
                              <RotateCcw className="w-3 h-3 text-blue-500" />
                              <span>
                                {formatBillingFrequency(cost.frequency)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3 h-3 text-blue-500" />
                              <span>One-time payment</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Next due date */}
                      {(cost.nextDue || cost.dueDate) && (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-100/80 backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {cost.isRecurring ? "Next: " : "Due: "}
                            {new Date(
                              cost.nextDue || cost.dueDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* People display section */}
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {cost.participants
                            .slice(0, 5)
                            .map((participant, index) => {
                              const user = participants.find(
                                (u) => u.id === participant.userId
                              );
                              const { avatar } = getUserAvatar(user);
                              const statusColor = getStatusColor(
                                participant.status
                              );

                              return (
                                <div
                                  key={participant.userId}
                                  className={`w-9 h-9 rounded-xl ${user?.color} flex items-center justify-center text-white font-semibold text-xs border-2 border-white shadow-sm relative group/avatar hover:translate-x-1 transition-transform duration-200`}
                                  style={{
                                    zIndex: cost.participants.length - index,
                                  }}
                                >
                                  {avatar}

                                  {/* Solid color status indicator */}
                                  {statusColor && (
                                    <div
                                      className={`absolute -bottom-0.5 -right-0.5 ${statusColor} rounded-full w-3 h-3 border border-white shadow-sm`}
                                    ></div>
                                  )}

                                  {/* Tooltip */}
                                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {user?.name}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                  </div>
                                </div>
                              );
                            })}
                          {cost.participants.length > 5 && (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-white shadow-sm relative group/avatar hover:translate-x-1 transition-transform duration-200">
                              +{cost.participants.length - 5}
                              {/* Tooltip for overflow count */}
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {cost.participants.length - 5} more{" "}
                                {cost.participants.length - 5 === 1
                                  ? "person"
                                  : "people"}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* People count indicator */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">
                            {totalParticipants}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {paginatedCosts.length > 0 && (
            <div className="p-6 bg-slate-50/30 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{filteredCosts.length}</span>{" "}
                  {activeTab == "onetime" ? "one-time" : activeTab}{" "}
                  {filteredCosts.length === 1
                    ? "payment request"
                    : "payment requests"}
                </div>
                <button
                  onClick={() => navigate("/costs/new")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Request
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg border border-slate-200/60 shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>

      {showManageModal && selectedCost && (
        <ManageRecurringCostModal
          cost={selectedCost}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default RecurringCostsSection;
