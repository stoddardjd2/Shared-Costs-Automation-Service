function totalAmount(paymentRequest) {}

function amountRange(request) {
  if (request.participants.length === 0) {
    return { low: null, high: null };
  }

  const amounts = request.participants.map((p) => p.amount);

  const data = { low: Math.min(...amounts), high: Math.max(...amounts) };
  return {
    low: data.low,
    high: data.high,
    isSame: data.high === data.low,
  };
}
export { amountRange, totalAmount };
