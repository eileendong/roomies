import { useId, useState } from "react";
import type { Chore, Frequency, Roommate } from "../App";
import { Calendar as CalendarIcon } from "lucide-react";
import React from "react";
import type { JSX } from "react";



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
}: AddChoreDialogProps): JSX.Element | null {
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

  // Accessible ids for the dialog title/description
  const titleId = useId();
  const descId = useId();
  const assigneesGroupId = useId();

  const toggleAssignee = (roommateId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(roommateId)
        ? prev.filter((id) => id !== roommateId)
        : [...prev, roommateId]
    );
  };

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
      dueDate, // if your model prefers string: use dueDateStr
      assignees: selectedAssignees,
      points: Number.isNaN(parseInt(points, 10)) ? 0 : parseInt(points, 10),
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

  if (!open) return null;

  const badgeColors = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop as a real button for a11y */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      {/* dialog */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="mb-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            Add New Chore
          </h2>
          <p id={descId} className="text-slate-600 text-sm">
            Create a new household task and assign it to roommates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="chore-title" className="text-sm font-medium text-slate-700">
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="chore-title"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Take out trash"
              required
              aria-required="true"
              aria-invalid={!title ? "true" : "false"}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="chore-desc" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="chore-desc"
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
              <label htmlFor="chore-category" className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="chore-category"
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
              <label htmlFor="chore-frequency" className="text-sm font-medium text-slate-700">
                Frequency
              </label>
              <select
                id="chore-frequency"
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
              <label htmlFor="chore-due" className="text-sm font-medium text-slate-700">
                Due Date <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <CalendarIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </span>
                <input
                  id="chore-due"
                  type="date"
                  className="w-full rounded border border-slate-300 pl-9 pr-3 py-2 text-sm"
                  value={dueDateStr}
                  onChange={(e) => setDueDateStr(e.target.value)}
                  required
                  aria-required="true"
                  aria-invalid={!dueDateStr ? "true" : "false"}
                />
              </div>
            </div>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <label htmlFor="chore-points" className="text-sm font-medium text-slate-700">
              Points (optional)
            </label>
            <input
              id="chore-points"
              type="number"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="10"
              min={0}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <div id={assigneesGroupId} className="text-sm font-medium text-slate-700">
              Assign To <span aria-hidden="true">*</span>
            </div>
            <div
              role="group"
              aria-labelledby={assigneesGroupId}
              aria-required="true"
              aria-invalid={selectedAssignees.length === 0 ? "true" : "false"}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {roommates.map((roommate, idx) => {
                const selected = selectedAssignees.includes(roommate.id);
                const initial =
                  (roommate.name ?? "?").trim().charAt(0).toUpperCase() || "?";
                const color = badgeColors[idx % badgeColors.length];

                return (
                  <button
                    key={roommate.id}
                    type="button"
                    onClick={() => toggleAssignee(roommate.id)}
                    role="checkbox"
                    aria-checked={selected}
                    aria-label={`Assign ${roommate.name}`}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: color }}
                      title={roommate.name}
                    >
                      {initial}
                    </div>
                    <span className="text-slate-900">{roommate.name}</span>
                    {selected && (
                      <span
                        className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
                        aria-hidden="true"
                      >
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
