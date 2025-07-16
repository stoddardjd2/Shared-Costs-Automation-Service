import React, { useState } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Users,
  ArrowRight,
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
  onContinue,
  selectedCharge,
  newChargeDetails,
  // New person form
  newPerson,
  setNewPerson,
  handleAddNewPerson,
}) => {
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

        {/* Continue Button */}
        {selectedPeople.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
            <div className="max-w-lg mx-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedPeople.length} {selectedPeople.length === 1 ? "person" : "people"} selected
                  </h3>
                  <div className="flex -space-x-2 mt-2">
                    {selectedPeople.slice(0, 5).map((person) => (
                      <div
                        key={person.id}
                        className={`w-8 h-8 rounded-full ${person.color} flex items-center justify-center text-white font-semibold text-xs border-2 border-white`}
                      >
                        {person.avatar}
                      </div>
                    ))}
                    {selectedPeople.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                        +{selectedPeople.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onContinue}
                className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all hover:shadow-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3"
              >
                Continue to Split
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchStep;