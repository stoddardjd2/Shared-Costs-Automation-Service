import { useState } from "react";
import { useChargeState } from "../../hooks/useChargeState";
import { usePeopleState } from "../../hooks/usePeopleState";
import { useSplitState } from "../../hooks/useSplitState";
import { STEPS } from "../../utils/stepUtils";

import ChargeTypeStep from "../steps/ChargeTypeStep";
import ChargeSearchStep from "../steps/ChargeSearchStep";
import ChargeDetailsStep from "../steps/ChargeDetailsStep";
import SearchStep from "../steps/SearchStep";
import SplitStep from "../steps/SplitStep";
import AddStep from "../steps/AddStep";

const AddCost = ({ setIsAddingRequest }) => {
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

  const handleContinueToSplit = () => {
    setCurrentStep(STEPS.SPLIT);
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
          !chargeState.isManualCharge
            ? STEPS.CHARGE_SEARCH
            : STEPS.CHARGE_DETAILS
        );
        break;
      case STEPS.SPLIT: // ADD THIS CASE
        setCurrentStep(STEPS.SEARCH);
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
        return (
          <ChargeTypeStep
            onChargeTypeSelect={handleChargeTypeSelect}
            setIsAddingRequest={setIsAddingRequest}
          />
        );

      case STEPS.CHARGE_SEARCH:
        return (
          <ChargeSearchStep
            chargeSearchQuery={chargeState.chargeSearchQuery}
            setChargeSearchQuery={chargeState.setChargeSearchQuery}
            filteredCharges={chargeState.filteredCharges}
            setIsManualCharge={chargeState.setIsManualCharge}
            onChargeSelect={handleChargeSelect}
            onCreateCharge={handleCreateCharge}
            onBack={handleBack}
            setTotalAmount={splitState.setTotalAmount}
            setCustomAmounts={splitState.setCustomAmounts}
            setSplitType={splitState.setSplitType}
            percentageAmounts={splitState.percentageAmounts}
            setPercentageAmounts={splitState.setPercentageAmounts}
          />
        );

      case STEPS.CHARGE_DETAILS:
        console.log();
        return (
          <ChargeDetailsStep
            newChargeDetails={chargeState.newChargeDetails}
            setNewChargeDetails={chargeState.setNewChargeDetails}
            onContinue={() => {
              chargeState.setSelectedCharge(chargeState.newChargeDetails);
              chargeState.setIsManualCharge(true);
              setCurrentStep(STEPS.SEARCH);
            }}
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
            onContinue={handleContinueToSplit} // ADD THIS PROP
            // Charge state
            selectedCharge={chargeState.selectedCharge}
            newChargeDetails={chargeState.newChargeDetails}
            // REMOVE ALL SPLIT STATE PROPS - they're not needed anymore
            // New person form
            newPerson={peopleState.newPerson}
            setNewPerson={peopleState.setNewPerson}
            handleAddNewPerson={peopleState.handleAddNewPerson}
          />
        );

      // ADD THIS NEW CASE
      case STEPS.SPLIT:
        return (
          <SplitStep
            selectedPeople={peopleState.selectedPeople}
            onBack={handleBack}
            selectedCharge={chargeState.selectedCharge}
            // newChargeDetails={chargeState.newChargeDetails}
            splitType={splitState.splitType}
            setSplitType={splitState.setSplitType}
            totalAmount={splitState.totalAmount}
            setTotalAmount={splitState.setTotalAmount}
            customAmounts={splitState.customAmounts}
            updateCustomAmount={splitState.updateCustomAmount}
            calculateSplitAmounts={splitState.calculateSplitAmounts}
            setIsAddingRequest={setIsAddingRequest}
            percentageAmounts={splitState.percentageAmounts}
            setPercentageAmounts={splitState.setPercentageAmounts}
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
            // isPhoneInUse={peopleState.isPhoneInUse}
            // setIsPhoneInUse={peopleState.setIsPhoneInUse}
            setEmailError={peopleState.setEmailError}
            emailError={peopleState.emailError}
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
