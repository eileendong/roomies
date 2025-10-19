import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Contact, Balance, Transaction } from "../App";

type BalancesTabProps = {
  contacts: Contact[];
  balances: Balance[];
  transactions: Transaction[];
};

export function BalancesTab({ contacts, balances, transactions }: BalancesTabProps) {
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

  const totalOwed = balances
    .filter((b) => b.amount > 0)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalOwe = Math.abs(
    balances.filter((b) => b.amount < 0).reduce((sum, b) => sum + b.amount, 0)
  );

  // Mock payment integration
  const handlePayWithVenmo = (contactId: string, amount: number) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    // In production, this would redirect to Venmo with pre-filled payment info
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(
      contact.email || contact.name
    )}&amount=${amount.toFixed(2)}&note=${encodeURIComponent("SplitPay settlement")}`;

    toast.success(`Opening Venmo to pay ${contact.name} $${amount.toFixed(2)}`);
    
    // Fallback to web if app not available
    setTimeout(() => {
      window.open(
        `https://venmo.com/?txn=pay&amount=${amount.toFixed(2)}&note=SplitPay`,
        "_blank"
      );
    }, 100);
  };

  const handlePayWithPayPal = (contactId: string, amount: number) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    // In production, this would use PayPal API
    const paypalUrl = `https://www.paypal.com/paypalme/${encodeURIComponent(
      contact.email || contact.name
    )}/${amount.toFixed(2)}`;

    toast.success(`Opening PayPal to pay ${contact.name} $${amount.toFixed(2)}`);
    window.open(paypalUrl, "_blank");
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <ArrowUpRight className="w-5 h-5" />
              <p>You are owed</p>
            </div>
            <p className="text-green-900 dark:text-green-100">${totalOwed.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <ArrowDownRight className="w-5 h-5" />
              <p>You owe</p>
            </div>
            <p className="text-red-900 dark:text-red-100">${totalOwe.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balances</CardTitle>
          <CardDescription>Settle up with your contacts</CardDescription>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-2xl mb-2">🎉</p>
              <p>All settled up!</p>
              <p className="text-sm mt-1">No outstanding balances</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balances
                .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                .map((balance) => {
                  const contact = contacts.find((c) => c.id === balance.contactId);
                  if (!contact) return null;

                  const owesYou = balance.amount > 0;
                  const absAmount = Math.abs(balance.amount);

                  return (
                    <div
                      key={balance.contactId}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{contact.name}</p>
                          <p className={`text-sm ${owesYou ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                            {owesYou
                              ? `owes you $${absAmount.toFixed(2)}`
                              : `you owe $${absAmount.toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      {!owesYou && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePayWithVenmo(balance.contactId, absAmount)}
                            className="gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Venmo
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePayWithPayPal(balance.contactId, absAmount)}
                            className="gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            PayPal
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p>{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {transaction.splits.length} {transaction.splits.length === 1 ? "person" : "people"}
                      </p>
                    </div>
                  </div>
                  <p>${transaction.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}