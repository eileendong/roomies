import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { X, Check } from "lucide-react";
import type { Contact, Receipt, ReceiptItem } from "../App";

type ReceiptItemsSplitterProps = {
  receipt: Receipt;
  contacts: Contact[];
  onFinalize: (receipt: Receipt) => void;
  onCancel: () => void;
};

export function ReceiptItemsSplitter({
  receipt,
  contacts,
  onFinalize,
  onCancel,
}: ReceiptItemsSplitterProps) {
  const [items, setItems] = useState<ReceiptItem[]>(receipt.items);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const togglePersonForItem = (itemId: string, contactId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const isAssigned = item.assignedTo.includes(contactId);
        return {
          ...item,
          assignedTo: isAssigned
            ? item.assignedTo.filter((id) => id !== contactId)
            : [...item.assignedTo, contactId],
        };
      })
    );
  };

  const calculateSplits = () => {
    const splits = new Map<string, number>();
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAndTipTotal = receipt.tax + receipt.tip;

    items.forEach((item) => {
      if (item.assignedTo.length === 0) return;

      const totalItemCost = item.price * item.quantity;
      const perPersonCost = totalItemCost / item.assignedTo.length;

      item.assignedTo.forEach((contactId) => {
        splits.set(contactId, (splits.get(contactId) || 0) + perPersonCost);
      });
    });

    // Add proportional tax and tip
    splits.forEach((amount, contactId) => {
      const proportion = amount / itemsTotal;
      const additionalCost = taxAndTipTotal * proportion;
      splits.set(contactId, amount + additionalCost);
    });

    return splits;
  };

  const splits = calculateSplits();
  const unassignedItems = items.filter((item) => item.assignedTo.length === 0);

  const handleFinalize = () => {
    if (unassignedItems.length > 0) {
      // Could show a warning, but allow proceeding
    }
    onFinalize({ ...receipt, items });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{receipt.merchant}</CardTitle>
              <CardDescription>
                Assign items to split the bill
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Items list */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p>
                        {item.name} {item.quantity > 1 && `(×${item.quantity})`}
                      </p>
                      <p className="text-muted-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                        {item.assignedTo.length > 0 && (
                          <span className="ml-2 text-sm">
                            • ${((item.price * item.quantity) / item.assignedTo.length).toFixed(2)} each
                          </span>
                        )}
                      </p>
                    </div>
                    {item.assignedTo.length === 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Unassigned
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {contacts.map((contact) => {
                      const isAssigned = item.assignedTo.includes(contact.id);
                      return (
                        <button
                          key={contact.id}
                          onClick={() => togglePersonForItem(item.id, contact.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            isAssigned
                              ? "bg-indigo-50 border-indigo-300"
                              : "bg-background hover:bg-accent"
                          }`}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className={isAssigned ? "bg-indigo-200 text-indigo-700" : "bg-muted text-muted-foreground text-xs"}>
                              {getInitials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{contact.name.split(" ")[0]}</span>
                          {isAssigned && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Receipt summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>
                  ${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tip</span>
                <span>${receipt.tip.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Total</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split summary */}
      <Card>
        <CardHeader>
          <CardTitle>Split Summary</CardTitle>
          <CardDescription>How much each person owes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from(splits.entries()).map(([contactId, amount]) => {
              const contact = contacts.find((c) => c.id === contactId);
              if (!contact) return null;

              return (
                <div
                  key={contactId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{contact.name}</span>
                  </div>
                  <span className="text-green-700">${amount.toFixed(2)}</span>
                </div>
              );
            })}

            {splits.size === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Assign items to see the split
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleFinalize}
              className="flex-1"
              disabled={splits.size === 0}
            >
              Finalize Split
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
