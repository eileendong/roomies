import { useState } from "react";
import { Chore, Roommate } from "../App";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Sparkles } from "lucide-react";

interface RandomSpinnerProps {
  chores: Chore[];
  roommates: Roommate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (choreId: string, roommateId: string) => void;
}

export function RandomSpinner({ chores, roommates, open, onOpenChange, onAssign }: RandomSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);

  const handleSpin = () => {
    if (chores.length === 0 || roommates.length === 0) return;

    setIsSpinning(true);
    setSelectedChore(null);
    setSelectedRoommate(null);

    // Spin animation duration
    setTimeout(() => {
      const randomChore = chores[Math.floor(Math.random() * chores.length)];
      const randomRoommate = roommates[Math.floor(Math.random() * roommates.length)];
      
      setSelectedChore(randomChore);
      setSelectedRoommate(randomRoommate);
      setIsSpinning(false);
    }, 2000);
  };

  const handleAssign = () => {
    if (selectedChore && selectedRoommate) {
      onAssign(selectedChore.id, selectedRoommate.id);
      setSelectedChore(null);
      setSelectedRoommate(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shuffle className="h-6 w-6 text-pink-600" />
            Random Chore Assignment
          </DialogTitle>
          <DialogDescription>
            Let fate decide who does what! Spin the wheel for a random assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Spinner Display */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isSpinning ? (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                  className="text-6xl"
                >
                  🎲
                </motion.div>
              ) : selectedChore && selectedRoommate ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center w-full"
                >
                  <div className="mb-6">
                    <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-slate-900 mb-2">The wheel has decided!</h3>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-4 border-2 border-purple-200">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Avatar
                        className="h-16 w-16 border-4 border-white shadow-lg"
                        style={{ backgroundColor: selectedRoommate.color }}
                      >
                        <AvatarFallback className="text-white text-2xl">
                          {selectedRoommate.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-3xl">→</div>
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg px-4 py-3 flex-1">
                        <div className="text-sm text-slate-600 mb-1">Chore</div>
                        <div className="text-slate-900">{selectedChore.title}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-lg text-slate-900">{selectedRoommate.name}</span>
                      <span className="text-slate-600"> will do </span>
                      <span className="text-lg text-purple-600">"{selectedChore.title}"</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleAssign}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  >
                    Assign This Chore
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🎰</div>
                  <p className="text-slate-600 mb-4">
                    Ready to spin? Click the button below!
                  </p>
                  <Button
                    onClick={handleSpin}
                    disabled={chores.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  >
                    <Shuffle className="h-5 w-5 mr-2" />
                    Spin the Wheel!
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Text */}
          <div className="text-center text-sm text-slate-600">
            {chores.length === 0 ? (
              <p>No unassigned chores available to spin!</p>
            ) : (
              <p>
                {chores.length} pending chores · {roommates.length} roommates
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {!isSpinning && selectedChore && selectedRoommate && (
            <div className="flex gap-2">
              <Button
                onClick={handleSpin}
                variant="outline"
                className="flex-1"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Spin Again
              </Button>
              <Button
                onClick={() => {
                  setSelectedChore(null);
                  setSelectedRoommate(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
