"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";

import { AddChoreDialog } from "./components/AddChoreDialog";
import { ChoreDetailDrawer } from "./components/ChoreDetailDrawer";
import { Leaderboard } from "./components/LeaderBoard";      // file is LeaderBoard.tsx
import { Dashboard } from "./components/Dashboard";
import { RandomSpinner } from "./components/RandomSpinner";
import { WeeklySummary } from "./components/WeeklySummary";

import {
  Plus,
  Trophy,
  LayoutDashboard,
  Sparkles,
  Target,
  Flame,
  Zap,
  TrendingUp,
  Calendar,
  Repeat,
  Users,
  MessageCircle,
} from "lucide-react";
import { toast, Toaster } from "sonner";

/* ========= TYPES ========= */

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

/* ========= MOCK DATA ========= */

const mockRoommates: Roommate[] = [
  {
    id: "1",
    name: "Alex",
    avatar: "A",
    color: "#3b82f6",
    level: 5,
    totalPoints: 250,
    badges: ["early-bird", "plant-whisperer"],
  },
  {
    id: "2",
    name: "Sam",
    avatar: "S",
    color: "#8b5cf6",
    level: 4,
    totalPoints: 180,
    badges: ["clean-freak"],
  },
  {
    id: "3",
    name: "Jordan",
    avatar: "J",
    color: "#ec4899",
    level: 6,
    totalPoints: 320,
    badges: ["streak-master", "team-player"],
  },
  { id: "4", name: "Taylor", avatar: "T", color: "#10b981", level: 3, totalPoints: 120, badges: ["newbie"] },
];

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
    completions: [{ id: "c3", completedBy: "2", completedAt: new Date(2025, 9, 13), points: 20 }],
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
    reactions: [
      { id: "r2", userId: "1", emoji: "✨" },
      { id: "r3", userId: "4", emoji: "🎉" },
    ],
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

/* ========= APP ========= */

