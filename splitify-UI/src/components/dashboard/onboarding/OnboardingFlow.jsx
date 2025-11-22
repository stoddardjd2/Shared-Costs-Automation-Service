import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Users,
  UsersRound,
  Home,
  ShoppingCart,
  Wifi,
  Receipt,
  Repeat,
  Bell,
  CreditCard,
  Building2,
  Sparkles,
  MessageCircle,
  Search,
  Store,
  UserRound,
  HeartHandshake,
  GraduationCap,
  Settings2,
  CalendarClock,
  PiggyBank,
  Link2,
  BadgeDollarSign,
  CircleDollarSign,
  Bolt,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveOnboarding } from "../../../queries/user";
import PaymentMethodsStep from "./PaymentMethodsStep.jsx";
import PlaidStep from "./PlaidStep.jsx";
import { useData } from "../../../contexts/DataContext.jsx";
/**
 * Splitify Onboarding Wizard
 *
 * Features:
 * - WelcomeScreen styling match (white modal, max-w-2xl, blue CTA)
 * - stepConfig controls enabled/skippable/progress-counted steps
 * - Multi-select: usecase, splitwith, challenge (+ "Other" input)
 * - Two-column (min) grids for all options
 * - Skip setup only visible AFTER first 4 enabled steps are done
 * - Payments inputs remain focused while typing
 *
 * Props:
 *  - initialProfile: { firstName?, lastName?, heardFrom? }
 *  - onComplete(payload)
 *  - onSkipAll()
 *  - setShowFirstTimePrompt(fn)
 *  - stepConfig: { [stepKey]: { enabled?, skippable?, countsTowardProgress? } }
 */
