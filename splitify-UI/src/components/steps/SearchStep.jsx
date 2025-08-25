import React, { useState } from "react";
import { Search, Plus, ArrowLeft, Users, ArrowRight } from "lucide-react";
import StepIndicator from "./StepIndicator";
import ChargeDisplay from "../costs/ChargeDisplay";
import ContactCard from "../costs/ContactCard";
import ConfirmButtonTray from "./ConfirmButtonTray";

const SearchStep = ({
  searchQuery,
  setSearchQuery,
  selectedPeople,
  filteredPeople,
  togglePersonSelection,
  onAddContact,
  onBack,
  onContinue,
  selectedCharge,
  newChargeDetails,
  // New person form
  newPerson,
  setNewPerson,
  handleAddNewPerson,
  onDeletePerson,
  handleUpdatePersonName,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 mt-4">
      {/* Main content with padding bottom to prevent button tray overlap */}
      <div className="pb-36">
        <div className="max-w-lg mx-auto px-6 py-0">
          {/* <StepIndicator current="search" /> */}

          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Select People
              </h1>
              <p className="text-gray-600">Choose who to split charges with</p>
            </div>
          </div>

          {/* <ChargeDisplay
            selectedCharge={selectedCharge}
            newChargeDetails={newChargeDetails}
            recurringType={
              newChargeDetails
                ? newChargeDetails.frequency
                : selectedCharge.frequency
            }
          /> */}

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

          <div className="space-y-3 mb-8">
            {filteredPeople.length > 0 ? (
              filteredPeople.map((person, index) => (
                <ContactCard
                  key={person._id}
                  person={person}
                  isSelected={
                    !!selectedPeople.find((p) => p._id === person._id)
                  }
                  onToggle={togglePersonSelection}
                  onDeletePerson={onDeletePerson}
                  handleUpdatePersonName={handleUpdatePersonName}
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
        </div>
      </div>

      <ConfirmButtonTray
        buttonContent={
          <>
            Continue
            <ArrowRight className="w-5 h-5" />
          </>
        }
        isCheckout={false}
        selectedPeople={selectedPeople}
        onConfirm={onContinue}
        hideBillingInfo={true}
      />
    </div>
  );
};

export default SearchStep;
