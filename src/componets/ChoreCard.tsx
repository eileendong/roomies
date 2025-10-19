import { Chore, Roommate, ChoreStatus } from "../App";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Calendar, Zap } from "lucide-react";
import { motion } from "motion/react";

interface ChoreCardProps {
  chore: Chore;
  roommates: Roommate[];
  currentUser: string;
  onToggleComplete: (choreId: string) => void;
  onChoreClick: (chore: Chore) => void;
  onAddReaction: (choreId: string, emoji: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function getChoreStatus(chore: Chore): ChoreStatus {
  if (chore.completed) return "completed";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(chore.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due-today";
  return "pending";
}

function getStatusConfig(status: ChoreStatus) {
  switch (status) {
    case "completed":
      return { label: "Completed", className: "bg-green-100 text-green-700 border-0" };
    case "overdue":
      return { label: "Overdue", className: "bg-red-100 text-red-700 border-0" };
    case "due-today":
      return { label: "Due Today", className: "bg-orange-100 text-orange-700 border-0" };
    case "pending":
      return { label: "Pending", className: "bg-blue-100 text-blue-700 border-0" };
  }
}

function getAccentColor(status: ChoreStatus): string {
  switch (status) {
    case "overdue":
      return "#ef4444"; // red
    case "due-today":
      return "#f97316"; // orange
    case "pending":
      return "#3b82f6"; // blue
    case "completed":
      return "#10b981"; // green
    default:
      return "#64748b"; // slate
  }
}

export function ChoreCard({
  chore,
  roommates,
  currentUser,
  onToggleComplete,
  onChoreClick,
  onAddReaction,
  isFirst,
  isLast,
}: ChoreCardProps) {
  const status = getChoreStatus(chore);
  const statusConfig = getStatusConfig(status);
  const assignedRoommates = roommates.filter(r => chore.assignees.includes(r.id));
  const accentColor = getAccentColor(status);
  
  const dueDate = new Date(chore.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateCopy = new Date(dueDate);
  dueDateCopy.setHours(0, 0, 0, 0);
  const diffTime = dueDateCopy.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let dueDateText = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diffDays === 0) dueDateText = "Today";
  else if (diffDays === 1) dueDateText = "Tomorrow";
  else if (diffDays === -1) dueDateText = "Yesterday";
  else if (diffDays < -1) dueDateText = `${Math.abs(diffDays)} days ago`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-white border-l-4 hover:shadow-md transition-all cursor-pointer ${
        isFirst ? "rounded-t-xl border-t" : ""
      } ${isLast ? "rounded-b-xl border-b" : ""} ${
        !isFirst && !isLast ? "border-t" : ""
      } border-r border-slate-200`}
      style={{ borderLeftColor: accentColor }}
      onClick={() => onChoreClick(chore)}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Checkbox */}
        <Checkbox
          checked={chore.completed}
          onCheckedChange={() => onToggleComplete(chore.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`text-slate-900 mb-1 ${chore.completed ? 'line-through text-slate-500' : ''}`}>
            {chore.title}
          </h3>
          
          {/* Description */}
          {chore.description && (
            <p className="text-sm text-slate-500 mb-3">
              {chore.description}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Due Date */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">{dueDateText}</span>
            </div>
            
            {/* Points */}
            {chore.points > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-700">
                <Zap className="h-3.5 w-3.5 fill-amber-600" />
                <span className="text-sm">{chore.points} pts</span>
              </div>
            )}
            
            {/* Frequency */}
            {chore.frequency !== "once" && (
              <span className="text-sm text-slate-600 capitalize">{chore.frequency}</span>
            )}
          </div>

          {/* Assignees */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex -space-x-2">
              {assignedRoommates.map((roommate) => (
                <Avatar
                  key={roommate.id}
                  className="h-7 w-7 border-2 border-white"
                  style={{ backgroundColor: roommate.color }}
                >
                  <AvatarFallback className="text-white text-xs">
                    {roommate.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={statusConfig.className}>
          {statusConfig.label}
        </Badge>
      </div>
    </motion.div>
  );
}
