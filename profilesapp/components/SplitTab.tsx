import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { Contact, Transaction, SplitDetail } from "../App";

type SplitTabProps = {
  contacts: Contact[];
  onAddTransaction: (transaction: Transaction) => void;
};

export function SplitTab({ contacts, onAddTransaction }: SplitTabProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Map<string, string>>(new Map());

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
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCustomAmountChange = (contactId: string, value: string) => {
    const newMap = new Map(customAmounts);
    newMap.set(contactId, value);
    setCustomAmounts(newMap);
  };

  const handleSubmit = () => {
    const totalAmount = parseFloat(amount);
    
    if (!amount || isNaN(totalAmount) || totalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error("Please select at least one person");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    let splits: SplitDetail[] = [];

    if (splitType === "equal") {
      const perPerson = totalAmount / selectedContacts.length;
      splits = selectedContacts.map((contactId) => ({
        contactId,
        amount: perPerson,
      }));
    } else {
      splits = selectedContacts.map((contactId) => {
        const customAmount = parseFloat(customAmounts.get(contactId) || "0");
        return {
          contactId,
          amount: customAmount,
        };
      });

      const totalCustom = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalCustom - totalAmount) > 0.01) {
        toast.error(`Custom amounts must add up to $${totalAmount.toFixed(2)}`);
        return;
      }
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "expense",
      from: "You",
      splits,
      amount: totalAmount,
      description: description.trim(),
      date: new Date(),
    };

    onAddTransaction(transaction);
    toast.success("Expense split created!");

    setAmount("");
    setDescription("");
    setSelectedContacts([]);
    setCustomAmounts(new Map());
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Split Expense</CardTitle>
          <CardDescription>Manually split a bill or expense</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Total Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-10 h-12 bg-muted/30"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this expense for?"
              className="bg-muted/30 min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Split Type</Label>
            <RadioGroup value={splitType} onValueChange={(v) => setSplitType(v as "equal" | "custom")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal" className="font-normal cursor-pointer">
                  Split equally
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Custom amounts
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleSubmit} className="w-full h-12 text-base font-medium">
            Create Split
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select People</CardTitle>
          <CardDescription>
            Choose who to split with ({selectedContacts.length} selected)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contacts.map((contact) => {
              const isSelected = selectedContacts.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:border-gray-300 ${
                    isSelected ? "bg-muted/20 border-gray-300" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-foreground font-medium">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium">{contact.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {isSelected && splitType === "custom" && (
                    <div className="mt-3 pl-13">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-10 h-10 bg-muted/30"
                          value={customAmounts.get(contact.id) || ""}
                          onChange={(e) => handleCustomAmountChange(contact.id, e.target.value)}
                          step="0.01"
                          min="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}