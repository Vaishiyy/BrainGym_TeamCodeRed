import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameHeaderProps {
  title: string;
}

export function GameHeader({ title }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b-[3px] border-foreground px-6 py-3">
      <h1 className="font-display font-bold text-lg">{title}</h1>
      <Dialog>
        <DialogTrigger asChild>
          <button className="font-display text-xs font-bold border-[2px] border-foreground rounded-full px-4 py-1 hover:bg-foreground hover:text-background transition-colors">
            HOW TO PLAY?
          </button>
        </DialogTrigger>
        <DialogContent className="bg-card border-[3px] border-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">How to Play</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 font-body text-sm">
            <p>Slide the numbered tiles to arrange them in order from <strong>1</strong> to <strong>N</strong>.</p>
            <p>Click a tile adjacent to the empty space to slide it.</p>
            <p>Tiles with a <span className="text-accent font-bold">blue border</span> are in the correct position.</p>
            <p>Complete each puzzle to unlock the next level with a bigger grid!</p>
            <div className="pt-2 text-muted-foreground text-xs">
              <p>Level 1: 8-puzzle (3×3)</p>
              <p>Level 2: 15-puzzle (4×4)</p>
              <p>Level 3: 24-puzzle (5×5)</p>
              <p>...and so on!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
