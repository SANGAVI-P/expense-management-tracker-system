import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_MONTHLY_BUDGET, Transaction, TRANSACTION_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MonthlyBudgetTrackerProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  budget?: number;
}

// Currency formatter for INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export function MonthlyBudgetTracker({ transactions, isLoading, budget = DEFAULT_MONTHLY_BUDGET }: MonthlyBudgetTrackerProps) {
  const { totalExpenses, remainingBudget, percentageSpent } = useMemo(() => {
    if (isLoading || !transactions) {
      return { totalExpenses: 0, remainingBudget: budget, percentageSpent: 0 };
    }

    // Expenses are stored as negative numbers, so we sum the absolute values
    const totalExpenses = transactions
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const remainingBudget = budget - totalExpenses;
    const percentageSpent = Math.min(100, (totalExpenses / budget) * 100);

    return { totalExpenses, remainingBudget, percentageSpent };
  }, [transactions, isLoading, budget]);

  const progressColor = useMemo(() => {
    if (percentageSpent < 50) return "bg-green-500";
    if (percentageSpent < 80) return "bg-yellow-500";
    return "bg-red-500";
  }, [percentageSpent]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Monthly Budget</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spent: <span className="font-semibold">...</span></span>
              <span className="text-muted-foreground">Remaining: <span className="font-semibold">...</span></span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Monthly Budget ({formatCurrency(budget)})</CardTitle>
        <span className={cn("text-lg font-bold", remainingBudget >= 0 ? "text-green-600" : "text-destructive")}>
          {formatCurrency(remainingBudget)} Remaining
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress 
            value={percentageSpent} 
            className="h-3 transition-all duration-1000 ease-out" 
            indicatorClassName={progressColor}
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Spent: <span className="font-semibold text-foreground">{formatCurrency(totalExpenses)}</span>
            </span>
            <span className={cn("font-semibold", remainingBudget >= 0 ? "text-green-600" : "text-destructive")}>
              {percentageSpent.toFixed(1)}% Used
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}