export const TRANSACTION_TYPES = {
  EXPENSE: "expense",
  INCOME: "income",
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const DEFAULT_CATEGORIES = [
  "Food",
  "Housing",
  "Transportation",
  "Utilities",
  "Savings",
  "Entertainment",
  "Salary",
  "Investment Income",
  "Other",
];

export interface Transaction {
  id: string;
  user_id: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  category: string | null;
  transaction_date: string; // ISO date string
  created_at: string;
}

// Default budget for demonstration (in INR)
export const DEFAULT_MONTHLY_BUDGET = 50000;