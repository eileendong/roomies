import { Chore, Roommate } from "../App";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Trophy, Zap, CheckCircle2, TrendingUp, Award, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardProps {
  chores: Chore[];
  roommates: Roommate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoommateStats {
  roommate: Roommate;
  totalPoints: number;
  completions: number;
  thisWeekPoints: number;
  thisWeekCompletions: number;
}

export function Leaderboard({ chores, roommates, open, onOpenChange }: LeaderboardProps) {
  // Calculate stats for each roommate
  const stats: RoommateStats[] = roommates.map((roommate) => {
    let totalPoints = 0;
    let completions = 0;
    let thisWeekPoints = 0;
    let thisWeekCompletions = 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    chores.forEach((chore) => {
      chore.completions.forEach((completion) => {
        if (completion.completedBy === roommate.id) {
          totalPoints += completion.points;
          completions += 1;

          const completedDate = new Date(completion.completedAt);
          if (completedDate >= oneWeekAgo) {
            thisWeekPoints += completion.points;
            thisWeekCompletions += 1;
          }
        }
      });
    });

    return {
      roommate,
      totalPoints,
      completions,
      thisWeekPoints,
      thisWeekCompletions,
    };
  });

  // Sort by total points
  const sortedStats = [...stats].sort((a, b) => b.totalPoints - a.totalPoints);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const getTopPerformer = () => {
    const sorted = [...stats].sort((a, b) => b.thisWeekPoints - a.thisWeekPoints);
    return sorted[0];
  };

  const topPerformer = getTopPerformer();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Leaderboard
          </DialogTitle>
          <DialogDescription>
            See who's crushing it with chores this week
          </DialogDescription>
        </DialogHeader>

        {/* Top Performer Highlight */}
        {topPerformer && topPerformer.thisWeekPoints > 0 && (
          <>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    className="h-16 w-16 border-4 border-yellow-400"
                    style={{ backgroundColor: topPerformer.roommate.color }}
                  >
                    <AvatarFallback className="text-white text-xl">
                      {topPerformer.roommate.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 text-2xl">👑</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-slate-900">{topPerformer.roommate.name}</h3>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Top Performer
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {topPerformer.thisWeekCompletions} chores completed this week
                  </p>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Zap className="h-4 w-4 fill-amber-600" />
                    <span className="text-sm">{topPerformer.thisWeekPoints} points this week</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* All-Time Rankings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h3 className="text-slate-900">All-Time Rankings</h3>
          </div>

          <div className="space-y-3">
            {sortedStats.map((stat, index) => {
              const medal = getMedalEmoji(index);
              const progressToNextLevel = ((stat.roommate.totalPoints % 100) / 100) * 100;
              
              return (
                <motion.div
                  key={stat.roommate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      index === 0
                        ? 'border-yellow-300 bg-yellow-50'
                        : index === 1
                        ? 'border-slate-300 bg-slate-50'
                        : index === 2
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-lg text-slate-600">#{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar with Progress Ring */}
                    <div className="relative flex-shrink-0">
                      {/* Progress Ring SVG */}
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e2e8f0"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={stat.roommate.color}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(progressToNextLevel / 100) * 175.93} 175.93`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <Avatar
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12"
                        style={{ backgroundColor: stat.roommate.color }}
                      >
                        <AvatarFallback className="text-white">
                          {stat.roommate.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 border-2 border-slate-200 text-xs"
                        style={{ color: stat.roommate.color }}
                      >
                        L{stat.roommate.level}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-slate-900">{stat.roommate.name}</h4>
                        {stat.roommate.badges.length > 0 && (
                          <div className="flex gap-1">
                            {stat.roommate.badges.slice(0, 3).map((badge, i) => {
                              const badgeEmojis: Record<string, string> = {
                                "plant-whisperer": "🌿",
                                "early-bird": "🌅",
                                "streak-master": "🔥",
                                "clean-freak": "✨",
                                "team-player": "🤝",
                                "newbie": "🌟"
                              };
                              return (
                                <div key={i} className="text-sm" title={badge}>
                                  {badgeEmojis[badge] || "🏆"}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{stat.completions} chores</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Zap className="h-3.5 w-3.5 fill-amber-600 text-amber-600" />
                          <span>{stat.totalPoints} pts</span>
                        </div>
                        {stat.thisWeekCompletions > 0 && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>+{stat.thisWeekPoints} this week</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Level {stat.roommate.level}</span>
                          <span>{Math.floor(progressToNextLevel)}%</span>
                        </div>
                        <Progress value={progressToNextLevel} className="h-1.5" />
                      </div>
                    </div>

                    {/* Badges */}
                    {stat.roommate.badges.length > 0 && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
                        <Award className="h-3.5 w-3.5 text-purple-600" />
                        <span className="text-sm text-purple-700">{stat.roommate.badges.length}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <Separator />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl mb-1">
              {chores.reduce((sum, chore) => sum + chore.completions.length, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Completions</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl mb-1 text-amber-600">
              {stats.reduce((sum, stat) => sum + stat.totalPoints, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Points</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-1 text-purple-600">
              {stats.reduce((sum, stat) => sum + stat.thisWeekPoints, 0)}
            </div>
            <div className="text-sm text-slate-600">This Week</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
