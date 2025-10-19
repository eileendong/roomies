import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { TrendingUp, DollarSign, Users, Sparkles, PieChart } from "lucide-react";
import { Progress } from "./ui/progress";
import type { Contact, Transaction, Balance } from "../App";

type InsightsTabProps = {
  contacts: Contact[];
  transactions: Transaction[];
  balances: Balance[];
};

export function InsightsTab({ contacts, transactions, balances }: InsightsTabProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactName = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)?.name || "Unknown";
  };

  // AI-generated insights
  const calculateInsights = () => {
    // Who's paying the most
    const paymentsByPerson = new Map<string, number>();
    transactions.forEach((t) => {
      const current = paymentsByPerson.get(t.from) || 0;
      paymentsByPerson.set(t.from, current + t.amount);
    });

    // Spending by category (based on description keywords)
    const categories = new Map<string, number>();
    const categoryKeywords = {
      Food: ["restaurant", "food", "dinner", "lunch", "breakfast", "pizza", "groceries"],
      Transport: ["uber", "lyft", "taxi", "gas", "parking"],
      Housing: ["rent", "utilities", "electric", "water", "internet"],
      Entertainment: ["movie", "concert", "bar", "club", "game"],
    };

    transactions.forEach((t) => {
      const desc = t.description.toLowerCase();
      let categorized = false;

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => desc.includes(keyword))) {
          categories.set(category, (categories.get(category) || 0) + t.amount);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        categories.set("Other", (categories.get("Other") || 0) + t.amount);
      }
    });

    // Most frequent split partners
    const splitFrequency = new Map<string, number>();
    transactions.forEach((t) => {
      t.splits.forEach((split) => {
        splitFrequency.set(split.contactId, (splitFrequency.get(split.contactId) || 0) + 1);
      });
    });

    // Total spent this month
    const now = new Date();
    const thisMonth = transactions.filter(
      (t) => t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear()
    );
    const totalThisMonth = thisMonth.reduce((sum, t) => sum + t.amount, 0);

    // Average transaction
    const avgTransaction = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
      : 0;

    return {
      topPayer: Array.from(paymentsByPerson.entries())
        .sort((a, b) => b[1] - a[1])[0],
      categories: Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1]),
      topSplitPartners: Array.from(splitFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      totalThisMonth,
      avgTransaction,
      totalTransactions: transactions.length,
    };
  };

  const insights = calculateInsights();
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-indigo-900 dark:text-indigo-100">AI Insights</CardTitle>
          </div>
          <CardDescription>Smart analysis of your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background/60 backdrop-blur rounded-lg border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm">This Month</p>
              </div>
              <p className="text-2xl">${insights.totalThisMonth.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-background/60 backdrop-blur rounded-lg border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4" />
                <p className="text-sm">Avg Transaction</p>
              </div>
              <p className="text-2xl">${insights.avgTransaction.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Who's Paying Most?</CardTitle>
            <CardDescription>People who paid for shared expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.topPayer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <p>{insights.topPayer[0] === "You" ? "You" : "You"}</p>
                    <p className="text-sm text-muted-foreground">
                      Total paid: ${insights.topPayer[1].toFixed(2)}
                    </p>
                  </div>
                  <Badge className="bg-green-600">Top Payer</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  💡 You've covered {((insights.topPayer[1] / totalSpent) * 100).toFixed(0)}% of all expenses
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No payment data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Split With</CardTitle>
            <CardDescription>Your frequent split partners</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.topSplitPartners.length > 0 ? (
              <div className="space-y-3">
                {insights.topSplitPartners.map(([contactId, count], index) => {
                  const contact = contacts.find((c) => c.id === contactId);
                  if (!contact) return null;

                  return (
                    <div
                      key={contactId}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="text-xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p>{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{count} transactions</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No split data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            <CardTitle>Spending by Category</CardTitle>
          </div>
          <CardDescription>Where your money is going</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.categories.length > 0 ? (
            <div className="space-y-4">
              {insights.categories.map(([category, amount]) => {
                const percentage = (amount / totalSpent) * 100;
                const emoji = {
                  Food: "🍽️",
                  Transport: "🚗",
                  Housing: "🏠",
                  Entertainment: "🎉",
                  Other: "📦",
                }[category] || "📦";

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        <p>{category}</p>
                      </div>
                      <div className="text-right">
                        <p>${amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No spending data yet</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="mb-2">Smart Tip</p>
              <p className="text-sm text-muted-foreground">
                {insights.categories[0]?.[0] === "Food"
                  ? "You're spending the most on food. Consider meal prepping to save money!"
                  : insights.categories[0]?.[0] === "Housing"
                  ? "Housing is your biggest expense. Make sure everyone pays on time to avoid late fees."
                  : "Track your expenses regularly to spot spending patterns and save more."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
