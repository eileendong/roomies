import { Chore, Roommate } from "../App";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Sparkles, TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";

interface WeeklySummaryProps {
  chores: Chore[];
  roommates: Roommate[];
  currentUser: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeeklySummary({ chores, roommates, currentUser, open, onOpenChange }: WeeklySummaryProps) {
  const currentRoommate = roommates.find(r => r.id === currentUser);
  
  if (!currentRoommate) return null;

  // Calculate weekly stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const myChores = chores.filter(c => c.assignees.includes(currentUser));
  const myCompletions = chores.filter(c => 
    c.completions.some(comp => {
      const compDate = new Date(comp.completedAt);
      return compDate >= oneWeekAgo && comp.completedBy === currentUser;
    })
  );

  const completionRate = myChores.length > 0 ? (myCompletions.length / myChores.length) * 100 : 0;
  
  // Calculate category breakdown
  const categoryStats: Record<string, { completed: number; total: number }> = {};
  myChores.forEach(chore => {
    if (chore.category) {
      if (!categoryStats[chore.category]) {
        categoryStats[chore.category] = { completed: 0, total: 0 };
      }
      categoryStats[chore.category].total++;
      if (myCompletions.find(c => c.id === chore.id)) {
        categoryStats[chore.category].completed++;
      }
    }
  });

  // Find weak spots (categories with low completion)
  const weakSpots = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.total > 0 && (stats.completed / stats.total) < 0.5)
    .map(([category]) => category);

  // Find strengths (categories with high completion)
  const strengths = Object.entries(categoryStats)
    .filter(([_, stats]) => stats.total > 0 && (stats.completed / stats.total) >= 0.8)
    .map(([category]) => category);

  // AI-generated insights
  const insights = generateInsights(completionRate, weakSpots, strengths, myCompletions.length, currentRoommate);

  // Points earned this week
  const pointsThisWeek = myCompletions.reduce((sum, chore) => {
    const weeklyComps = chore.completions.filter(comp => {
      const compDate = new Date(comp.completedAt);
      return compDate >= oneWeekAgo && comp.completedBy === currentUser;
    });
    return sum + weeklyComps.reduce((s, c) => s + c.points, 0);
  }, 0);

  // Compare to team average
  const teamCompletions = roommates.map(rm => {
    return chores.filter(c => 
      c.completions.some(comp => {
        const compDate = new Date(comp.completedAt);
        return compDate >= oneWeekAgo && comp.completedBy === rm.id;
      })
    ).length;
  });
  const teamAverage = teamCompletions.reduce((a, b) => a + b, 0) / teamCompletions.length;
  const comparisonToTeam = myCompletions.length - teamAverage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Weekly Summary
          </DialogTitle>
          <DialogDescription>
            AI-powered insights on your performance this week
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Performance */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl mb-1">{Math.round(completionRate)}%</h3>
                <p className="text-sm opacity-90">Completion Rate</p>
              </div>
              <div className="text-right">
                <div className="text-2xl mb-1">{myCompletions.length}</div>
                <p className="text-sm opacity-90">Chores Done</p>
              </div>
            </div>
            <Progress value={completionRate} className="h-2 bg-white/20" />
          </div>

          {/* AI Insights */}
          <div className="space-y-3">
            <h3 className="text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Insights
            </h3>
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  insight.type === "success"
                    ? "bg-green-50 border-green-200"
                    : insight.type === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-slate-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-slate-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Stats Breakdown */}
          <div>
            <h3 className="text-slate-900 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700 capitalize">{category}</span>
                      <span className="text-sm text-slate-600">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Team Comparison */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-900 mb-1">Team Comparison</h4>
                <p className="text-sm text-slate-600">
                  {comparisonToTeam > 0 ? (
                    <>
                      <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
                      You completed {Math.abs(Math.round(comparisonToTeam))} more chores than team average
                    </>
                  ) : comparisonToTeam < 0 ? (
                    <>
                      <TrendingDown className="inline h-4 w-4 text-orange-600 mr-1" />
                      You completed {Math.abs(Math.round(comparisonToTeam))} fewer chores than team average
                    </>
                  ) : (
                    <>You're right on par with the team average</>
                  )}
                </p>
              </div>
              {comparisonToTeam > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <Award className="h-3 w-3 mr-1" />
                  Above Average
                </Badge>
              )}
            </div>
          </div>

          {/* Points Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <div className="text-2xl text-amber-600 mb-1">+{pointsThisWeek}</div>
              <div className="text-sm text-slate-600">Points This Week</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="text-2xl text-purple-600 mb-1">Lv. {currentRoommate.level}</div>
              <div className="text-sm text-slate-600">Current Level</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateInsights(
  completionRate: number,
  weakSpots: string[],
  strengths: string[],
  completions: number,
  roommate: Roommate
): Array<{ type: "success" | "warning" | "info"; icon: string; title: string; description: string }> {
  const insights: Array<{ type: "success" | "warning" | "info"; icon: string; title: string; description: string }> = [];

  // Overall performance
  if (completionRate >= 80) {
    insights.push({
      type: "success",
      icon: "🎉",
      title: "Excellent Performance!",
      description: `You completed ${Math.round(completionRate)}% of your chores this week. You're crushing it!`,
    });
  } else if (completionRate >= 50) {
    insights.push({
      type: "info",
      icon: "👍",
      title: "Good Progress",
      description: `You completed ${Math.round(completionRate)}% of your chores. There's room for improvement, but you're doing well!`,
    });
  } else {
    insights.push({
      type: "warning",
      icon: "⚠️",
      title: "Need to Catch Up",
      description: `You only completed ${Math.round(completionRate)}% of your chores this week. Let's get back on track!`,
    });
  }

  // Weak spots
  if (weakSpots.length > 0) {
    insights.push({
      type: "warning",
      icon: "📊",
      title: "Areas for Improvement",
      description: `${weakSpots.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")} ${weakSpots.length === 1 ? "is" : "are"} your weak ${weakSpots.length === 1 ? "spot" : "spots"}. Focus on these categories next week!`,
    });
  }

  // Strengths
  if (strengths.length > 0) {
    insights.push({
      type: "success",
      icon: "⭐",
      title: "Your Strengths",
      description: `You're excelling at ${strengths.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}! Keep up the great work in ${strengths.length === 1 ? "this area" : "these areas"}.`,
    });
  }

  // Streak suggestion
  if (completions > 0) {
    insights.push({
      type: "info",
      icon: "🔥",
      title: "Consistency Tip",
      description: "Try to complete at least one chore every day to build a streak and earn the Streak Master badge!",
    });
  }

  // Level up motivation
  const pointsToNextLevel = (roommate.level * 100) - roommate.totalPoints;
  if (pointsToNextLevel <= 50) {
    insights.push({
      type: "info",
      icon: "🎯",
      title: "Almost There!",
      description: `You're only ${pointsToNextLevel} points away from level ${roommate.level + 1}! Keep going!`,
    });
  }

  return insights;
}
