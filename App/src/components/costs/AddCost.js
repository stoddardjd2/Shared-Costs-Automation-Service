import { useState } from "react";
import { useChargeState } from "../../hooks/useChargeState";
import { usePeopleState } from "../../hooks/usePeopleState";
import { useSplitState } from "../../hooks/useSplitState";
import { STEPS } from "../../utils/stepUtils";

import ChargeTypeStep from "../steps/ChargeTypeStep";
import ChargeSearchStep from "../steps/ChargeSearchStep";
import ChargeDetailsStep from "../steps/ChargeDetailsStep";
import SearchStep from "../steps/SearchStep";
import AddStep from "../steps/AddStep";

const AddCost = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.CHARGE_TYPE);

  const chargeState = useChargeState();
  const peopleState = usePeopleState();
  const splitState = useSplitState();

  const handleChargeTypeSelect = (type) => {
    chargeState.setChargeType(type);
    if (type === "existing") {
      setCurrentStep(STEPS.CHARGE_SEARCH);
    } else {
      setCurrentStep(STEPS.CHARGE_DETAILS);
    }
  };

  const handleChargeSelect = (charge) => {
    chargeState.setSelectedCharge(charge);
    setCurrentStep(STEPS.SEARCH);
  };

  const handleCreateCharge = (chargeName) => {
    chargeState.setNewChargeDetails((prev) => ({ ...prev, name: chargeName }));
    setCurrentStep(STEPS.CHARGE_DETAILS);
  };

  const handleAddContact = () => {
    setCurrentStep(STEPS.ADD);
  };

  const handleAddPerson = () => {
    const success = peopleState.handleAddNewPerson();

    // if (success) {
    //   setCurrentStep(STEPS.SEARCH);
    // }
  };

  const handleBack = () => {
    switch (currentStep) {
      case STEPS.CHARGE_SEARCH:
        setCurrentStep(STEPS.CHARGE_TYPE);
        break;
      case STEPS.CHARGE_DETAILS:
        setCurrentStep(
          chargeState.chargeType === "new"
            ? STEPS.CHARGE_TYPE
            : STEPS.CHARGE_SEARCH
        );
        break;
      case STEPS.SEARCH:
        setCurrentStep(
          chargeState.selectedCharge
            ? STEPS.CHARGE_SEARCH
            : STEPS.CHARGE_DETAILS
        );
        break;
      case STEPS.ADD:
        setCurrentStep(STEPS.SEARCH);
        break;
      default:
        setCurrentStep(STEPS.CHARGE_TYPE);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.CHARGE_TYPE:
        return <ChargeTypeStep onChargeTypeSelect={handleChargeTypeSelect} />;

      case STEPS.CHARGE_SEARCH:
        return (
          <ChargeSearchStep
            chargeSearchQuery={chargeState.chargeSearchQuery}
            setChargeSearchQuery={chargeState.setChargeSearchQuery}
            filteredCharges={chargeState.filteredCharges}
            onChargeSelect={handleChargeSelect}
            onCreateCharge={handleCreateCharge}
            onBack={handleBack}
            setTotalAmount={splitState.setTotalAmount}
          />
        );

      case STEPS.CHARGE_DETAILS:
        return (
          <ChargeDetailsStep
            newChargeDetails={chargeState.newChargeDetails}
            setNewChargeDetails={chargeState.setNewChargeDetails}
            onContinue={() => setCurrentStep(STEPS.SEARCH)}
            onBack={handleBack}
            chargeType={chargeState.chargeType}
          />
        );

      case STEPS.SEARCH:
        return (
          <SearchStep
            // People state
            searchQuery={peopleState.searchQuery}
            setSearchQuery={peopleState.setSearchQuery}
            selectedPeople={peopleState.selectedPeople}
            filteredPeople={peopleState.filteredPeople}
            togglePersonSelection={peopleState.togglePersonSelection}
            onAddContact={handleAddContact}
            onBack={handleBack}
            // Charge state
            selectedCharge={chargeState.selectedCharge}
            newChargeDetails={chargeState.newChargeDetails}
            // Split state
            splitType={splitState.splitType}
            setSplitType={splitState.setSplitType}
            totalAmount={splitState.totalAmount}
            setTotalAmount={splitState.setTotalAmount}
            customAmounts={splitState.customAmounts}
            updateCustomAmount={splitState.updateCustomAmount}
            showSplitPanel={splitState.showSplitPanel}
            setShowSplitPanel={splitState.setShowSplitPanel}
            calculateSplitAmounts={splitState.calculateSplitAmounts}
            // New person form
            newPerson={peopleState.newPerson}
            setNewPerson={peopleState.setNewPerson}
            handleAddNewPerson={peopleState.handleAddNewPerson}
          />
        );

      case STEPS.ADD:
        return (
          <AddStep
            newPerson={peopleState.newPerson}
            setNewPerson={peopleState.setNewPerson}
            onAddPerson={handleAddPerson}
            onBack={handleBack}
            newPeople={peopleState.newPeople}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Step not implemented yet
              </h1>
              <p className="text-gray-600 mb-6">Current step: {currentStep}</p>
              <button
                onClick={() => setCurrentStep(STEPS.CHARGE_TYPE)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Start
              </button>
            </div>
          </div>
        );
    }
  };

  return renderCurrentStep();
};

export default AddCost;
