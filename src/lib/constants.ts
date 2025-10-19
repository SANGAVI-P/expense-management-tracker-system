export const TRANSACTION_TYPES = {
  EXPENSE: "expense",
  INCOME: "income",
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const DEFAULT_CATEGORIES = [
  { value: "Food", emoji: "🍔" },
  { value: "Housing", emoji: "🏠" },
  { value: "Transportation", emoji: "🚗" },
  { value: "Utilities", emoji: "💡" },
  { value: "Savings", emoji: "💰" },
  { value: "Entertainment", emoji: "🎬" },
  { value: "Salary", emoji: "💼" },
  { value: "Investment Income", emoji: "📈" },
  { value: "Other", emoji: "🤷" },
];

export const getCategoryEmoji = (categoryValue: string | null): string => {
  if (!categoryValue) return "🤷";
  const category = DEFAULT_CATEGORIES.find(c => c.value === categoryValue);
  return category ? category.emoji : "🤷";
};

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