export default function App() {
  // State
  const [chores, setChores] = useState<Chore[]>(initialChores);
  const [roommates, setRoommates] = useState<Roommate[]>(mockRoommates);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSpinnerOpen, setIsSpinnerOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [currentUser] = useState<string>("1");
  const [frequencyTab, setFrequencyTab] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [statusTab, setStatusTab] = useState<"all" | "mine" | "overdue">("all");

  // Stable "now" for client-only time math (avoids hydration headaches)
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  /* ======= ACTIONS ======= */

  const handleAddChore = (
    newChore: Omit<Chore, "id" | "completed" | "completions" | "reactions" | "comments">
  ) => {
    const chore: Chore = {
      ...newChore,
      id: Date.now().toString(),
      completed: false,
      completions: [],
      reactions: [],
      comments: [],
    };
    setChores((prev) => [...prev, chore]);
  };

  const handleToggleComplete = (choreId: string) => {
    setChores((prevChores) =>
      prevChores.map((chore) => {
        if (chore.id !== choreId) return chore;

        const toggled = !chore.completed;
        if (!toggled) return { ...chore, completed: false };

        const completion: ChoreCompletion = {
          id: Date.now().toString(),
          completedBy: currentUser,
          completedAt: new Date(),
          points: chore.points,
        };

        // Update roommate stats/level/badges
        setRoommates((prev) =>
          prev.map((rm) => {
            if (rm.id !== currentUser) return rm;

            const newTotalPoints = rm.totalPoints + chore.points;
            const newLevel = Math.floor(newTotalPoints / 100) + 1;
            const leveledUp = newLevel > rm.level;

            if (leveledUp) {
              toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
                description: "Keep crushing those chores!",
              });
            }

            const newBadges = checkForNewBadges(rm, prevChores, choreId);
            return {
              ...rm,
              totalPoints: newTotalPoints,
              level: newLevel,
              badges: newBadges.length > rm.badges.length ? newBadges : rm.badges,
            };
          })
        );

        toast.success(`🎉 +${chore.points} points!`, {
          description: `Great job completing "${chore.title}"!`,
        });

        // Rotate assignment & advance due date for recurring chores
        let updatedChore: Chore = { ...chore, completed: true };
        if (chore.frequency !== "once" && chore.rotationOrder && chore.rotationOrder.length > 1) {
          const currentIndex = chore.rotationOrder.indexOf(chore.assignees[0]);
          const nextIndex = (currentIndex + 1) % chore.rotationOrder.length;
          const nextAssignee = chore.rotationOrder[nextIndex];

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
      })
    );
  };

  const handleAddReaction = (choreId: string, emoji: string) => {
    setChores((prev) =>
      prev.map((chore) => {
        if (chore.id !== choreId) return chore;
        const existing = chore.reactions.find((r) => r.userId === currentUser && r.emoji === emoji);
        if (existing) {
          return { ...chore, reactions: chore.reactions.filter((r) => r.id !== existing.id) };
        }
        return {
          ...chore,
          reactions: [...chore.reactions, { id: Date.now().toString(), userId: currentUser, emoji }],
        };
      })
    );
  };

  const handleAddComment = (choreId: string, text: string) => {
    setChores((prev) =>
      prev.map((chore) =>
        chore.id === choreId
          ? {
              ...chore,
              comments: [
                ...chore.comments,
                { id: Date.now().toString(), userId: currentUser, text, timestamp: new Date() },
              ],
            }
          : chore
      )
    );
    toast.success("Comment added!");
  };

  const handleDeleteChore = (choreId: string) => {
    setChores((prev) => prev.filter((chore) => chore.id !== choreId));
    setSelectedChore(null);
  };

  /* ======= DERIVED STATE ======= */

  const currentRoommate = roommates.find((r) => r.id === currentUser);
  const myChores = useMemo(
    () => chores.filter((c) => c.assignees.includes(currentUser)),
    [chores, currentUser]
  );

  const { thisWeekCompletions, currentStreak } = useMemo(() => {
    if (!now) return { thisWeekCompletions: 0, currentStreak: 0 };

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekCount = chores.filter((c) =>
      c.completions.some(
        (comp) => comp.completedBy === currentUser && new Date(comp.completedAt) >= oneWeekAgo
      )
    ).length;

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toDateString();
    });

    let streak = 0;
    for (const day of last30Days) {
      const has = chores.some((c) =>
        c.completions.some(
          (comp) => comp.completedBy === currentUser && new Date(comp.completedAt).toDateString() === day
        )
      );
      if (has) streak++;
      else break;
    }

    return { thisWeekCompletions: weekCount, currentStreak: streak };
  }, [now, chores, currentUser]);

  const dailyCount = useMemo(
    () => chores.filter((c) => c.frequency === "daily" && !c.completed).length,
    [chores]
  );
  const weeklyCount = useMemo(
    () => chores.filter((c) => c.frequency === "weekly" && !c.completed).length,
    [chores]
  );
  const monthlyCount = useMemo(
    () => chores.filter((c) => c.frequency === "monthly" && !c.completed).length,
    [chores]
  );

  const filteredChores = useMemo(() => {
    let list = chores;

    if (frequencyTab !== "all") list = list.filter((c) => c.frequency === frequencyTab);

    if (statusTab === "mine") {
      list = list.filter((c) => c.assignees.includes(currentUser));
    } else if (statusTab === "overdue" && now) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      list = list.filter((c) => {
        const due = new Date(c.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today && !c.completed;
      });
    }

    return list;
  }, [chores, frequencyTab, statusTab, currentUser, now]);

  /* ======= BADGES ======= */

  function checkForNewBadges(
    roommate: Roommate,
    allChores: Chore[],
    completedChoreId: string
  ): string[] {
    const badges = [...roommate.badges];
    const completedChore = allChores.find((c) => c.id === completedChoreId);

    // Plant Whisperer: 3 plant chores done by user
    if (completedChore?.category === "plants") {
      const plantCompletions = allChores
        .filter((c) => c.category === "plants")
        .reduce(
          (sum, c) => sum + c.completions.filter((comp) => comp.completedBy === roommate.id).length,
          0
        );
      if (plantCompletions >= 3 && !badges.includes("plant-whisperer")) {
        badges.push("plant-whisperer");
        toast.success("🌿 Badge Unlocked: Plant Whisperer!", {
          description: "You've completed 3 plant-related chores!",
        });
      }
    }

    // Early Bird: 5 chores finished before due date
    const earlyCompletions = allChores.filter((c) =>
      c.completions.some((comp) => {
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

    // Streak Master: 7-day streak
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    const hasStreak = last7Days.every((day) =>
      allChores.some((c) =>
        c.completions.some(
          (comp) =>
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
  }

  /* ======= RENDER ======= */

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

          {/* Stats */}
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
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-sm text-slate-600 mb-1">Total Points</div>
              <div className="text-2xl text-slate-900">{currentRoommate?.totalPoints ?? 0}</div>
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

          {/* Frequency Tabs (simple buttons) */}
          <div className="bg-white rounded-xl p-1 border border-slate-200 inline-flex mb-4">
            <button
              onClick={() => setFrequencyTab("all")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                frequencyTab === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFrequencyTab("daily")}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                frequencyTab === "daily" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily
              {dailyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">{dailyCount}</span>
              )}
            </button>
            <button
              onClick={() => setFrequencyTab("weekly")}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                frequencyTab === "weekly" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly
              {weeklyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs">{weeklyCount}</span>
              )}
            </button>
            <button
              onClick={() => setFrequencyTab("monthly")}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                frequencyTab === "monthly" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
              {monthlyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs">{monthlyCount}</span>
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
            <button
              onClick={() => setIsSummaryOpen(true)}
              className="text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <span className="inline-flex items-center">
                <Sparkles className="h-4 w-4 mr-1" /> AI Summary
              </span>
            </button>
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <span className="inline-flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
              </span>
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="text-sm px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              <span className="inline-flex items-center">
                <Trophy className="h-4 w-4 mr-1 text-amber-600" /> Leaderboard
              </span>
            </button>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="text-sm px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <span className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-1" /> Add Chore
              </span>
            </button>
          </div>
        </div>

        {/* Chores List */}
        <div className="space-y-4">
          {filteredChores.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 mb-2">No chores found</h3>
              <p className="text-slate-600 mb-4">
                {statusTab === "mine" 
                  ? "You don't have any assigned chores right now." 
                  : statusTab === "overdue"
                  ? "No overdue chores! Great job keeping up."
                  : "No chores match your current filters."}
              </p>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <span className="inline-flex items-center">
                  <Plus className="h-4 w-4 mr-1" /> Add Your First Chore
                </span>
              </button>
            </div>
          ) : (
            filteredChores.map((chore) => {
              const assignedRoommates = roommates.filter((r) => chore.assignees.includes(r.id));
              const isOverdue = now && new Date(chore.dueDate) < now && !chore.completed;
              const isMine = chore.assignees.includes(currentUser);
              
              return (
                <div
                  key={chore.id}
                  onClick={() => setSelectedChore(chore)}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg text-slate-900 font-medium">{chore.title}</h3>
                        {chore.completed && (
                          <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            ✓ Completed
                          </div>
                        )}
                        {isOverdue && !chore.completed && (
                          <div className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            Overdue
                          </div>
                        )}
                        {isMine && (
                          <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            My Task
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 mb-3">{chore.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due {chore.dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat className="h-4 w-4" />
                          <span className="capitalize">{chore.frequency}</span>
                        </div>
                        {chore.points > 0 && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span>{chore.points} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <div className="flex -space-x-2">
                        {assignedRoommates.slice(0, 3).map((roommate, idx) => {
                          const color = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"][idx % 6];
                          const initial = roommate.name.charAt(0).toUpperCase();
                          return (
                            <div
                              key={roommate.id}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                              style={{ backgroundColor: color }}
                              title={roommate.name}
                            >
                              {initial}
                            </div>
                          );
                        })}
                        {assignedRoommates.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white">
                            +{assignedRoommates.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {chore.reactions.length > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          {Object.entries(
                            chore.reactions.reduce((acc, r) => {
                              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).slice(0, 3).map(([emoji, count]) => (
                            <span key={emoji} className="text-sm">
                              {emoji} {count > 1 && count}
                            </span>
                          ))}
                        </div>
                      )}
                      {chore.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <MessageCircle className="h-4 w-4" />
                          <span>{chore.comments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
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

        {/* Leaderboard */}
        <Leaderboard
          chores={chores}
          roommates={roommates}
          open={isLeaderboardOpen}
          onOpenChange={setIsLeaderboardOpen}
        />

        {/* Random Spinner */}
        <RandomSpinner
          chores={chores.filter((c) => !c.completed)}
          roommates={roommates}
          open={isSpinnerOpen}
          onOpenChange={setIsSpinnerOpen}
          onAssign={(choreId, roommateId) => {
            setChores((prev) =>
              prev.map((c) => (c.id === choreId ? { ...c, assignees: [roommateId] } : c))
            );
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

        {/* Toasts */}
        <Toaster position="top-right" />
      </div>
    </div>
  );
}
