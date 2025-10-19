import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Transaction, TRANSACTION_TYPES, getCategoryEmoji } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AlertTriangle, BadgeIndianRupee } from 'lucide-react';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // 'YYYY-MM-DD'
}

interface BudgetStatusProps {
  transactions: Transaction[] | undefined;
  budgets: Budget[] | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export function BudgetStatus({ transactions, budgets, isLoading }: BudgetStatusProps) {
  const budgetProgress = useMemo(() => {
    if (!budgets || !transactions) return [];

    const expensesByCategory = transactions
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((acc, t) => {
        const category = t.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    return budgets.map(budget => {
      const spent = expensesByCategory[budget.category] || 0;
      const percentage = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;
      
      let progressColor = "bg-green-500";
      let warning = null;
      if (percentage >= 100) {
        progressColor = "bg-red-500";
        warning = "Limit reached!";
      } else if (percentage > 75) {
        progressColor = "bg-yellow-500";
        warning = "Approaching limit!";
      }

      return {
        ...budget,
        spent,
        percentage,
        progressColor,
        warning,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [transactions, budgets]);

  if (isLoading) {
    return <Card><CardHeader><CardTitle>Budget Status</CardTitle></CardHeader><CardContent><p>Loading budgets...</p></CardContent></Card>;
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Budget Status</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <BadgeIndianRupee className="mx-auto h-8 w-8 mb-2" />
            <p>No budgets set for this month.</p>
            <p className="text-sm">Go to the 'Budgets' tab to add one.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Budget Status</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {budgetProgress.map(item => (
          <div key={item.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">{getCategoryEmoji(item.category)} {item.category}</span>
              {item.warning && (
                <span className={cn(
                  "text-xs font-semibold flex items-center",
                  item.percentage >= 100 ? "text-red-500" : "text-yellow-500"
                )}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {item.warning}
                </span>
              )}
            </div>
            <Progress value={item.percentage} indicatorClassName={item.progressColor} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{formatCurrency(item.spent)} spent</span>
              <span>{formatCurrency(item.amount)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}