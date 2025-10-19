import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";
import { Trash2, Edit, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/contexts/SessionContext";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { showSuccess, showError } from "@/utils/toast";
import { Budget } from "./BudgetStatus";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0, "Budget amount must be zero or greater"),
});

type BudgetFormValues = z.infer<typeof formSchema>;

const fetchBudgets = async (supabase: any, userId: string, month: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month);
  if (error) throw error;
  return data;
};

export function BudgetManager() {
  const { supabase, session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["budgets", userId, currentMonth],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return fetchBudgets(supabase, userId, currentMonth);
    },
    enabled: !!userId,
  });

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  });

  const onSubmit = async (values: BudgetFormValues) => {
    if (!userId) return;

    const { error } = await supabase.from("budgets").upsert({
      user_id: userId,
      category: values.category,
      month: currentMonth,
      amount: values.amount,
    }, { onConflict: 'user_id,category,month' });

    if (error) {
      showError("Failed to save budget.");
      console.error(error);
    } else {
      showSuccess(`Budget for ${values.category} saved.`);
      form.reset({ category: "", amount: 0 });
      queryClient.invalidateQueries({ queryKey: ["budgets", userId, currentMonth] });
    }
  };

  const handleDelete = async (budgetId: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", budgetId);
    if (error) {
      showError("Failed to delete budget.");
    } else {
      showSuccess("Budget deleted.");
      queryClient.invalidateQueries({ queryKey: ["budgets", userId, currentMonth] });
    }
  };

  const availableCategories = DEFAULT_CATEGORIES.filter(
    cat => !budgets?.some(b => b.category === cat.value)
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Set a New Budget</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category to budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.length > 0 ? (
                          availableCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.emoji} {category.value}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">All categories have budgets.</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Budget Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" placeholder="e.g., 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={!form.watch("category")}>
                <PlusCircle className="mr-2 h-4 w-4" /> Set Budget
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Current Budgets</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : budgets && budgets.length > 0 ? (
            <ul className="space-y-3">
              {budgets.map(budget => (
                <li key={budget.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                  <div>
                    <p className="font-semibold">{budget.category}</p>
                    <p className="text-lg">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(budget.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => form.reset(budget)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(budget.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-4">No budgets set for this month.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}