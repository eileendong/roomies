import { useState } from "react";
import { ChoreList } from "./components/ChoreList";
import { AddChoreDialog } from "./components/AddChoreDialog";
import { ChoreDetailDrawer } from "./components/ChoreDetailDrawer";
import { Leaderboard } from "./components/Leaderboard";
import { Dashboard } from "./components/Dashboard";
import { RandomSpinner } from "./components/RandomSpinner";
import { WeeklySummary } from "./components/WeeklySummary";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { Plus, Trophy, LayoutDashboard, Sparkles, Shuffle, Target, Flame, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner@2.0.3";

export type Frequency = "once" | "daily" | "weekly" | "monthly";
export type ChoreStatus = "pending" | "due-today" | "overdue" | "completed";

export interface Roommate {
  id: string;
  name: string;
  avatar: string;
  color: string;
  level: number;
  totalPoints: number;
  badges: string[];
}

export interface ChoreReaction {
  id: string;
  userId: string;
  emoji: string;
}

export interface ChoreComment {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
}

export interface ChoreCompletion {
  id: string;
  completedBy: string;
  completedAt: Date;
  points: number;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  frequency: Frequency;
  dueDate: Date;
  assignees: string[];
  points: number;
  completed: boolean;
  completions: ChoreCompletion[];
  rotationOrder?: string[];
  reactions: ChoreReaction[];
  comments: ChoreComment[];
  category?: string;
}

// Mock roommates data
const mockRoommates: Roommate[] = [
  { id: "1", name: "Alex", avatar: "A", color: "#3b82f6", level: 5, totalPoints: 250, badges: ["early-bird", "plant-whisperer"] },
  { id: "2", name: "Sam", avatar: "S", color: "#8b5cf6", level: 4, totalPoints: 180, badges: ["clean-freak"] },
  { id: "3", name: "Jordan", avatar: "J", color: "#ec4899", level: 6, totalPoints: 320, badges: ["streak-master", "team-player"] },
  { id: "4", name: "Taylor", avatar: "T", color: "#10b981", level: 3, totalPoints: 120, badges: ["newbie"] },
];

// Mock chores data
const initialChores: Chore[] = [
  {
    id: "1",
    title: "Take out trash",
    description: "Empty all trash bins and take bags to outdoor bins",
    frequency: "weekly",
    dueDate: new Date(2025, 9, 19),
    assignees: ["1"],
    points: 10,
    completed: false,
    completions: [
      { id: "c1", completedBy: "1", completedAt: new Date(2025, 9, 12), points: 10 },
      { id: "c2", completedBy: "2", completedAt: new Date(2025, 9, 5), points: 10 },
    ],
    rotationOrder: ["1", "2", "3", "4"],
    reactions: [{ id: "r1", userId: "2", emoji: "💪" }],
    comments: [{ id: "cm1", userId: "2", text: "Thanks for keeping up with this!", timestamp: new Date(2025, 9, 12) }],
    category: "cleaning",
  },
  {
    id: "2",
    title: "Clean bathroom",
    description: "Scrub toilet, sink, shower, and mop floor",
    frequency: "weekly",
    dueDate: new Date(2025, 9, 20),
    assignees: ["2"],
    points: 20,
    completed: false,
    completions: [
      { id: "c3", completedBy: "2", completedAt: new Date(2025, 9, 13), points: 20 },
    ],
    rotationOrder: ["2", "3", "4", "1"],
    reactions: [],
    comments: [],
    category: "cleaning",
  },
  {
    id: "3",
    title: "Vacuum living room",
    description: "Vacuum all carpets and rugs in common areas",
    frequency: "weekly",
    dueDate: new Date(2025, 9, 18),
    assignees: ["3"],
    points: 15,
    completed: true,
    completions: [
      { id: "c4", completedBy: "3", completedAt: new Date(2025, 9, 18), points: 15 },
      { id: "c5", completedBy: "3", completedAt: new Date(2025, 9, 11), points: 15 },
    ],
    rotationOrder: ["3", "4", "1", "2"],
    reactions: [{ id: "r2", userId: "1", emoji: "✨" }, { id: "r3", userId: "4", emoji: "🎉" }],
    comments: [],
    category: "cleaning",
  },
  {
    id: "4",
    title: "Do dishes",
    description: "Wash, dry, and put away all dishes in sink",
    frequency: "daily",
    dueDate: new Date(2025, 9, 18),
    assignees: ["4"],
    points: 5,
    completed: false,
    completions: [],
    rotationOrder: ["4", "1", "2", "3"],
    reactions: [],
    comments: [],
    category: "kitchen",
  },
  {
    id: "5",
    title: "Water plants",
    description: "Water all indoor and balcony plants",
    frequency: "weekly",
    dueDate: new Date(2025, 9, 15),
    assignees: ["1"],
    points: 5,
    completed: false,
    completions: [],
    reactions: [{ id: "r4", userId: "3", emoji: "🌿" }],
    comments: [],
    category: "plants",
  },
  {
    id: "6",
    title: "Grocery shopping",
    description: "Buy household essentials and groceries",
    frequency: "weekly",
    dueDate: new Date(2025, 9, 21),
    assignees: ["2", "3"],
    points: 15,
    completed: false,
    completions: [],
    reactions: [],
    comments: [],
    category: "shopping",
  },
];

export default function App() {
  const [chores, setChores] = useState<Chore[]>(initialChores);
  const [roommates, setRoommates] = useState<Roommate[]>(mockRoommates);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSpinnerOpen, setIsSpinnerOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [currentUser] = useState<string>("1"); // Current logged in user (Alex)
  const [filterTab, setFilterTab] = useState<"all" | "mine" | "overdue">("all");

  const handleAddChore = (newChore: Omit<Chore, "id" | "completed" | "completions" | "reactions" | "comments">) => {
    const chore: Chore = {
      ...newChore,
      id: Date.now().toString(),
      completed: false,
      completions: [],
      reactions: [],
      comments: [],
    };
    setChores([...chores, chore]);
  };

  const handleToggleComplete = (choreId: string) => {
    setChores(chores.map(chore => {
      if (chore.id === choreId) {
        const newCompleted = !chore.completed;
        
        // If marking as complete, add to completions
        if (newCompleted) {
          const completion: ChoreCompletion = {
            id: Date.now().toString(),
            completedBy: currentUser,
            completedAt: new Date(),
            points: chore.points,
          };

          // Update roommate points and check for level up
          setRoommates(prev => prev.map(rm => {
            if (rm.id === currentUser) {
              const newTotalPoints = rm.totalPoints + chore.points;
              const newLevel = Math.floor(newTotalPoints / 100) + 1;
              const leveledUp = newLevel > rm.level;
              
              if (leveledUp) {
                toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
                  description: `Keep crushing those chores!`,
                });
              }

              // Check for new badges
              const newBadges = checkForNewBadges(rm, chores, choreId);
              
              return {
                ...rm,
                totalPoints: newTotalPoints,
                level: newLevel,
                badges: newBadges.length > rm.badges.length ? newBadges : rm.badges,
              };
            }
            return rm;
          }));

          // Show success toast with points
          toast.success(`🎉 +${chore.points} points!`, {
            description: `Great job completing "${chore.title}"!`,
          });
          
          // Handle rotation if it's a recurring chore
          let updatedChore = { ...chore, completed: newCompleted };
          if (chore.frequency !== "once" && chore.rotationOrder && chore.rotationOrder.length > 1) {
            const currentIndex = chore.rotationOrder.indexOf(chore.assignees[0]);
            const nextIndex = (currentIndex + 1) % chore.rotationOrder.length;
            const nextAssignee = chore.rotationOrder[nextIndex];
            
            // Calculate next due date
            const nextDueDate = new Date(chore.dueDate);
            switch (chore.frequency) {
              case "daily":
                nextDueDate.setDate(nextDueDate.getDate() + 1);
                break;
              case "weekly":
                nextDueDate.setDate(nextDueDate.getDate() + 7);
                break;
              case "monthly":
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                break;
            }
            
            updatedChore = {
              ...updatedChore,
              assignees: [nextAssignee],
              dueDate: nextDueDate,
              completed: false,
            };
          }
          
          return {
            ...updatedChore,
            completions: [...chore.completions, completion],
          };
        }
        
        return { ...chore, completed: newCompleted };
      }
      return chore;
    }));
  };

  const checkForNewBadges = (roommate: Roommate, allChores: Chore[], completedChoreId: string): string[] => {
    const badges = [...roommate.badges];
    const completedChore = allChores.find(c => c.id === completedChoreId);
    
    // Plant Whisperer - complete 3 plant-related chores
    if (completedChore?.category === "plants") {
      const plantCompletions = allChores
        .filter(c => c.category === "plants")
        .reduce((sum, c) => sum + c.completions.filter(comp => comp.completedBy === roommate.id).length, 0);
      
      if (plantCompletions >= 3 && !badges.includes("plant-whisperer")) {
        badges.push("plant-whisperer");
        toast.success("🌿 Badge Unlocked: Plant Whisperer!", {
          description: "You've completed 3 plant-related chores!",
        });
      }
    }

    // Early Bird - complete 5 chores before due date
    const earlyCompletions = allChores.filter(c => 
      c.completions.some(comp => {
        if (comp.completedBy !== roommate.id) return false;
        const completedDate = new Date(comp.completedAt);
        const dueDate = new Date(c.dueDate);
        return completedDate < dueDate;
      })
    ).length;

    if (earlyCompletions >= 5 && !badges.includes("early-bird")) {
      badges.push("early-bird");
      toast.success("🌅 Badge Unlocked: Early Bird!", {
        description: "You've completed 5 chores before their due date!",
      });
    }

    // Streak Master - complete chores 7 days in a row
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    const hasStreak = last7Days.every(day => 
      allChores.some(c => 
        c.completions.some(comp => 
          comp.completedBy === roommate.id && 
          new Date(comp.completedAt).toDateString() === day
        )
      )
    );

    if (hasStreak && !badges.includes("streak-master")) {
      badges.push("streak-master");
      toast.success("🔥 Badge Unlocked: Streak Master!", {
        description: "7-day completion streak!",
      });
    }

    return badges;
  };

  const handleAddReaction = (choreId: string, emoji: string) => {
    setChores(prev => prev.map(chore => {
      if (chore.id === choreId) {
        const existingReaction = chore.reactions.find(r => r.userId === currentUser && r.emoji === emoji);
        if (existingReaction) {
          return {
            ...chore,
            reactions: chore.reactions.filter(r => r.id !== existingReaction.id),
          };
        }
        return {
          ...chore,
          reactions: [...chore.reactions, {
            id: Date.now().toString(),
            userId: currentUser,
            emoji,
          }],
        };
      }
      return chore;
    }));
  };

  const handleAddComment = (choreId: string, text: string) => {
    setChores(prev => prev.map(chore => {
      if (chore.id === choreId) {
        return {
          ...chore,
          comments: [...chore.comments, {
            id: Date.now().toString(),
            userId: currentUser,
            text,
            timestamp: new Date(),
          }],
        };
      }
      return chore;
    }));
    toast.success("Comment added!");
  };

  const handleDeleteChore = (choreId: string) => {
    setChores(chores.filter(chore => chore.id !== choreId));
    setSelectedChore(null);
  };

  // Calculate stats
  const currentRoommate = roommates.find(r => r.id === currentUser);
  const myChores = chores.filter(c => c.assignees.includes(currentUser));
  const thisWeekCompletions = chores.filter(c => 
    c.completions.some(comp => {
      const compDate = new Date(comp.completedAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return compDate >= oneWeekAgo && comp.completedBy === currentUser;
    })
  ).length;

  // Calculate streak
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  });

  let currentStreak = 0;
  for (const day of last30Days) {
    const hasCompletion = chores.some(c => 
      c.completions.some(comp => 
        comp.completedBy === currentUser && 
        new Date(comp.completedAt).toDateString() === day
      )
    );
    if (hasCompletion) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Count chores by frequency
  const dailyCount = chores.filter(c => c.frequency === "daily" && !c.completed).length;
  const weeklyCount = chores.filter(c => c.frequency === "weekly" && !c.completed).length;
  const monthlyCount = chores.filter(c => c.frequency === "monthly" && !c.completed).length;

  const [frequencyTab, setFrequencyTab] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [statusTab, setStatusTab] = useState<"all" | "mine" | "overdue">("all");

  // Filter chores by frequency and status
  let filteredChores = chores;
  
  // Apply frequency filter
  if (frequencyTab !== "all") {
    filteredChores = filteredChores.filter(c => c.frequency === frequencyTab);
  }

  // Apply status filter
  if (statusTab === "mine") {
    filteredChores = filteredChores.filter(c => c.assignees.includes(currentUser));
  } else if (statusTab === "overdue") {
    filteredChores = filteredChores.filter(c => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(c.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today && !c.completed;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 md:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-slate-900 mb-1">Chore Tracker</h1>
              <p className="text-slate-600">Level up your home game 🏠</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-sm text-slate-600 mb-1">My Chores</div>
              <div className="text-2xl text-slate-900">{myChores.length}</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-amber-600 fill-amber-600" />
              </div>
              <div className="text-sm text-slate-600 mb-1">Total Points</div>
              <div className="text-2xl text-slate-900">{currentRoommate?.totalPoints || 0}</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="text-sm text-slate-600 mb-1">This Week</div>
              <div className="text-2xl text-slate-900">{thisWeekCompletions}</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-sm text-slate-600 mb-1">Streak</div>
              <div className="text-2xl text-slate-900">{currentStreak}</div>
            </div>
          </div>

          {/* Frequency Tabs */}
          <div className="bg-white rounded-xl p-1 border border-slate-200 inline-flex mb-4">
            <button
              onClick={() => setFrequencyTab("all")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                frequencyTab === "all"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFrequencyTab("daily")}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                frequencyTab === "daily"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily
              {dailyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                  {dailyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFrequencyTab("weekly")}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                frequencyTab === "weekly"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly
              {weeklyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs">
                  {weeklyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFrequencyTab("monthly")}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                frequencyTab === "monthly"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
              {monthlyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs">
                  {monthlyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Status Tabs & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setStatusTab("all")}
              className={`text-sm transition-all pb-2 border-b-2 ${
                statusTab === "all"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusTab("mine")}
              className={`text-sm transition-all pb-2 border-b-2 ${
                statusTab === "mine"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setStatusTab("overdue")}
              className={`text-sm transition-all pb-2 border-b-2 ${
                statusTab === "overdue"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overdue
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsSummaryOpen(true)}
              variant="ghost"
              size="sm"
              className="text-slate-600"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Summary
            </Button>
            <Button
              onClick={() => setIsDashboardOpen(true)}
              variant="ghost"
              size="sm"
              className="text-slate-600"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <Button
              onClick={() => setIsLeaderboardOpen(true)}
              variant="outline"
              size="sm"
              className="border-slate-300"
            >
              <Trophy className="h-4 w-4 mr-1 text-amber-600" />
              Leaderboard
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Chore
            </Button>
          </div>
        </div>

        {/* Chore List */}
        <div className="space-y-3">
          <ChoreList
            chores={filteredChores}
            roommates={roommates}
            currentUser={currentUser}
            onToggleComplete={handleToggleComplete}
            onChoreClick={setSelectedChore}
            onAddReaction={handleAddReaction}
          />
        </div>

        {/* Add Chore Dialog */}
        <AddChoreDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          roommates={roommates}
          onAddChore={handleAddChore}
        />

        {/* Chore Detail Drawer */}
        {selectedChore && (
          <ChoreDetailDrawer
            chore={selectedChore}
            roommates={roommates}
            currentUser={currentUser}
            open={!!selectedChore}
            onOpenChange={(open) => !open && setSelectedChore(null)}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteChore}
            onAddReaction={handleAddReaction}
            onAddComment={handleAddComment}
          />
        )}

        {/* Dashboard */}
        <Dashboard
          chores={chores}
          roommates={roommates}
          currentUser={currentUser}
          open={isDashboardOpen}
          onOpenChange={setIsDashboardOpen}
        />

        {/* Leaderboard Dialog */}
        <Leaderboard
          chores={chores}
          roommates={roommates}
          open={isLeaderboardOpen}
          onOpenChange={setIsLeaderboardOpen}
        />

        {/* Random Spinner */}
        <RandomSpinner
          chores={chores.filter(c => !c.completed)}
          roommates={roommates}
          open={isSpinnerOpen}
          onOpenChange={setIsSpinnerOpen}
          onAssign={(choreId, roommateId) => {
            setChores(prev => prev.map(c => 
              c.id === choreId ? { ...c, assignees: [roommateId] } : c
            ));
            toast.success("Chore assigned!");
          }}
        />

        {/* Weekly Summary */}
        <WeeklySummary
          chores={chores}
          roommates={roommates}
          currentUser={currentUser}
          open={isSummaryOpen}
          onOpenChange={setIsSummaryOpen}
        />

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </div>
  );
}
