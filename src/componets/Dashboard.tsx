import { Chore, Roommate } from "../App";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar, TrendingUp, Zap, Award, Target, Flame } from "lucide-react";

interface DashboardProps {
  chores: Chore[];
  roommates: Roommate[];
  currentUser: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const badgeInfo: Record<string, { emoji: string; label: string; description: string }> = {
  "plant-whisperer": { emoji: "🌿", label: "Plant Whisperer", description: "Completed 3+ plant chores" },
  "early-bird": { emoji: "🌅", label: "Early Bird", description: "5 chores done early" },
  "streak-master": { emoji: "🔥", label: "Streak Master", description: "7-day completion streak" },
  "clean-freak": { emoji: "✨", label: "Clean Freak", description: "Master of cleanliness" },
  "team-player": { emoji: "🤝", label: "Team Player", description: "Helps teammates often" },
  "newbie": { emoji: "🌟", label: "Newbie", description: "Welcome aboard!" },
};

export function Dashboard({ chores, roommates, currentUser, open, onOpenChange }: DashboardProps) {
  const currentRoommate = roommates.find(r => r.id === currentUser);
  
  if (!currentRoommate) return null;

  // Calculate weekly completion rate
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const thisWeekChores = chores.filter(c => {
    const dueDate = new Date(c.dueDate);
    return dueDate >= oneWeekAgo;
  });

  const completedThisWeek = thisWeekChores.filter(c => 
    c.completions.some(comp => {
      const compDate = new Date(comp.completedAt);
      return compDate >= oneWeekAgo && comp.completedBy === currentUser;
    })
  ).length;

  const myChoresThisWeek = thisWeekChores.filter(c => c.assignees.includes(currentUser)).length;
  const completionRate = myChoresThisWeek > 0 ? (completedThisWeek / myChoresThisWeek) * 100 : 0;

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

  // Heatmap data for last 30 days
  const heatmapData = last30Days.reverse().map((day, index) => {
    const completions = chores.filter(c => 
      c.completions.some(comp => 
        comp.completedBy === currentUser && 
        new Date(comp.completedAt).toDateString() === day
      )
    ).length;
    
    return {
      day: new Date(day).getDate(),
      completions,
      date: day,
    };
  });

  // Points by category
  const categoryData: Record<string, number> = {};
  chores.forEach(chore => {
    if (chore.category) {
      chore.completions.forEach(comp => {
        if (comp.completedBy === currentUser) {
          categoryData[chore.category] = (categoryData[chore.category] || 0) + comp.points;
        }
      });
    }
  });

  const chartData = Object.entries(categoryData).map(([category, points]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    points,
  }));

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

  // Next level progress
  const pointsToNextLevel = (currentRoommate.level * 100) - currentRoommate.totalPoints;
  const progressToNextLevel = ((currentRoommate.totalPoints % 100) / 100) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Your Dashboard
          </DialogTitle>
          <DialogDescription>
            Track your progress and achievements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    className="h-20 w-20 border-4 border-white"
                    style={{ backgroundColor: currentRoommate.color }}
                  >
                    <AvatarFallback className="text-white text-2xl">
                      {currentRoommate.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-2 py-1 text-xs text-purple-600">
                    Lv. {currentRoommate.level}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl mb-1">{currentRoommate.name}</h2>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                    <span>{currentRoommate.totalPoints} total points</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Next Level</div>
                <div className="text-2xl">{pointsToNextLevel} pts</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progressToNextLevel} className="h-3 bg-white/20" />
              <p className="text-sm mt-2 opacity-90">
                {Math.floor(progressToNextLevel)}% to level {currentRoommate.level + 1}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-600">Completion Rate</span>
              </div>
              <div className="text-2xl text-green-600">{Math.round(completionRate)}%</div>
              <p className="text-xs text-slate-500 mt-1">This week</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-slate-600">Current Streak</span>
              </div>
              <div className="text-2xl text-orange-600">{currentStreak}</div>
              <p className="text-xs text-slate-500 mt-1">Days in a row</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-600">This Week</span>
              </div>
              <div className="text-2xl text-blue-600">{completedThisWeek}</div>
              <p className="text-xs text-slate-500 mt-1">Chores completed</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-slate-600">Badges</span>
              </div>
              <div className="text-2xl text-purple-600">{currentRoommate.badges.length}</div>
              <p className="text-xs text-slate-500 mt-1">Unlocked</p>
            </div>
          </div>

          {/* Badges */}
          {currentRoommate.badges.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Your Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentRoommate.badges.map((badgeId) => {
                    const badge = badgeInfo[badgeId];
                    return (
                      <div
                        key={badgeId}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 text-center"
                      >
                        <div className="text-4xl mb-2">{badge?.emoji || "🏆"}</div>
                        <div className="text-sm text-slate-900 mb-1">{badge?.label || badgeId}</div>
                        <div className="text-xs text-slate-600">{badge?.description || ""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Points by Category Chart */}
          {chartData.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-slate-900 mb-4">Points by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Activity Heatmap */}
          <Separator />
          <div>
            <h3 className="text-slate-900 mb-4">Last 30 Days Activity</h3>
            <div className="grid grid-cols-10 gap-1">
              {heatmapData.map((day, index) => {
                const intensity = Math.min(day.completions / 3, 1);
                return (
                  <div
                    key={index}
                    className="aspect-square rounded"
                    style={{
                      backgroundColor: intensity === 0 
                        ? "#e2e8f0" 
                        : `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`,
                    }}
                    title={`${day.completions} completions on ${day.date}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
