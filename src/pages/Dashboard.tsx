import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LogOut, PlusCircle, List, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { FinancialSummary } from "@/components/FinancialSummary";
import { TRANSACTION_TYPES, Transaction } from "@/lib/constants";
import { showError } from "@/utils/toast";
import TransactionsPage from "./Transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Utility function to fetch all transactions for the summary and reports
const fetchAllTransactions = async (supabase: any, userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });

  if (error) {
    throw error;
  }
  return data as Transaction[];
};

// Currency formatter for INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const Dashboard = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");

  const userId = session?.user?.id;

  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ["allTransactions", userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return fetchAllTransactions(supabase, userId);
    },
    enabled: !!userId,
    onError: (error) => {
      console.error("Error fetching all transactions:", error);
      showError("Failed to load financial data.");
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleTransactionAdded = () => {
    refetch();
    setActiveTab("summary");
  };

  // --- Reporting Logic ---
  const expenseData = transactions
    ? transactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((acc, t) => {
          const category = t.category || "Uncategorized";
          const amount = Math.abs(t.amount);
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {} as Record<string, number>)
    : {};

  const pieChartData = Object.entries(expenseData).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value); // Sort by value descending

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1953', '#19FFD1', '#FFD119'];
  // -----------------------

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome, {session?.user?.email?.split('@')[0] || "User"}!
        </h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-fit">
          <TabsTrigger value="summary">
            <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline" /> Summary
          </TabsTrigger>
          <TabsTrigger value="add-expense">
            <PlusCircle className="h-4 w-4 mr-2 hidden sm:inline" /> Add Expense
          </TabsTrigger>
          <TabsTrigger value="add-income">
            <PlusCircle className="h-4 w-4 mr-2 hidden sm:inline" /> Add Income
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <List className="h-4 w-4 mr-2 hidden sm:inline" /> Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6 space-y-6">
          <FinancialSummary transactions={transactions} isLoading={isLoading} />
          
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center"><p>Loading chart...</p></div>
              ) : pieChartData.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No expense data available to generate a chart.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-expense" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Add New Expense</CardTitle></CardHeader>
            <CardContent>
              <AddTransactionForm onTransactionAdded={handleTransactionAdded} defaultType={TRANSACTION_TYPES.EXPENSE} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-income" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Add New Income</CardTitle></CardHeader>
            <CardContent>
              <AddTransactionForm onTransactionAdded={handleTransactionAdded} defaultType={TRANSACTION_TYPES.INCOME} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;