export default function OnboardingWizard({
  initialProfile = {},
  onComplete,
  onSkipAll,
  setShowFirstTimePrompt,
  stepConfig = {},
}) {
  const { userData, setUserData } = useData();

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // ---------------------- State ----------------------
  const [profile, setProfile] = useState({
    firstName: initialProfile.firstName || "",
    lastName: initialProfile.lastName || "",
    heardFrom: initialProfile.heardFrom || "",
    heardFromOther: "",
  });

  // Multi-select
  const [useCase, setUseCase] = useState({ selected: [], other: "" });
  const [splitWith, setSplitWith] = useState({ selected: [], other: "" });
  const [challenge, setChallenge] = useState({ selected: [], other: "" });

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Simple / single-select
  const [reminders, setReminders] = useState({
    frequency: "3days", // daily | 3days | weekly | once | custom
    customEveryDays: 2,
    time: "09:00",
  });

  const [recurring, setRecurring] = useState({ selected: [], bills: {} });

  const [paymentMethods, setPaymentMethods] = useState({
    venmo: "",
    cashapp: "",
    paypal: "",
    zelle: "",
    plaidBank: false,
    otherName: "",
    other: "",
    enabled: {
      venmo: false,
      cashapp: false,
      paypal: false,
      zelle: false,
      plaidBank: false,
      other: false,
    },
  });
  const [plaidIntent, setPlaidIntent] = useState(null); // null | true | false

  // ---------------------- Steps (configurable) ----------------------
  const defaultStepsConfig = useMemo(
    () => ({
      profile: { enabled: true, skippable: false, countsTowardProgress: true },
      usecase: { enabled: true, skippable: false, countsTowardProgress: true },
      splitwith: {
        enabled: true,
        skippable: false,
        countsTowardProgress: true,
      },
      reminders: {
        enabled: true,
        skippable: false,
        countsTowardProgress: true,
      },
      recurring: {
        enabled: true,
        skippable: false,
        countsTowardProgress: true,
      },
      payments: {
        enabled: true,
        skippable: false,
        countsTowardProgress: true,
      },
      plaid: { enabled: true, skippable: false, countsTowardProgress: true },
      challenge: {
        enabled: true,
        skippable: false,
        countsTowardProgress: true,
      },
      done: { enabled: true, skippable: false, countsTowardProgress: false },
    }),
    []
  );

  const mergedConfig = useMemo(() => {
    const out = { ...defaultStepsConfig };
    Object.keys(stepConfig || {}).forEach((k) => {
      out[k] = { ...out[k], ...stepConfig[k] };
    });
    return out;
  }, [defaultStepsConfig, stepConfig]);

  const orderedStepKeys = useMemo(() => {
    const base = [
      "profile",
      "usecase",
      "splitwith",
      "reminders",
      // "recurring",
      "payments",
      "plaid",
      "challenge",
      "done",
    ];

    return base.filter((k) => mergedConfig[k]?.enabled !== false);
  }, [mergedConfig, plaidIntent]);

  const progressStepKeys = useMemo(
    () => orderedStepKeys.filter((k) => mergedConfig[k]?.countsTowardProgress),
    [orderedStepKeys, mergedConfig]
  );

  // const progressStepKeys = orderedStepKeys;

  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = orderedStepKeys[stepIndex];

  useEffect(() => setIsVisible(true), []);

  // Plaid relevance check (multi-select usecase)
  const shouldShowPlaid = true;
  // const shouldShowPlaid = useMemo(() => {
  //   const heavyUseCase = [
  //     "rent",
  //     "utilities",
  //     "subscriptions",
  //     "groceries",
  //   ].some((x) => useCase.selected.includes(x));
  //   const hasRecurring = recurring.selected.length > 0;
  //   const askedBankInPayments = paymentMethods.enabled.plaidBank;
  //   return heavyUseCase || hasRecurring || askedBankInPayments;
  // }, [useCase.selected, recurring.selected, paymentMethods.enabled.plaidBank]);

  // Auto-skip plaid step if irrelevant
  const prevIndexRef = useRef(0);

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = stepIndex;

    const movingForward = stepIndex >= prevIndex;

    if (stepKey === "plaid" && !shouldShowPlaid && movingForward) {
      next(); // skip forward only on forward nav
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, shouldShowPlaid, stepIndex]);

  // Skip setup only after first 4 enabled steps
  const showSkipSetup = useMemo(() => {
    const firstFour = orderedStepKeys.slice(0, 4);
    if (firstFour.length < 4) return true; // edge case if steps disabled
    return !firstFour.includes(stepKey);
  }, [orderedStepKeys, stepKey]);

  // ---------------------- Navigation ----------------------
  const next = () => {
    setStepIndex((i) => Math.min(i + 1, orderedStepKeys.length - 1));
  };

  const back = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const canSkipThisStep = !!mergedConfig?.[stepKey]?.skippable;

  const skipStep = () => {
    if (!canSkipThisStep) return;

    if (stepKey === "usecase" && useCase.selected.length === 0) {
      setUseCase((p) => ({ ...p, selected: ["one_time"], other: "" }));
    }
    if (stepKey === "splitwith" && splitWith.selected.length === 0) {
      setSplitWith((p) => ({ ...p, selected: ["friends"], other: "" }));
    }
    if (stepKey === "reminders") {
      setReminders((p) => ({ ...p, frequency: "daily", time: "09:00" }));
    }

    next();
  };

  const finish = () => {
    const useCaseArray = useCase.selected.map((x) =>
      x === "other" ? useCase.other.trim() : x
    );
    const splitWithArray = splitWith.selected.map((x) =>
      x === "other" ? splitWith.other.trim() : x
    );
    const challengeArray = challenge.selected.map((x) =>
      x === "other" ? challenge.other.trim() : x
    );

    const payload = {
      profile: {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        heardFrom:
          profile.heardFrom === "other"
            ? profile.heardFromOther.trim()
            : profile.heardFrom,
      },
      useCase: useCaseArray,
      splitWith: splitWithArray,
      reminders: {
        frequency: reminders.frequency,
        customEveryDays:
          reminders.frequency === "custom" ? reminders.customEveryDays : null,
        time: reminders.time,
      },
      recurring,
      paymentMethods,
      challenge: challengeArray,
      plaidIntent,
    };

    onComplete?.();
    setShowFirstTimePrompt?.(false);
    navigate("/dashboard/add");
  };

  const skipAll = () => {
    onSkipAll?.();
    setShowFirstTimePrompt?.(false);
    navigate("/dashboard");
  };

  // ---------------------- UI Helpers ----------------------
  const CardOption = ({ icon, title, description, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
        selected
          ? "border-blue-600 bg-blue-50/40"
          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="text-blue-600 mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <div className="font-medium text-gray-900 text-sm sm:text-base">
          {title}
        </div>
        {description && (
          <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </button>
  );

  const OptionsGrid = ({ children }) => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">{children}</div>
  );

  const SectionTitle = ({ icon, title, subtitle }) => (
    <div className="mb-5 sm:mb-7 flex flex-col items-center text-center px-2">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
          {icon}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );

  const Progress = () => {
    const currentIndex = progressStepKeys.indexOf(stepKey);
    const total = progressStepKeys.length;
    const shownIndex = currentIndex === -1 ? total : currentIndex + 1;

    return (
      <div className="w-full max-w-2xl mx-auto px-2 pt-2 sm:pt-3">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2">
          <span>
            Step {shownIndex} of {total}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(shownIndex / total) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const FooterNav = ({
    primaryLabel = "Next",
    onPrimary,
    primaryDisabled,
    secondaryLabel = "Back",
    onSecondary,
    showSkip,
    skipLabel = "Skip for now",
    onSkip,
  }) => (
    <div className="mt-6 sm:mt-8 flex flex-col gap-2 px-2">
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
          primaryDisabled
            ? "bg-blue-300 text-white cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        <span>{primaryLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSecondary}
          className="inline-flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{secondaryLabel}</span>
        </button>

        {showSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-2 py-2"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );

  // ---------------------- Step Renderers ----------------------
  const renderProfile = () => (
    <div className="px-2">
      <SectionTitle
        icon={<Sparkles className="w-6 h-6" />}
        title="Let’s set you up"
        subtitle="Takes about 15 seconds. Then you can send your first request."
      />

      <div className="grid gap-3 sm:gap-4">
        <label className="text-left">
          <div className="text-sm font-medium text-gray-900 mb-1">
            First name
          </div>
          <input
            autoFocus
            value={profile.firstName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, firstName: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="First Name"
          />
        </label>

        <label className="text-left">
          <div className="text-sm font-medium text-gray-900 mb-1">
            Last name
          </div>
          <input
            value={profile.lastName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, lastName: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="Last name"
          />
        </label>

        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 mb-2">
            How did you hear about Splitify?
          </div>
          <OptionsGrid>
            {[
              {
                key: "tiktok",
                label: "TikTok",
                icon: <MessageCircle className="w-5 h-5" />,
              },
              {
                key: "instagram",
                label: "Instagram",
                icon: <UsersRound className="w-5 h-5" />,
              },
              {
                key: "friend",
                label: "Friend / roommate",
                icon: <HeartHandshake className="w-5 h-5" />,
              },
              {
                key: "google",
                label: "Google search",
                icon: <Search className="w-5 h-5" />,
              },
              {
                key: "appstore",
                label: "App store",
                icon: <Store className="w-5 h-5" />,
              },
              {
                key: "other",
                label: "Other",
                icon: <Settings2 className="w-5 h-5" />,
              },
            ].map((opt) => (
              <CardOption
                key={opt.key}
                icon={opt.icon}
                title={opt.label}
                selected={profile.heardFrom === opt.key}
                onClick={() =>
                  setProfile((p) => ({ ...p, heardFrom: opt.key }))
                }
              />
            ))}
          </OptionsGrid>

          {profile.heardFrom === "other" && (
            <input
              value={profile.heardFromOther}
              onChange={(e) =>
                setProfile((p) => ({ ...p, heardFromOther: e.target.value }))
              }
              className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              placeholder="Where did you find us?"
            />
          )}
        </div>
      </div>

      <FooterNav
        primaryLabel="Continue"
        onPrimary={next}
        primaryDisabled={
          !profile.firstName.trim() ||
          !profile.lastName.trim() ||
          !profile.heardFrom ||
          (profile.heardFrom === "other" && !profile.heardFromOther.trim())
        }
        onSecondary={back}
      />
    </div>
  );

  const renderUseCase = () => {
    const toggle = (key) => {
      setUseCase((p) => {
        const selected = p.selected.includes(key)
          ? p.selected.filter((x) => x !== key)
          : [...p.selected, key];
        return {
          ...p,
          selected,
          other: selected.includes("other") ? p.other : "",
        };
      });
    };

    const needsOtherText = useCase.selected.includes("other");

    return (
      <div className="px-2">
        <SectionTitle
          icon={<Receipt className="w-6 h-6" />} // unique vs options here
          title="What are you using Splitify for?"
          subtitle="Pick all that apply — we’ll tailor your defaults."
        />

        <OptionsGrid>
          <CardOption
            icon={<Zap className="w-5 h-5" />}
            title="Utilities"
            selected={useCase.selected.includes("utilities")}
            onClick={() => toggle("utilities")}
          />
          <CardOption
            icon={<Home className="w-5 h-5" />}
            title="Rent"
            selected={useCase.selected.includes("rent")}
            onClick={() => toggle("rent")}
          />
          <CardOption
            icon={<ShoppingCart className="w-5 h-5" />}
            title="Groceries"
            selected={useCase.selected.includes("groceries")}
            onClick={() => toggle("groceries")}
          />
          <CardOption
            icon={<Wifi className="w-5 h-5" />}
            title="Subscriptions"
            // description="Wi-Fi, Netflix, etc."
            selected={useCase.selected.includes("subscriptions")}
            onClick={() => toggle("subscriptions")}
          />
          <CardOption
            icon={<Receipt className="w-5 h-5" />}
            title="One-time expenses"
            selected={useCase.selected.includes("one_time")}
            onClick={() => toggle("one_time")}
          />
          <CardOption
            icon={<Settings2 className="w-5 h-5" />}
            title="Other"
            selected={useCase.selected.includes("other")}
            onClick={() => toggle("other")}
          />
        </OptionsGrid>

        {needsOtherText && (
          <input
            value={useCase.other}
            onChange={(e) =>
              setUseCase((p) => ({ ...p, other: e.target.value }))
            }
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="Tell us what kind of bills"
          />
        )}

        <FooterNav
          primaryLabel="Next"
          onPrimary={next}
          primaryDisabled={
            useCase.selected.length === 0 ||
            (needsOtherText && !useCase.other.trim())
          }
          onSecondary={back}
          showSkip={canSkipThisStep}
          onSkip={skipStep}
        />
      </div>
    );
  };

  const renderSplitWith = () => {
    const toggle = (key) => {
      setSplitWith((p) => {
        const selected = p.selected.includes(key)
          ? p.selected.filter((x) => x !== key)
          : [...p.selected, key];
        return {
          ...p,
          selected,
          other: selected.includes("other") ? p.other : "",
        };
      });
    };

    const needsOtherText = splitWith.selected.includes("other");

    const opts = [
      {
        key: "roommates",
        label: "Roommates",
        icon: <Users className="w-5 h-5" />,
      },
      {
        key: "friends",
        label: "Friends",
        icon: <UsersRound className="w-5 h-5" />,
      },
      {
        key: "partner",
        label: "Partner",
        icon: <HeartHandshake className="w-5 h-5" />,
      },
      {
        key: "classmates",
        label: "Classmates",
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        key: "family",
        label: "Family",
        icon: <UserRound className="w-5 h-5" />,
      },
      { key: "other", label: "Other", icon: <Settings2 className="w-5 h-5" /> },
    ];

    return (
      <div className="px-2">
        <SectionTitle
          icon={<Sparkles className="w-6 h-6" />} // unique vs option icons
          title="Who do you split with?"
          subtitle="Pick all that apply. We’ll set the right reminder tone and templates."
        />

        <OptionsGrid>
          {opts.map((o) => (
            <CardOption
              key={o.key}
              icon={o.icon}
              title={o.label}
              selected={splitWith.selected.includes(o.key)}
              onClick={() => toggle(o.key)}
            />
          ))}
        </OptionsGrid>

        {needsOtherText && (
          <input
            value={splitWith.other}
            onChange={(e) =>
              setSplitWith((p) => ({ ...p, other: e.target.value }))
            }
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="Who else do you split with?"
          />
        )}

        <FooterNav
          primaryLabel="Next"
          onPrimary={next}
          primaryDisabled={
            splitWith.selected.length === 0 ||
            (needsOtherText && !splitWith.other.trim())
          }
          onSecondary={back}
          showSkip={canSkipThisStep}
          onSkip={skipStep}
        />
      </div>
    );
  };

  const renderReminders = () => (
    <div className="px-2">
      <SectionTitle
        icon={<CalendarClock className="w-6 h-6" />} // unique vs options using Bell/Repeat
        title="Get paid faster with auto-reminders"
        subtitle="Splitify will text people until you’re paid. Choose your default."
      />

      <OptionsGrid>
        {[
          {
            key: "daily",
            label: "Once a day",
            // desc: "Recommended",
            icon: <CalendarClock className="w-5 h-5" />,
          },
          {
            key: "3days",
            label: "Every 3 days",
            icon: <Repeat className="w-5 h-5" />,
          },
          {
            key: "weekly",
            label: "Once a week",
            icon: <CalendarClock className="w-5 h-5" />,
          },
          {
            key: "once",
            label: "Only one reminder",
            icon: <Bell className="w-5 h-5" />,
          },
          //   { key: "custom", label: "Custom", icon: <Settings2 className="w-5 h-5" /> },
        ].map((opt) => (
          <CardOption
            key={opt.key}
            icon={opt.icon}
            title={opt.label}
            description={opt.desc}
            selected={reminders.frequency === opt.key}
            onClick={() => setReminders((p) => ({ ...p, frequency: opt.key }))}
          />
        ))}
      </OptionsGrid>

      {/* {reminders.frequency === "custom" && (
        <div className="mt-3 text-left border border-gray-100 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-900 mb-2">
            Send a reminder every…
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={30}
              value={reminders.customEveryDays}
              onChange={(e) =>
                setReminders((p) => ({
                  ...p,
                  customEveryDays: Math.max(1, Number(e.target.value || 1)),
                }))
              }
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
            <span className="text-sm text-gray-600">days</span>
          </div>
        </div>
      )} */}

      {/* <div className="mt-4 text-left">
        <div className="text-sm font-medium text-gray-900 mb-2">
          What time should reminders be sent?
        </div>
        <input
          type="time"
          value={reminders.time}
          onChange={(e) =>
            setReminders((p) => ({ ...p, time: e.target.value }))
          }
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
        />
        <div className="text-xs text-gray-500 mt-1">
          Most people choose morning (9 AM local).
        </div>
      </div> */}

      <FooterNav
        primaryLabel="Save & continue"
        onPrimary={() => {
          next();
        }}
        primaryDisabled={
          reminders.frequency === "custom" && !reminders.customEveryDays
        }
        onSecondary={back}
        showSkip={canSkipThisStep}
        skipLabel="Use recommended"
        onSkip={() => {
          if (!canSkipThisStep) return;
          setReminders((p) => ({ ...p, frequency: "daily", time: "09:00" }));
          next();
        }}
      />
    </div>
  );

  const renderRecurring = () => {
    const toggleType = (type) => {
      setRecurring((p) => {
        const selected = p.selected.includes(type)
          ? p.selected.filter((x) => x !== type)
          : [...p.selected, type];
        const bills = { ...p.bills };
        if (!bills[type])
          bills[type] = { dueDay: 1, people: 2, splitType: "even" };
        return { ...p, selected, bills };
      });
    };

    const types = [
      { key: "rent", label: "Rent", icon: <Home className="w-5 h-5" /> },
      { key: "wifi", label: "Wi-Fi", icon: <Wifi className="w-5 h-5" /> },
      {
        key: "utilities",
        label: "Utilities",
        icon: <Building2 className="w-5 h-5" />,
      },
      {
        key: "subscriptions",
        label: "Subscriptions",
        icon: <Repeat className="w-5 h-5" />,
      },
      {
        key: "manual",
        label: "Add manually",
        icon: <Receipt className="w-5 h-5" />,
      },
    ];

    return (
      <div className="px-2">
        <SectionTitle
          icon={<Repeat className="w-6 h-6" />}
          title="Automate recurring bills?"
          subtitle="Set them once and Splitify will reuse them every month."
        />

        <OptionsGrid>
          {types.map((t) => (
            <CardOption
              key={t.key}
              icon={t.icon}
              title={t.label}
              selected={recurring.selected.includes(t.key)}
              onClick={() => toggleType(t.key)}
            />
          ))}
        </OptionsGrid>

        {recurring.selected.length > 0 && (
          <div className="mt-4 grid gap-3">
            {recurring.selected.map((t) => {
              const bill = recurring.bills[t];
              return (
                <div
                  key={t}
                  className="border border-gray-100 rounded-lg p-3 sm:p-4"
                >
                  <div className="font-medium text-gray-900 mb-3">
                    {types.find((x) => x.key === t)?.label}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <label className="text-left">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        Due day
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={bill?.dueDay || 1}
                        onChange={(e) =>
                          setRecurring((p) => ({
                            ...p,
                            bills: {
                              ...p.bills,
                              [t]: {
                                ...p.bills[t],
                                dueDay: Number(e.target.value || 1),
                              },
                            },
                          }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </label>

                    <label className="text-left">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        People sharing
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={bill?.people || 2}
                        onChange={(e) =>
                          setRecurring((p) => ({
                            ...p,
                            bills: {
                              ...p.bills,
                              [t]: {
                                ...p.bills[t],
                                people: Number(e.target.value || 1),
                              },
                            },
                          }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </label>

                    <label className="text-left">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        Split type
                      </div>
                      <select
                        value={bill?.splitType || "even"}
                        onChange={(e) =>
                          setRecurring((p) => ({
                            ...p,
                            bills: {
                              ...p.bills,
                              [t]: {
                                ...p.bills[t],
                                splitType: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      >
                        <option value="even">Split evenly</option>
                        <option value="custom">Custom amounts</option>
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <FooterNav
          primaryLabel="Next"
          onPrimary={next}
          onSecondary={back}
          showSkip={canSkipThisStep}
          skipLabel="Skip recurring bills"
          onSkip={skipStep}
        />
      </div>
    );
  };


  const renderChallenge = () => {
    console.log("render challenge");
    const toggle = (key) => {
      setChallenge((p) => {
        const selected = p.selected.includes(key)
          ? p.selected.filter((x) => x !== key)
          : [...p.selected, key];
        return {
          ...p,
          selected,
          other: selected.includes("other") ? p.other : "",
        };
      });
    };

    const needsOtherText = challenge.selected.includes("other");

    const opts = [
      {
        key: "forget",
        label: "They forget",
        icon: <Bell className="w-5 h-5" />,
      },
      {
        key: "awkward",
        label: "I feel awkward asking",
        icon: <Users className="w-5 h-5" />,
      },
      {
        key: "ignore",
        label: "They ignore me",
        icon: <UsersRound className="w-5 h-5" />,
      },
      {
        key: "nag",
        label: "I don’t want to nag",
        icon: <Repeat className="w-5 h-5" />,
      },
      {
        key: "tracking",
        label: "Tracking manually",
        icon: <Receipt className="w-5 h-5" />,
      },
      {
        key: "other",
        label: "Something else",
        icon: <Settings2 className="w-5 h-5" />,
      },
    ];

    return (
      <div className="px-2">
        <SectionTitle
          icon={<Sparkles className="w-6 h-6" />} // unique vs options ok here
          title="What’s the biggest challenge?"
          subtitle="Pick all that apply — helps us tailor reminders."
        />

        <OptionsGrid>
          {opts.map((o) => (
            <CardOption
              key={o.key}
              icon={o.icon}
              title={o.label}
              selected={challenge.selected.includes(o.key)}
              onClick={() => toggle(o.key)}
            />
          ))}
        </OptionsGrid>

        {needsOtherText && (
          <input
            value={challenge.other}
            onChange={(e) =>
              setChallenge((p) => ({ ...p, other: e.target.value }))
            }
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            placeholder="Tell us a bit more"
          />
        )}

        <FooterNav
          primaryLabel="Finish setup"
          onPrimary={() => {
            // save to backend after entering necessary info
            const callSaveOnboarding = async () => {
              const name = `${profile.firstName.trim()} ${profile.lastName.trim()}`;

              const heardFromObj = {
                preset: profile.heardFrom ? [profile.heardFrom] : [],
                other:
                  profile.heardFrom === "other"
                    ? profile.heardFromOther.trim()
                    : "",
              };

              const useCaseObj = {
                preset: useCase.selected,
                other: useCase.selected.includes("other")
                  ? useCase.other.trim()
                  : "",
              };

              const splitWithObj = {
                preset: splitWith.selected,
                other: splitWith.selected.includes("other")
                  ? splitWith.other.trim()
                  : "",
              };

              const challengeObj = {
                preset: challenge.selected,
                other: challenge.selected.includes("other")
                  ? challenge.other.trim()
                  : "",
              };

              const payload = {
                name,
                heardFrom: heardFromObj,
                useCase: useCaseObj,
                splitWith: splitWithObj,
                reminders: {
                  frequency: reminders.frequency, // daily | 3days | weekly | once
                },
                challenge: challengeObj,
              };

              const res = await saveOnboarding(payload);
              // update userData locally
              setUserData(res.user);
              console.log("userData", userData);
              console.log("res", res);
            };

            callSaveOnboarding();

            next();
          }}
          primaryDisabled={
            challenge.selected.length === 0 ||
            (needsOtherText && !challenge.other.trim())
          }
          onSecondary={back}
          showSkip={canSkipThisStep}
          onSkip={skipStep}
        />
      </div>
    );
  };

  const renderDone = () => (
    <div className="px-2">
      <SectionTitle
        icon={<CheckCircle className="w-6 h-6" />}
        title="You’re ready 🎉"
        subtitle="Let’s send your first request."
      />

      <div className="grid gap-2">
        <button
          type="button"
          onClick={finish}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <span>Create my first request</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full inline-flex items-center justify-center gap-2 border border-black hover:bg-gray-100 text-black px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <span>Explore your dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // ---------------------- Main Render ----------------------
  return (
    <div
      className={`fixed inset-0 z-[6000] min-h-screen bg-white flex items-start justify-center overflow-auto 
    ${(stepKey !== "plaid" || !showPremiumModal) && "pt-10 p-2 sm:!p-2 lg:!p-2"}
  `}
    >
      {console.log("SHOW PREMIUM MODAL", showPremiumModal)}
      <div
        className={`w-full ${(stepKey !== "plaid" || !showPremiumModal) && "max-w-2xl"} mx-auto transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {progressStepKeys.includes(stepKey) && <Progress />}

        <div className="mt-6 sm:mt-8 text-center">
          {stepKey === "profile" && renderProfile()}
          {stepKey === "usecase" && renderUseCase()}
          {stepKey === "splitwith" && renderSplitWith()}
          {stepKey === "reminders" && renderReminders()}
          {stepKey === "recurring" && renderRecurring()}
          {stepKey === "payments" && (
            <PaymentMethodsStep
              paymentMethods={paymentMethods}
              setPaymentMethods={setPaymentMethods}
              onNext={next}
              onBack={back}
              showSkip={canSkipThisStep}
              onSkip={skipStep}
            />
          )}
          {stepKey === "plaid" && (
            <PlaidStep
              plaidIntent={plaidIntent}
              setPlaidIntent={setPlaidIntent}
              onNext={next}
              onBack={back}
              canSkipThisStep={canSkipThisStep}
              skipStep={skipStep}
              SectionTitle={SectionTitle}
              OptionsGrid={OptionsGrid}
              CardOption={CardOption}
              FooterNav={FooterNav}
              setShowPremiumModal={setShowPremiumModal}
              showPremiumModal={showPremiumModal}
              userData={userData}
              setUserData={setUserData}
            />
          )}
          {stepKey === "challenge" && renderChallenge()}
          {stepKey === "done" && renderDone()}
        </div>

        {/* Fixed top-right Skip Setup (only after first 4 steps) */}
        {/* {showSkipSetup && (
          <button
            aria-label="Close onboarding"
            onClick={skipAll}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-gray-100"
          >
            Skip setup
          </button>
        )} */}
      </div>
    </div>
  );
}
