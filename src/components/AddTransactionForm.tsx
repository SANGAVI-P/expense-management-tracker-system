import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORIES, TRANSACTION_TYPES, TransactionType } from "@/lib/constants";
import { useSession } from "@/contexts/SessionContext";
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  type: z.enum([TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME]),
  category: z.string().min(1, "Category is required"),
  transaction_date: z.date(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
  onTransactionAdded: () => void;
  defaultType: TransactionType;
}

export function AddTransactionForm({ onTransactionAdded, defaultType }: AddTransactionFormProps) {
  const { supabase, session } = useSession();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: defaultType,
      category: DEFAULT_CATEGORIES[0],
      transaction_date: new Date(),
    },
  });

  const onSubmit = async (values: TransactionFormValues) => {
    if (!session?.user.id) {
      showError("User not authenticated.");
      return;
    }

    const { description, amount, type, category, transaction_date } = values;

    const { error } = await supabase.from("transactions").insert({
      user_id: session.user.id,
      description,
      amount: type === TRANSACTION_TYPES.EXPENSE ? -amount : amount, // Store expenses as negative
      type,
      category,
      transaction_date: format(transaction_date, "yyyy-MM-dd"),
    });

    if (error) {
      console.error("Error adding transaction:", error);
      showError("Failed to add transaction.");
    } else {
      showSuccess(`${type === TRANSACTION_TYPES.EXPENSE ? "Expense" : "Income"} added successfully!`);
      form.reset({
        description: "",
        amount: 0,
        type: defaultType,
        category: DEFAULT_CATEGORIES[0],
        transaction_date: new Date(),
      });
      onTransactionAdded();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={TRANSACTION_TYPES.EXPENSE}>Expense</SelectItem>
                    <SelectItem value={TRANSACTION_TYPES.INCOME}>Income</SelectItem>
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
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mt-1">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee at local cafe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </form>
    </Form>
  );
}