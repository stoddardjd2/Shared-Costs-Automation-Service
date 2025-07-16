export const getStepNumber = (step) => {
  const steps = {
    chargeType: 1,
    chargeSearch: 2,
    chargeDetails: 2,
    split:4,
    search: 3,
    add: 3,
  };
  // const steps = ['chargeType', 'chargeSearch', 'chargeDetails', 'search', 'add'];
  return steps[step];
};

export const STEPS = {
  CHARGE_TYPE: "charge-type",
  CHARGE_SEARCH: "charge-search",
  CHARGE_DETAILS: "charge-details",
  SEARCH: "search",
  SPLIT: "split", // <-- ONLY ADD THIS LINE
  ADD: "add",
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const validatePhoneNumber = (phone) => {
  console.log("validatePhoneNumber2323", phone);
  const phoneRegex = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
  console.log("test", phoneRegex.test(phone));

  return phoneRegex.test(phone);
};

export const generateAvatar = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
