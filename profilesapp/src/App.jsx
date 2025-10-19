
import { useState, useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Users, Receipt, Split, DollarSign, User, TrendingUp, Calendar } from "lucide-react";
import { ContactsTab } from "./components/ContactsTab";
import { ReceiptScannerTab } from "./components/ReceiptScannerTab";
import { SplitTab } from "./components/SplitTab";
import { BalancesTab } from "./components/BalancesTab";
import { ProfileTab } from "./components/ProfileTab";
import { InsightsTab } from "./components/InsightsTab";
import { CalendarTab } from "./components/CalendarTab";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./lib/theme-provider";

const client = generateClient();

function AppContent() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: "You",
    email: "you@email.com",
    phone: "+1 (555) 123-4567",
    notificationsEnabled: true,
    reminderDaysBefore: 3,
  });

  // Load current user and profile
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.userId);

        // Load user profile from database
        const { data: profiles } = await client.models.UserProfile.list({
          filter: { profileOwner: { eq: user.username } },
        });

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          setUserProfile({
            name: profile.name || "You",
            email: profile.email || "you@email.com",
            phone: profile.phone || "",
            avatar: profile.avatar || undefined,
            notificationsEnabled: profile.notificationsEnabled ?? true,
            reminderDaysBefore: profile.reminderDaysBefore ?? 3,
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const [contacts, setContacts] = useState([
    { id: "1", name: "Sarah Johnson", email: "sarah@email.com", phone: "+1 (555) 234-5678" },
    { id: "2", name: "Mike Chen", email: "mike@email.com", phone: "+1 (555) 345-6789" },
    { id: "3", name: "Alex Rivera", email: "alex@email.com", phone: "+1 (555) 456-7890" },
    { id: "4", name: "Emma Wilson", email: "emma@email.com", phone: "+1 (555) 567-8901" },
    { id: "5", name: "Chris Taylor", email: "chris@email.com", phone: "+1 (555) 678-9012" },
  ]);

  const [receipts, setReceipts] = useState([]);

  const [transactions, setTransactions] = useState([
    {
      id: "1",
      type: "receipt",
      from: "You",
      splits: [
        { contactId: "1", amount: 45.3 },
        { contactId: "2", amount: 38.2 },
      ],
      amount: 83.5,
      description: "Italian Garden Restaurant - Receipt",
      date: new Date(2025, 9, 15),
    },
    {
      id: "2",
      type: "expense",
      from: "You",
      splits: [
        { contactId: "1", amount: 40.0 },
        { contactId: "2", amount: 40.0 },
      ],
      amount: 80.0,
      description: "Groceries at Whole Foods",
      date: new Date(2025, 9, 12),
    },
    {
      id: "3",
      type: "expense",
      from: "You",
      splits: [
        { contactId: "3", amount: 25.0 },
        { contactId: "4", amount: 25.0 },
      ],
      amount: 50.0,
      description: "Uber ride home",
      date: new Date(2025, 9, 10),
    },
    {
      id: "4",
      type: "expense",
      from: "You",
      splits: [
        { contactId: "1", amount: 600.0 },
        { contactId: "2", amount: 600.0 },
      ],
      amount: 1200.0,
      description: "Monthly rent",
      date: new Date(2025, 9, 1),
    },
  ]);

  const [recurringExpenses, setRecurringExpenses] = useState([
    {
      id: "1",
      title: "Apartment Rent",
      amount: 1800.0,
      frequency: "monthly",
      dueDay: 1,
      splits: [
        { contactId: "1", amount: 600.0 },
        { contactId: "2", amount: 600.0 },
      ],
      nextDueDate: new Date(2025, 10, 1),
      description: "Monthly apartment rent split 3 ways",
    },
    {
      id: "2",
      title: "Utilities",
      amount: 150.0,
      frequency: "monthly",
      dueDay: 15,
      splits: [
        { contactId: "1", amount: 50.0 },
        { contactId: "2", amount: 50.0 },
      ],
      nextDueDate: new Date(2025, 9, 15),
    },
  ]);

  const addContact = async (contact) => {
    try {
      const { data: newContact } = await client.models.Contact.create({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        avatar: contact.avatar,
      });
      if (newContact) {
        setContacts([...contacts, { ...contact, id: newContact.id }]);
      }
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const addReceipt = (receipt) => {
    setReceipts([receipt, ...receipts]);
  };

  const addTransaction = (transaction) => {
    setTransactions([{ ...transaction, date: new Date() }, ...transactions]);
  };

  const addRecurringExpense = (expense) => {
    setRecurringExpenses([...recurringExpenses, expense]);
  };

  const calculateBalances = () => {
    const balances = new Map();

    transactions.forEach((transaction) => {
      transaction.splits.forEach((split) => {
        const current = balances.get(split.contactId) || 0;
        balances.set(split.contactId, current + split.amount);
      });
    });

    return Array.from(balances.entries())
      .map(([contactId, amount]) => ({ contactId, amount }))
      .filter((b) => Math.abs(b.amount) > 0.01);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SplitPay</h1>
          <p className="text-muted-foreground">
            Scan receipts, split expenses, and pay with ease
          </p>
        </div>

        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-muted/50 p-1">
            <TabsTrigger value="scanner" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Receipt className="w-4 h-4" />
              <span className="hidden lg:inline">Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="split" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Split className="w-4 h-4" />
              <span className="hidden lg:inline">Split</span>
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <DollarSign className="w-4 h-4" />
              <span className="hidden lg:inline">Balances</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <ReceiptScannerTab
              contacts={contacts}
              onAddReceipt={addReceipt}
              onAddTransaction={addTransaction}
            />
          </TabsContent>

          <TabsContent value="split">
            <SplitTab contacts={contacts} onAddTransaction={addTransaction} />
          </TabsContent>

          <TabsContent value="balances">
            <BalancesTab
              contacts={contacts}
              balances={calculateBalances()}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarTab
              contacts={contacts}
              recurringExpenses={recurringExpenses}
              onAddRecurringExpense={addRecurringExpense}
              reminderDaysBefore={userProfile.reminderDaysBefore}
            />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsTab
              contacts={contacts}
              transactions={transactions}
              balances={calculateBalances()}
            />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsTab contacts={contacts} onAddContact={addContact} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab profile={userProfile} onUpdateProfile={setUserProfile} />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="splitpay-theme">
      <Authenticator>
        <AppContent />
      </Authenticator>
    </ThemeProvider>
  );
}
