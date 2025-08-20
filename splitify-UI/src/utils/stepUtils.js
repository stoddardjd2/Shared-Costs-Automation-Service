export const getStepNumber = (step) => {
  const steps = {
    chargeType: 1,
    chargeSearch: 1,
    chargeDetails: 1,
    split: 2,
    search: 1,
    add:1,
  };
  // const steps = ['chargeType', 'chargeSearch', 'chargeDetails', 'search', 'add'];
  return steps[step];
};

export const STEPS = {
  CHARGE_TYPE: "charge-type",
  CHARGE_SEARCH: "charge-search",
  CHARGE_DETAILS: "charge-details",
  SEARCH: "search",
  SPLIT: "split", 
  ADD: "add",
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+1 \(\d{3}\)-\d{3}-\d{4}$/;

  return phoneRegex.test(phone);
};

export const generateAvatar = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
