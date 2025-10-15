import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Home, Zap, Utensils, Car, PiggyBank, ShoppingCart } from "lucide-react";

const budgetCategories = [
  {
    name: "Housing",
    percentage: 0.30,
    icon: <Home className="w-6 h-6" />,
    explanation: "Covers rent or mortgage payments. Keeping this predictable is key to a stable budget.",
    tips: "Consider a roommate or refinancing to lower this major expense."
  },
  {
    name: "Utilities",
    percentage: 0.05,
    icon: <Zap className="w-6 h-6" />,
    explanation: "Includes electricity, water, gas, and internet. These are essential services for your home.",
    tips: "Use energy-efficient appliances and unplug devices when not in use."
  },
  {
    name: "Food",
    percentage: 0.15,
    icon: <Utensils className="w-6 h-6" />,
    explanation: "Groceries and dining out. This is a flexible category where savings can often be found.",
    tips: "Plan meals, cook at home more often, and buy generic brands."
  },
  {
    name: "Transportation",
    percentage: 0.15,
    icon: <Car className="w-6 h-6" />,
    explanation: "Car payments, insurance, gas, maintenance, and public transit costs.",
    tips: "Consider carpooling, using public transport, or biking to reduce costs."
  },
  {
    name: "Savings",
    percentage: 0.20,
    icon: <PiggyBank className="w-6 h-6" />,
    explanation: "Pay yourself first! This builds your emergency fund and contributes to long-term goals.",
    tips: "Automate transfers to your savings account each payday."
  },
  {
    name: "Discretionary",
    percentage: 0.15,
    icon: <ShoppingCart className="w-6 h-6" />,
    explanation: "Wants, not needs. This includes hobbies, entertainment, and shopping.",
    tips: "Set a strict limit for this category to avoid overspending."
  }
];

const BudgetPlanner = () => {
  const [income, setIncome] = useState("");
  const [budget, setBudget] = useState<any[] | null>(null);

  const calculateBudget = () => {
    const netIncome = parseFloat(income);
    if (isNaN(netIncome) || netIncome <= 0) {
      setBudget(null);
      return;
    }

    const calculatedBudget = budgetCategories.map(category => ({
      ...category,
      amount: (netIncome * category.percentage).toFixed(2)
    }));
    setBudget(calculatedBudget);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Monthly Budget Planner</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Your Net Monthly Income</CardTitle>
          <CardDescription>
            Input your take-home pay for the month to generate a sample budget plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="e.g., 3000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={calculateBudget}>Generate Budget</Button>
        </CardContent>
      </Card>

      {budget && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Balanced Budget Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budget.map(item => (
              <Card key={item.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${item.amount}</div>
                  <p className="text-xs text-muted-foreground">({item.percentage * 100}% of income)</p>
                  <p className="text-sm mt-4">{item.explanation}</p>
                  <p className="text-sm mt-2 font-semibold">Savings Tip:</p>
                  <p className="text-sm text-muted-foreground">{item.tips}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;