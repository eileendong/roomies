import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Plus, DollarSign, Bell, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Contact, RecurringExpense, SplitDetail } from "../App";

type CalendarTabProps = {
  contacts: Contact[];
  recurringExpenses: RecurringExpense[];
  onAddRecurringExpense: (expense: RecurringExpense) => void;
  reminderDaysBefore: number;
};

export function CalendarTab({
  contacts,
  recurringExpenses,
  onAddRecurringExpense,
  reminderDaysBefore,
}: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [dueDay, setDueDay] = useState("1");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const calculateNextDueDate = (dueDay: number, frequency: string): Date => {
    const now = new Date();
    let nextDate = new Date();

    if (frequency === "monthly") {
      nextDate.setDate(dueDay);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (frequency === "weekly") {
      const currentDay = now.getDay();
      const daysUntil = (dueDay - currentDay + 7) % 7;
      nextDate.setDate(now.getDate() + daysUntil);
    } else if (frequency === "yearly") {
      nextDate.setDate(dueDay);
      if (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }

    return nextDate;
  };

  const handleAddRecurring = () => {
    const totalAmount = parseFloat(amount);

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!amount || isNaN(totalAmount) || totalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error("Please select at least one person to split with");
      return;
    }

    const perPerson = totalAmount / (selectedContacts.length + 1); // +1 for you
    const splits: SplitDetail[] = selectedContacts.map((contactId) => ({
      contactId,
      amount: perPerson,
    }));

    const nextDueDate = calculateNextDueDate(parseInt(dueDay), frequency);

    const newExpense: RecurringExpense = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: totalAmount,
      frequency,
      dueDay: parseInt(dueDay),
      splits,
      nextDueDate,
      description: description.trim() || undefined,
    };

    onAddRecurringExpense(newExpense);
    toast.success(`Recurring expense "${title}" created! Reminders will be sent ${reminderDaysBefore} days before due date.`);

    // Reset form
    setTitle("");
    setAmount("");
    setDescription("");
    setDueDay("1");
    setSelectedContacts([]);
    setDialogOpen(false);
  };

  // Check for upcoming payments
  const getUpcomingPayments = () => {
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(now.getDate() + reminderDaysBefore);

    return recurringExpenses.filter((expense) => {
      return expense.nextDueDate <= reminderDate && expense.nextDueDate >= now;
    });
  };

  const upcomingPayments = getUpcomingPayments();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {upcomingPayments.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="mb-2">Upcoming Payments</p>
                <div className="space-y-2">
                  {upcomingPayments.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {expense.title} - ${expense.amount.toFixed(2)}
                      </span>
                      <Badge variant="outline" className="border-amber-600 text-amber-700 dark:text-amber-300">
                        Due in {getDaysUntil(expense.nextDueDate)} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View upcoming recurring expenses</CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recurring Expenses</CardTitle>
            <CardDescription>Automated bills and rent payments</CardDescription>
          </CardHeader>
          <CardContent>
            {recurringExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recurring expenses yet</p>
                <p className="text-sm mt-1">Add rent or utilities to track them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recurringExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p>{expense.title}</p>
                        <p className="text-muted-foreground">${expense.amount.toFixed(2)}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {expense.frequency}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Next due: {formatDate(expense.nextDueDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Split with:</p>
                      <div className="flex -space-x-2">
                        {expense.splits.slice(0, 3).map((split) => {
                          const contact = contacts.find((c) => c.id === split.contactId);
                          if (!contact) return null;

                          return (
                            <Avatar key={split.contactId} className="w-6 h-6 border-2 border-background">
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs">
                                {getInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                        {expense.splits.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                            +{expense.splits.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Recurring Expense</DialogTitle>
            <DialogDescription>
              Set up automatic reminders for rent, utilities, or other recurring bills
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Apartment Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v as any)}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-day">
                  {frequency === "monthly" ? "Day of Month" : frequency === "weekly" ? "Day of Week" : "Day"}
                </Label>
                <Select value={dueDay} onValueChange={setDueDay}>
                  <SelectTrigger id="due-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequency === "weekly"
                      ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {day}
                          </SelectItem>
                        ))
                      : Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Split with ({selectedContacts.length} selected)</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {contacts.map((contact) => {
                  const isSelected = selectedContacts.includes(contact.id);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => toggleContact(contact.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950 dark:border-indigo-700"
                          : "bg-background hover:bg-accent"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={isSelected ? "bg-indigo-200 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300" : "bg-muted text-xs"}>
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1 truncate">{contact.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {amount && selectedContacts.length > 0 && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-1">
                  Split equally among {selectedContacts.length + 1} people
                </p>
                <p className="text-indigo-900 dark:text-indigo-100">
                  ${(parseFloat(amount) / (selectedContacts.length + 1)).toFixed(2)} per person
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecurring}>Create Recurring Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
