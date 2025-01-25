"use client";

import { TaskItem } from "@/components/TaskList";
import { TodoTool } from "@/lib/tools";
import { generateId } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import Image from "next/image";

type Todo = {
  id: string;
  content: string;
  done: boolean;
};

export default function Chat() {
  const [todos, setTodos] = useState<Todo[]>([
    { content: "Learn how to use the AI SDK", done: false, id: generateId() },
    { content: "Buy Milk", done: false, id: generateId() },
    { content: "Learn how to use the AI SDK", done: false, id: generateId() },
  ]);

  const toggleTask = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const removeTask = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    body: { todos },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "todo") {
        const { type, content, id } = toolCall.args as TodoTool;

        if (type === "add") {
          const newTodo = { id: generateId(), content, done: false };
          setTodos((prevTodos) => [...prevTodos, newTodo]);
          return newTodo;
        }

        if (type === "mark-down" || type === "update") {
          let updatedTodo = todos.find((todo) => todo.id === id);
          if (!updatedTodo) return "No todo found with that id";
          updatedTodo =
            type === "mark-down"
              ? { ...updatedTodo, done: true }
              : {
                  ...updatedTodo,
                  content,
                };
          setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
          );
          return updatedTodo;
        }
      }
    },
    maxSteps: 3,
  });
  if (error) return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;

  return (
    <div className="flex w-full h-screen">
      <div
        id="left"
        className="w-1/2 relative border-l border-zinc-200 shadow-sm"
      >
        <div className="space-y-4 px-8 lg:px-16 py-8 overflow-y-scroll h-full">
          {messages.map((m) => {
            if (m.toolInvocations) {
              const { state: toolState, toolName } = m.toolInvocations[0];
              if (toolState === "result") return null;
              else
                return (
                  <div key={m.id} className="text-zinc-400">
                    calling {toolName}
                  </div>
                );
            }

            return (
              <div key={m.id} className="whitespace-pre-wrap animate-fadeIn">
                <div className=" gap-2  flex flex-col">
                  <div
                    className={`flex items-center gap-2 p-4 py-2  ${
                      m.role === "user" && "bg-secondary rounded-md "
                    }`}
                  >
                    <Image
                      src={
                        m.role === "assistant"
                          ? "/assistant-black.png"
                          : "/avatar.png"
                      }
                      className="rounded-full"
                      alt={`${m.role} icon`}
                      width={40}
                      height={40}
                    />
                    {/* <div className="font-bold capitalize">{m.role}</div> */}
                    <p>{m.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="shrink-0 w-full min-h-24 md:min-h-[24px]" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-1/2 bg-white dark:bg-background pt-4 -translate-x-1/2 w-full px-8 lg:px-16"
        >
          <input
            className="text-base w-full p-2 mb-8 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-200 focus:dark:ring-zinc-700 focus:outline-none dark:bg-zinc-900 rounded shadow-sm mx-auto block"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />

          <SendHorizontal className="absolute right-4 top-1/3  -translate-y-1/2 transform m-2.5 h-5 w-5 text-muted-foreground cursor-pointer" />
        </form>
      </div>

      <div id="right" className="w-1/2 border-l dark:bg-zinc-900 px-12 py-8">
        <h2 className="text-xl font-semibold  animate-fadeIn pb-4">
          Todo List
        </h2>
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto ">
          <AnimatePresence initial={false}>
            {todos.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  height: { duration: 0.4 },
                }}
              >
                <TaskItem
                  task={task}
                  onToggle={toggleTask}
                  onRemove={removeTask}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const Todo = ({ todo }: { todo: Todo }) => {
  return (
    <div className="flex items-center space-x-2 p-2 border-b border-zinc-200 dark:border-zinc-700 animate-fadeIn">
      <input
        type="checkbox"
        checked={todo.done}
        disabled
        className="form-checkbox h-4 w-4 text-blue-600"
      />
      <span
        className={`flex-grow ${todo.done ? "line-through text-zinc-500" : ""}`}
      >
        {todo.content}
      </span>
    </div>
  );
};
