import React, { useState } from "react";
import { PiggyBank, Building2, ArrowRight } from "lucide-react";
import PlaidConnect from "../../plaid/PlaidConnect";
import SplitifyPremiumModal from "../../premium/SplitifyPremiumModal";
/**
 * Extracted Plaid step.
 * Original JSX/content/styles preserved 1:1.
 */
export default function PlaidStep({
  plaidIntent,
  setPlaidIntent,

  // nav + skip
  onNext,
  onBack,
  canSkipThisStep,
  skipStep,
  setDefaultStepsConfig,
  // UI helpers from wizard (same components, no duplication)
  SectionTitle,
  OptionsGrid,
  CardOption,
  FooterNav,
  setShowPremiumModal,
  showPremiumModal,
  userData,
  setUserData,
}) {
  const [showPlaidConnect, setShowPlaidConnect] = useState(false);
  return (
    <div className="px-2">
      <SectionTitle
        icon={<PiggyBank className="w-6 h-6" />} // unique vs options
        title="Automate real bills from your bank?"
        subtitle="We’ll import transactions and update requests automatically."
      />

      <OptionsGrid>
        <CardOption
          icon={<Building2 className="w-5 h-5" />}
          title="Connect my bank"
          description="Best if your bills change month to month"
          selected={plaidIntent === true}
          onClick={() => setPlaidIntent(true)}
        />
        <CardOption
          icon={<ArrowRight className="w-5 h-5" />}
          title="Skip this step"
          selected={plaidIntent === false}
          onClick={() => setPlaidIntent(false)}
        />
      </OptionsGrid>

      <FooterNav
        primaryLabel="Next"
        onPrimary={() => {
          if (plaidIntent) {
            if (userData.plan == "free") {
              setShowPremiumModal(true);
              console.log("Show premiumModal", showPremiumModal);
            } else {
              setShowPlaidConnect(true);
              console.log("setShowPlaidConnect ON!", showPlaidConnect);
            }
          } else {
            onNext();
          }
        }}
        primaryDisabled={plaidIntent === null}
        onSecondary={onBack}
        showSkip={canSkipThisStep}
        onSkip={skipStep}
      />

      <SplitifyPremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
        }}
        specialCaseScroll={false}
      />

      {showPlaidConnect && (
        <>
          {console.log("CONNECTING TO PLAID")}
          <PlaidConnect
            isOnboardingStep={true}
            onPlaidLinkSuccess={() => {
              onNext();
            }}
            onPlaidLinkExit={() => {
              setShowPlaidConnect(false);
            }}
          />
        </>
      )}
    </div>
  );
}
