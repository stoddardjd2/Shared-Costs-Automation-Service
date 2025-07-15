import React from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Users,
  User,
  Phone,
  X,
  Calculator,
  DollarSign,
  Send,
} from "lucide-react";
import StepIndicator from "./StepIndicator";
import ChargeDisplay from "../costs/ChargeDisplay";
import ContactCard from "../costs/ContactCard";

const SearchStep = ({
  searchQuery,
  setSearchQuery,
  selectedPeople,
  filteredPeople,
  togglePersonSelection,
  onAddContact,
  onBack,
  selectedCharge,
  newChargeDetails,
  // Split state
  splitType,
  setSplitType,
  totalAmount,
  setTotalAmount,
  customAmounts,
  updateCustomAmount,
  showSplitPanel,
  setShowSplitPanel,
  calculateSplitAmounts,
  // New person form
  newPerson,
  setNewPerson,
  handleAddNewPerson,
}) => {
  const renderSplitPanel = () => {
    if (!showSplitPanel) return null;

    const splitAmounts = calculateSplitAmounts(selectedPeople);
    console.log("Split amounts:", splitAmounts);
    const totalSplit = Object.values(splitAmounts).reduce(
      (sum, amount) => sum + Number(amount || 0),
      0
    );

    return (
      <div className="p-6 h-full overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Split with {selectedPeople.length}
              {"  "}
              {selectedPeople.length !== 1 ? "people" : "person"}
            </h3>
            <p className="text-gray-600 text-sm">
              Choose how to divide the costs
            </p>
          </div>
          <button
            onClick={() => setShowSplitPanel(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Split Options */}
        <div className="space-y-3 mb-6">
          <div
            onClick={() => setSplitType("equal")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              splitType === "equal"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Split Equally
                </h4>
                <p className="text-gray-600 text-xs">Divide total evenly</p>
              </div>
              {splitType === "equal" && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white transform rotate-45" />
                </div>
              )}
            </div>
          </div>

          <div
            onClick={() => setSplitType("custom")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              splitType === "custom"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Custom Amounts
                </h4>
                <p className="text-gray-600 text-xs">Set specific amounts</p>
              </div>
              {splitType === "custom" && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white transform rotate-45" />
                </div>
              )}
            </div>
          </div>

          <div
            onClick={() => setSplitType("customTotal")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              splitType === "customTotal"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Custom Total Split
                </h4>
                <p className="text-gray-600 text-xs">
                  Custom total, split equally
                </p>
              </div>
              {splitType === "customTotal" && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white transform rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount Input */}
        {/* {splitType === "equal" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg outline-none text-base bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
        )} */}

        {splitType === "custom" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Individual Amounts
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedPeople.map((person) => (
                <div key={person.id} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded ${person.color} flex items-center justify-center text-white font-semibold text-xs`}
                  >
                    {person.avatar}
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                    {person.name}
                  </span>
                  <div className="relative w-20">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="number"
                      value={customAmounts[person.id] || ""}
                      onChange={(e) =>
                        updateCustomAmount(person.id, e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded text-xs outline-none bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {splitType === "customTotal" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Total Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={customAmounts["total"] || ""}
                onChange={(e) => {
                  console.log("UPDATING TOTAL AMOUNT", e.target.value);
                  updateCustomAmount("total", e.target.value);
                }}
                placeholder="Enter total amount"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg outline-none text-base bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Live Total Display */}
        {totalSplit > 0 && selectedPeople && selectedPeople.length > 0 && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Total Split
              </span>
              <span className="text-lg font-bold text-blue-600">
                {console.log("Total Split ERROR:", totalSplit)}$
                {totalSplit.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              ${(totalSplit / selectedPeople.length).toFixed(2)} per person
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={() => {
            if (totalSplit > 0 && selectedPeople && selectedPeople.length > 0) {
              const chargeName =
                selectedCharge?.name ||
                newChargeDetails.customName ||
                newChargeDetails.name;
              alert(
                `Sending payment requests for "${chargeName}" totaling $${totalSplit.toFixed(
                  2
                )} to ${selectedPeople.length} people`
              );
            }
          }}
          disabled={totalSplit <= 0}
          className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
          style={{
            backgroundColor: totalSplit > 0 ? "#2563eb" : "#d1d5db",
          }}
        >
          <Send className="w-5 h-5" />
          {totalSplit > 0
            ? `Send Requests ($${totalSplit.toFixed(2)})`
            : "Enter Amount to Continue"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <StepIndicator current="search" />

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Select People</h1>
            <p className="text-gray-600">Choose who to split charges with</p>
          </div>
        </div>

        <ChargeDisplay
          selectedCharge={selectedCharge}
          newChargeDetails={newChargeDetails}
        />

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <button
          onClick={onAddContact}
          className="w-full mb-8 p-4 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all hover:shadow-md group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Add New Person
        </button>

        {/* Quick Add Contact Form */}
        {/* <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Quick Add Contact
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newPerson.name}
              onChange={(e) =>
                setNewPerson((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Full name"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <input
              type="tel"
              value={newPerson.phone}
              onChange={(e) =>
                setNewPerson((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Phone number"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              onClick={handleAddNewPerson}
              disabled={!newPerson.name.trim() || !newPerson.phone.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add to Split
            </button>
          </div>
        </div> */}

        <div className="space-y-3 mb-32">
          {filteredPeople.length > 0 ? (
            filteredPeople.map((person) => (
              <ContactCard
                key={person.id}
                person={person}
                isSelected={!!selectedPeople.find((p) => p.id === person.id)}
                onToggle={togglePersonSelection}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Start typing to search people you know
              </p>
            </div>
          )}
        </div>

        {/* Split Button and Expanded Tray */}
        {selectedPeople.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl transition-all duration-300">
            <div className="max-w-lg mx-auto h-full">
              {!showSplitPanel ? (
                /* Collapsed Button */
                <div className="p-6">
                  <button
                    onClick={() => setShowSplitPanel(true)}
                    className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all hover:shadow-xl bg-blue-600 hover:bg-blue-700"
                  >
                    Split with {selectedPeople.length}{" "}
                    {selectedPeople.length !== 1 ? "people" : "person"}
                  </button>
                </div>
              ) : (
                /* Expanded Tray */
                renderSplitPanel()
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchStep;
