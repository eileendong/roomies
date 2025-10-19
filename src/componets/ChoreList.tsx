import { ChoreCard } from "./ChoreCard";
import { Chore, Roommate } from "../App";

interface ChoreListProps {
  chores: Chore[];
  roommates: Roommate[];
  currentUser: string;
  onToggleComplete: (choreId: string) => void;
  onChoreClick: (chore: Chore) => void;
  onAddReaction: (choreId: string, emoji: string) => void;
}

export function ChoreList({
  chores,
  roommates,
  currentUser,
  onToggleComplete,
  onChoreClick,
  onAddReaction,
}: ChoreListProps) {
  if (chores.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-slate-400 text-6xl mb-4">✨</div>
        <h3 className="text-slate-600 mb-2">No chores found</h3>
        <p className="text-slate-500">All caught up or add a new chore to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {chores.map((chore, index) => (
        <ChoreCard
          key={chore.id}
          chore={chore}
          roommates={roommates}
          currentUser={currentUser}
          onToggleComplete={onToggleComplete}
          onChoreClick={onChoreClick}
          onAddReaction={onAddReaction}
          isFirst={index === 0}
          isLast={index === chores.length - 1}
        />
      ))}
      {chores.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No chores found. Add one to get started!
        </div>
      )}
    </div>
  );
}
