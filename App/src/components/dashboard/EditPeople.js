import { useState } from "react";

// import SearchStep from "../steps/SearchStep";

export default function EditPeople({
  selectedCharge,
  setSelectedCharge,
  setSelectedPeople,
  selectedPeople,
}) {
  return (
    <div className="fixed inset-0 z-[600]">test
      <SearchStep
        // People state
        searchQuery={peopleState.searchQuery}
        setSearchQuery={peopleState.setSearchQuery}
        selectedPeople={selectedPeople}
        filteredPeople={peopleState.filteredPeople}
        togglePersonSelection={peopleState.togglePersonSelection}
        onAddContact={handleAddContact}
        onBack={handleBack}
        onContinue={handleContinueToSplit}
        // Charge state
        selectedCharge={chargeState.selectedCharge}
        newChargeDetails={chargeState.newChargeDetails}
        // New person form
        newPerson={peopleState.newPerson}
        setNewPerson={peopleState.setNewPerson}
        handleAddNewPerson={peopleState.handleAddNewPerson}
      />
    </div>
  );
}
