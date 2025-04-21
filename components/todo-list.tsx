"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Clock, Trash2, Edit, CheckCircle, TimerReset } from "lucide-react"
import type { Task } from "./pomodoro-app"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface TodoListProps {
  tasks: Task[]
  onAddTask: (task: Omit<Task, "_id" | "createdAt">) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
  onSelectTask: (task: Task) => void
  currentTaskId: string | undefined
}

export function TodoList({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onCompleteTask,
  onSelectTask,
  currentTaskId,
}: TodoListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
        pomodoros: 0,
      })
      setNewTaskTitle("")
      setNewTaskDescription("")
    }
  }

  const handleUpdateTask = () => {
    if (editingTask && editingTask.title.trim()) {
      onUpdateTask(editingTask)
      setEditingTask(null)
    }
  }

  const incompleteTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>Add New Task</CardTitle>
          <CardDescription className={cn(isDarkMode ? "text-primary/70" : "text-tertiary/70")}>
            Create a new task for your Pomodoro sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask()
                }
              }}
              className={cn(
                "border-secondary focus:border-tertiary",
                isDarkMode ? "text-primary placeholder:text-primary/50" : "text-tertiary placeholder:text-tertiary/50",
              )}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className={cn(
                "min-h-[80px] border-secondary focus:border-tertiary",
                isDarkMode ? "text-primary placeholder:text-primary/50" : "text-tertiary placeholder:text-tertiary/50",
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAddTask}
            className="w-full gap-2 bg-tertiary hover:bg-secondary hover:text-tertiary text-primary"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-primary" : "text-tertiary")}>
          Tasks ({incompleteTasks.length})
        </h3>
        {incompleteTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No tasks yet. Add a task to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                isCurrentTask={task._id === currentTaskId}
                onEdit={() => setEditingTask(task)}
                onDelete={() => onDeleteTask(task._id)}
                onComplete={() => onCompleteTask(task._id)}
                onSelect={() => onSelectTask(task)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-primary" : "text-tertiary")}>
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                isCurrentTask={false}
                isCompleted={true}
                onEdit={() => setEditingTask(task)}
                onDelete={() => onDeleteTask(task._id)}
                onComplete={() => {}}
                onSelect={() => {}}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}

      <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>Edit Task</DialogTitle>
            <DialogDescription className={cn(isDarkMode ? "text-primary/70" : "text-tertiary/70")}>
              Make changes to your task here.
            </DialogDescription>
          </DialogHeader>

          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Task title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className={cn(
                    "border-secondary focus:border-tertiary",
                    isDarkMode
                      ? "text-primary placeholder:text-primary/50"
                      : "text-tertiary placeholder:text-tertiary/50",
                  )}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Task description (optional)"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className={cn(
                    "min-h-[100px] border-secondary focus:border-tertiary",
                    isDarkMode
                      ? "text-primary placeholder:text-primary/50"
                      : "text-tertiary placeholder:text-tertiary/50",
                  )}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTask}
              className="bg-tertiary hover:bg-secondary hover:text-tertiary text-primary"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TaskItemProps {
  task: Task
  isCurrentTask: boolean
  isCompleted?: boolean
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  onSelect: () => void
  isDarkMode: boolean
}

function TaskItem({
  task,
  isCurrentTask,
  isCompleted = false,
  onEdit,
  onDelete,
  onComplete,
  onSelect,
  isDarkMode,
}: TaskItemProps) {
  return (
    <Card className={cn("transition-all", isCurrentTask && "border-tertiary shadow-md", isCompleted && "opacity-70")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div className="pt-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => !isCompleted && onComplete()}
              disabled={isCompleted}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={cn(
                  "font-medium line-clamp-1",
                  isCompleted && "line-through text-muted-foreground",
                  !isCompleted && (isDarkMode ? "text-primary" : "text-tertiary"),
                )}
              >
                {task.title}
              </h4>
              <div className="flex items-center gap-1 shrink-0 text-muted-foreground text-sm">
                <Clock className="h-3 w-3" />
                <span>{task.pomodoros}</span>
              </div>
            </div>

            {task.description && (
              <p className={cn("text-sm mt-1 line-clamp-2", isDarkMode ? "text-primary/70" : "text-tertiary/70")}>
                {task.description}
              </p>
            )}

            <div className="flex gap-2 mt-3">
              {!isCompleted && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1",
                      isCurrentTask && "bg-secondary text-tertiary",
                      !isCurrentTask &&
                        isDarkMode &&
                        "border-primary text-primary hover:bg-primary hover:text-tertiary",
                    )}
                    onClick={onSelect}
                  >
                    {isCurrentTask ? (
                      <>
                        <TimerReset className="h-3.5 w-3.5" />
                        Current Task
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        Start Pomodoro
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 px-2",
                      isDarkMode && "border-primary text-primary hover:bg-primary hover:text-tertiary",
                    )}
                    onClick={onComplete}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-2",
                  isDarkMode && "border-primary text-primary hover:bg-primary hover:text-tertiary",
                )}
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-2",
                  isDarkMode && "border-primary text-primary hover:bg-primary hover:text-tertiary",
                )}
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
