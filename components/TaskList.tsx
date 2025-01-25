"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface Task {
  id: string;
  content: string;
  done: boolean;
}

interface taskList {
  task: Task;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="flex items-center justify-between py-2 px-4 mb-2 bg-secondary rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={task.done}
          onCheckedChange={() => onToggle(task.id)}
          className="border-primary"
        />
        <span
          className={`text-sm ${
            task.done ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.content}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(task.id)}
        className="text-destructive hover:text-destructive/90"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
