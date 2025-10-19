import { Chore, Roommate } from "../App";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import {
  Calendar,
  Repeat,
  Zap,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { motion } from "motion/react";

interface ChoreDetailDrawerProps {
  chore: Chore;
  roommates: Roommate[];
  currentUser: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleComplete: (choreId: string) => void;
  onDelete: (choreId: string) => void;
  onAddReaction: (choreId: string, emoji: string) => void;
  onAddComment: (choreId: string, text: string) => void;
}

const reactionEmojis = ["👍", "🎉", "💪", "✨", "🔥", "❤️", "🌿", "😊"];

export function ChoreDetailDrawer({
  chore,
  roommates,
  currentUser,
  open,
  onOpenChange,
  onToggleComplete,
  onDelete,
  onAddReaction,
  onAddComment,
}: ChoreDetailDrawerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentText, setCommentText] = useState("");
  const assignedRoommates = roommates.filter(r => chore.assignees.includes(r.id));
  
  // Get unique reactions with counts
  const reactionCounts = chore.reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userReactions = chore.reactions.filter(r => r.userId === currentUser).map(r => r.emoji);

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(chore.id, commentText.trim());
      setCommentText("");
    }
  };
  
  const handleDelete = () => {
    onDelete(chore.id);
    setShowDeleteDialog(false);
  };

  const getRotationRoommates = () => {
    if (!chore.rotationOrder) return [];
    return chore.rotationOrder.map(id => roommates.find(r => r.id === id)).filter(Boolean) as Roommate[];
  };

  const rotationRoommates = getRotationRoommates();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">{chore.title}</SheetTitle>
            <SheetDescription>
              {chore.description || "No description provided"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => onToggleComplete(chore.id)}
                className={`flex-1 ${
                  chore.completed
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {chore.completed ? "Mark Incomplete" : "Mark Complete"}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Details Section */}
            <div className="space-y-4">
              <h3 className="text-slate-900">Details</h3>
              
              {/* Assigned To */}
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-slate-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-2">Assigned to</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedRoommates.map((roommate) => (
                      <div
                        key={roommate.id}
                        className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5"
                      >
                        <Avatar
                          className="h-6 w-6"
                          style={{ backgroundColor: roommate.color }}
                        >
                          <AvatarFallback className="text-white text-xs">
                            {roommate.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-900">{roommate.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Due date</p>
                  <p className="text-slate-900">
                    {new Date(chore.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Frequency */}
              <div className="flex items-start gap-3">
                <Repeat className="h-5 w-5 text-slate-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Frequency</p>
                  <p className="text-slate-900 capitalize">{chore.frequency}</p>
                </div>
              </div>

              {/* Points */}
              {chore.points > 0 && (
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5 fill-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Points</p>
                    <p className="text-slate-900">{chore.points} points per completion</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rotation Order */}
            {rotationRoommates.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <h3 className="text-slate-900">Rotation Order</h3>
                  </div>
                  <div className="space-y-2">
                    {rotationRoommates.map((roommate, index) => (
                      <div
                        key={roommate.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                          index === 0
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <span className="text-sm text-slate-600 w-6">{index + 1}.</span>
                        <Avatar
                          className="h-8 w-8"
                          style={{ backgroundColor: roommate.color }}
                        >
                          <AvatarFallback className="text-white">
                            {roommate.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-900">{roommate.name}</span>
                        {index === 0 && (
                          <Badge className="ml-auto bg-purple-100 text-purple-700 border-purple-200">
                            Current
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">
                    The chore will automatically rotate to the next person after completion
                  </p>
                </div>
              </>
            )}

            {/* Reactions */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-slate-900">Reactions</h3>
              <div className="flex flex-wrap gap-2">
                {reactionEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    className={`text-2xl p-3 rounded-lg border-2 transition-all ${
                      userReactions.includes(emoji)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddReaction(chore.id, emoji)}
                  >
                    {emoji}
                    {reactionCounts[emoji] && (
                      <span className="ml-1 text-xs text-slate-600">
                        {reactionCounts[emoji]}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <h3 className="text-slate-900">Comments</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {chore.comments.length}
                </Badge>
              </div>

              {/* Comment Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Comments List */}
              {chore.comments.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {[...chore.comments].reverse().map((comment) => {
                    const commenter = roommates.find(r => r.id === comment.userId);
                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-3 rounded-lg bg-slate-50"
                      >
                        {commenter && (
                          <Avatar
                            className="h-8 w-8 flex-shrink-0"
                            style={{ backgroundColor: commenter.color }}
                          >
                            <AvatarFallback className="text-white text-xs">
                              {commenter.avatar}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-slate-900">
                              {commenter?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{comment.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completion History */}
            {chore.completions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-500" />
                      <h3 className="text-slate-900">Completion History</h3>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {chore.completions.length} completions
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[...chore.completions].reverse().map((completion) => {
                      const completedBy = roommates.find(r => r.id === completion.completedBy);
                      return (
                        <div
                          key={completion.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                        >
                          {completedBy && (
                            <Avatar
                              className="h-8 w-8"
                              style={{ backgroundColor: completedBy.color }}
                            >
                              <AvatarFallback className="text-white text-xs">
                                {completedBy.avatar}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900">
                              {completedBy?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-600">
                              {new Date(completion.completedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-600">
                            <Zap className="h-3.5 w-3.5 fill-amber-600" />
                            <span className="text-sm">+{completion.points}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chore</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chore.title}"? This action cannot be undone
              and all completion history will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
