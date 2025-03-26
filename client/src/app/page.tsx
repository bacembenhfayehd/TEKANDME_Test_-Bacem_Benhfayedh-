"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Search, Trash2, Edit, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type TaskStatus = "pending" | "in-progress" | "completed"
type TaskPriority = "high" | "medium" | "low"

interface Task {
  id: string
  title: string
  details: string
  startDate: Date
  endDate: Date
  status: TaskStatus
  priority: TaskPriority
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      details: "Finish the draft and send it to the team for review",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      status: "in-progress",
      priority: "high",
    },
    {
      id: "2",
      title: "Weekly team meeting",
      details: "Discuss project progress and next steps",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // 1 day from now
      status: "pending",
      priority: "medium",
    },
    {
      id: "3",
      title: "Update documentation",
      details: "Update the user guide with new features",
      startDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
      endDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      status: "completed",
      priority: "low",
    },
  ])

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDetails, setNewTaskDetails] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const addTask = () => {
    if (newTaskTitle.trim() === "") return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      details: newTaskDetails,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      status: "pending",
      priority: "medium",
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
    setNewTaskDetails("")
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)))
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.details.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesPriority && matchesStatus
  })

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  const totalTasks = tasks.length

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Task Manager</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Left sidebar - Calendar always visible */}
        <div className="md:w-1/4">
          <div className="bg-card rounded-lg p-4 shadow-sm h-full border-0">
            <h2 className="text-xl font-semibold mb-4">{format(currentDate, "MMMM d, yyyy")}</h2>

            {/* Calendar always visible */}
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="border-0" />
          </div>
        </div>

        {/* Right content area */}
        <div className="md:w-3/4 flex flex-col gap-4">
          {/* Task input fields */}
          <div className="bg-card rounded-lg p-4 shadow-sm border-0">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="md:w-1/3 border-0"
              />
              <Input
                placeholder="Task details"
                value={newTaskDetails}
                onChange={(e) => setNewTaskDetails(e.target.value)}
                className="md:w-2/3 border-0"
              />
              <Button onClick={addTask} variant="default" className="border-0">
                Add Task
              </Button>
            </div>
          </div>

          {/* Filter section */}
          <div className="bg-card rounded-lg p-4 shadow-sm border-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[300px] border-0"
                />
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-0">
                      Filter by Priority
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-0">
                    <DropdownMenuItem onClick={() => setPriorityFilter("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("high")}>High</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>Medium</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("low")}>Low</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-0">
                      Filter by Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-0">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Task grid with fixed height and scrolling */}
          <div className="bg-card rounded-lg p-4 shadow-sm border-0">
            <div className="h-[calc(100vh-500px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="h-full border-0">
                    <div className="flex h-full">
                      {/* Left column - Task details */}
                      <div className="flex-1 p-4">
                        <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <p className="text-sm text-muted-foreground mb-4">{task.details}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="font-semibold">Start Date:</p>
                              <p>{format(task.startDate, "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="font-semibold">End Date:</p>
                              <p>{format(task.endDate, "MMM d, yyyy")}</p>
                            </div>
                          </div>
                        </CardContent>
                      </div>

                      {/* Right column - Icons */}
                      <div className="w-12  flex flex-col items-center py-4 space-y-4">
                        {/*<Badge className={`${getPriorityColor(task.priority)} border-0`}>{task.priority}</Badge>*/}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${getStatusColor(task.status)} rounded-full p-1 h-auto w-auto border-0`}
                            >
                              {getStatusIcon(task.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-0">
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "pending")}>
                              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "in-progress")}>
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "completed")}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit task"
                          className="rounded-full p-1 h-auto w-auto border-0"
                        >
                          <Edit className="h-5 w-5 text-gray-500" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          aria-label="Delete task"
                          className="rounded-full p-1 h-auto w-auto border-0"
                        >
                          <Trash2 className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary boxes - Full width and separated */}
      <div className="bg-card rounded-lg p-4 shadow-sm mt-8 border-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="md:col-span-1 border-0">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-lg font-semibold mb-2">Completed Tasks</p>
              <p className="text-4xl font-bold text-green-600">{completedTasks}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-1 border-0">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-lg font-semibold mb-2">In Progress</p>
              <p className="text-4xl font-bold text-blue-600">{inProgressTasks}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-3 border-0">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-lg font-semibold mb-2">Total Tasks</p>
              <p className="text-4xl font-bold">{totalTasks}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

