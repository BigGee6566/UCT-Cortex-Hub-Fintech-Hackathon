export type ConsentState = {
  accepted: boolean;
  acceptedAt?: string; // ISO timestamp
  scopes: {
    balances: boolean;
    transactions: boolean;
    income: boolean;
    debitOrders: boolean;
  };
};
