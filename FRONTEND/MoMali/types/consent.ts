// Permissions the user can grant. Names match the planned backend `consents.scope` values.
export const SCOPES = ['balances:read', 'transactions:read', 'income:read', 'debit_orders:read'] as const;

export type Scope = (typeof SCOPES)[number];

export const SCOPE_LABELS: Record<Scope, string> = {
  'balances:read': 'Balances',
  'transactions:read': 'Transactions',
  'income:read': 'Income / NSFAS patterns',
  'debit_orders:read': 'Debit orders',
};

export type ScopeGrant = {
  granted: boolean;
  grantedAt?: string; // ISO timestamp of the latest grant
  revokedAt?: string; // ISO timestamp of the latest revocation
};

// Stored consent (version 2): one record per scope.
export type ConsentState = {
  version: 2;
  scopes: Record<Scope, ScopeGrant>;
};

// Stored consent before scopes were enforced (version 1). Kept only for migration.
export type LegacyConsentV1 = {
  accepted: boolean;
  acceptedAt?: string;
  scopes: {
    balances: boolean;
    transactions: boolean;
    income: boolean;
    debitOrders: boolean;
  };
};
