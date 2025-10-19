import { useState } from "react";
import { Chore, Frequency, Roommate } from "../App";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface AddChoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roommates: Roommate[];
  onAddChore: (chore: Omit<Chore, "id" | "completed" | "completions">) => void;
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
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [points, setPoints] = useState("10");
  const [enableRotation, setEnableRotation] = useState(false);
  const [category, setCategory] = useState("cleaning");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || selectedAssignees.length === 0) {
      return;
    }

    const newChore: Omit<Chore, "id" | "completed" | "completions" | "reactions" | "comments"> = {
      title,
      description,
      frequency,
      dueDate,
      assignees: selectedAssignees,
      points: parseInt(points) || 0,
      rotationOrder: enableRotation && selectedAssignees.length > 1 ? selectedAssignees : undefined,
      category,
    };

    onAddChore(newChore);
    
    // Reset form
    setTitle("");
    setDescription("");
    setFrequency("once");
    setDueDate(new Date());
    setSelectedAssignees([]);
    setPoints("10");
    setEnableRotation(false);
    setCategory("cleaning");
    onOpenChange(false);
  };

  const toggleAssignee = (roommateId: string) => {
    setSelectedAssignees(prev => {
      if (prev.includes(roommateId)) {
        return prev.filter(id => id !== roommateId);
      }
      return [...prev, roommateId];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
          <DialogDescription>
            Create a new household task and assign it to roommates
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Take out trash"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this chore..."
              rows={3}
            />
          </div>

          {/* Category, Frequency and Due Date */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="plants">Plants</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Points */}
          <div className="space-y-2">
            <Label htmlFor="points">Points (optional)</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="10"
              min="0"
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label>Assign To *</Label>
            <div className="grid grid-cols-2 gap-2">
              {roommates.map((roommate) => (
                <button
                  key={roommate.id}
                  type="button"
                  onClick={() => toggleAssignee(roommate.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedAssignees.includes(roommate.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Avatar
                    className="h-8 w-8"
                    style={{ backgroundColor: roommate.color }}
                  >
                    <AvatarFallback className="text-white">
                      {roommate.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-slate-900">{roommate.name}</span>
                  {selectedAssignees.includes(roommate.id) && (
                    <div className="ml-auto">
                      <div className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation Toggle */}
          {frequency !== "once" && selectedAssignees.length > 1 && (
            <div className="space-y-2">
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
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              disabled={!title || selectedAssignees.length === 0}
            >
              Add Chore
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
