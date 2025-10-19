import { useState } from "react";
import type { Chore, Frequency, Roommate } from "../App"; // type-only to avoid runtime import cycle
import { Calendar as CalendarIcon } from "lucide-react";

interface AddChoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roommates: Roommate[];
  onAddChore: (
    chore: Omit<Chore, "id" | "completed" | "completions" | "reactions" | "comments">
  ) => void;
}

export function AddChoreDialog({
  open,
  onOpenChange,
  roommates,
  onAddChore,
}: AddChoreDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [dueDateStr, setDueDateStr] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [points, setPoints] = useState("10");
  const [enableRotation, setEnableRotation] = useState(false);
  const [category, setCategory] = useState("cleaning");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || selectedAssignees.length === 0 || !dueDateStr) return;

    const dueDate = new Date(dueDateStr);

    const newChore: Omit<
      Chore,
      "id" | "completed" | "completions" | "reactions" | "comments"
    > = {
      title,
      description,
      frequency,
      dueDate,
      assignees: selectedAssignees,
      points: parseInt(points || "0", 10),
      rotationOrder:
        frequency !== "once" && selectedAssignees.length > 1 && enableRotation
          ? selectedAssignees
          : undefined,
      category,
    };

    onAddChore(newChore);

    // Reset
    setTitle("");
    setDescription("");
    setFrequency("once");
    setDueDateStr(new Date().toISOString().slice(0, 10));
    setSelectedAssignees([]);
    setPoints("10");
    setEnableRotation(false);
    setCategory("cleaning");
    onOpenChange(false);
  };

  const toggleAssignee = (roommateId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(roommateId)
        ? prev.filter((id) => id !== roommateId)
        : [...prev, roommateId]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      {/* dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Add New Chore</h2>
          <p className="text-slate-600 text-sm">
            Create a new household task and assign it to roommates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title *
            </label>
            <input
              id="title"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Take out trash"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this chore..."
              rows={3}
            />
          </div>

          {/* Category / Frequency / Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="category"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="cleaning">Cleaning</option>
                <option value="kitchen">Kitchen</option>
                <option value="plants">Plants</option>
                <option value="shopping">Shopping</option>
                
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="frequency" className="text-sm font-medium text-slate-700">
                Frequency
              </label>
              <select
                id="frequency"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="due" className="text-sm font-medium text-slate-700">
                Due Date *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  id="due"
                  type="date"
                  className="w-full rounded border border-slate-300 pl-9 pr-3 py-2 text-sm"
                  value={dueDateStr}
                  onChange={(e) => setDueDateStr(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <label htmlFor="points" className="text-sm font-medium text-slate-700">
              Points (optional)
            </label>
            <input
              id="points"
              type="number"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="10"
              min={0}
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Assign To *</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roommates.map((roommate) => {
                const selected = selectedAssignees.includes(roommate.id);
                return (
                  <button
                    key={roommate.id}
                    type="button"
                    onClick={() => toggleAssignee(roommate.id)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: roommate.color }}
                      title={roommate.name}
                    >
                      {roommate.avatar}
                    </div>
                    <span className="text-slate-900">{roommate.name}</span>
                    {selected && (
                      <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rotation Toggle */}
          {frequency !== "once" && selectedAssignees.length > 1 && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableRotation}
                onChange={(e) => setEnableRotation(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                Enable automatic rotation (assign to next person after completion)
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              className="rounded border px-3 py-2 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title || selectedAssignees.length === 0}
              className="rounded bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Chore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
