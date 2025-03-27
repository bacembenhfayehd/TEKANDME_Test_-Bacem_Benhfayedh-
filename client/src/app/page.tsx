"use client";

import { useState, useEffect } from "react";
import { format, isTomorrow, differenceInDays } from "date-fns";
import {
  Search,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, taskService } from "@/services/taskService";
import { TaskEditModal } from "@/components/task-edit-modal";

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    Task["priority"] | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">(
    "all"
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const fetchedTasks = await taskService.getTasks();
        setTasks(fetchedTasks);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTasks();

    // make taks updated to current date
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const addTask = async () => {
    if (newTaskTitle.trim() === "") return;

    try {
      const newTask: Omit<Task, "_id" | "createdAt" | "updatedAt" | "__v"> = {
        title: newTaskTitle,
        description: newTaskDetails,
        status: "To Do", // Assurez-vous que cela correspond exactement au type dans votre interface
        priority: "Medium",
        startDate: new Date(),
        dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        user: "", // Le backend devrait probablement récupérer l'utilisateur du token
      };

      // Utiliser la méthode createTask du service
      const createdTask = await taskService.createTask(newTask);

      // Mettre à jour l'état local avec la tâche créée
      setTasks([...tasks, createdTask]);

      // Réinitialiser les champs de saisie
      setNewTaskTitle("");
      setNewTaskDetails("");
    } catch (err: any) {
      console.error("Erreur lors de l'ajout de la tâche", err);
      // Optionnel : Gérer l'erreur (afficher un message à l'utilisateur)
      // Par exemple, en utilisant un state d'erreur
      setError(err.message || "Impossible de créer la tâche");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Vous devrez implémenter la méthode de suppression de tâche dans votre service
      // await taskService.deleteTask(id);
      const deletedTaskId = await taskService.deleteTask(id);
      setTasks(tasks.filter((task) => task._id !== deletedTaskId));
    } catch (err) {
      console.error("Erreur lors de la suppression de la tâche", err);
    }
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    try {
      const validStatuses: Task["status"][] = [
        "To Do",
        "In Progress",
        "Completed",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Statut invalide");
      }

      const updatedTask = await taskService.updateTaskStatus(id, status);

      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut", err);

      setError(err.message || "Impossible de mettre à jour le statut");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const totalTasks = tasks.length;

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "To Do":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "To Do":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-100  text-red-800";
      case "Medium":
        return "bg-orange-100  text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
    }
  };

  if (isLoading) {
    return <div>Chargement des tâches...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Hello , Aqeel , Start planning today
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/4">
          <div className="bg-card rounded-lg p-4 shadow-sm h-full border-0">
            <h2 className="text-xl font-semibold mb-4">
              {format(currentDate, "MMMM d, yyyy")}
            </h2>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border-0"
            />
          </div>
        </div>

        <div className="md:w-3/4 flex flex-col gap-4">
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
              <Button
                onClick={addTask}
                variant="default"
                className="border-0 bg-green-600"
              >
                +
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 shadow-sm border-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-0">
                      Filter by Priority
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-0">
                    <DropdownMenuItem onClick={() => setPriorityFilter("all")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("High")}>
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setPriorityFilter("Medium")}
                    >
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("Low")}>
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-0">
                      Filter by Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-0">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("To Do")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("In Progress")}
                    >
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("Completed")}
                    >
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[300px] border-0"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 shadow-sm border-0">
            <div className="h-[calc(100vh-500px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredTasks.map((task) => (
                  <Card key={task._id} className="h-full bg-amber-200 border-0">
                    <div className="flex h-full">
                      <div className="flex-1 p-4">
                        <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-lg">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <p className="text-sm text-muted-foreground mb-4">
                            {task.description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="font-semibold">Start Date:</p>
                              <p>{format(task.startDate, "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="font-semibold">End Date:</p>
                              <p
                                className={`
      ${isTomorrow(task.dueDate) ? "text-red-500 font-bold" : ""}
    `}
                              >
                                {format(task.dueDate, "MMM d, yyyy")}
                                {isTomorrow(task.dueDate) && (
                                  <span
                                    className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px]"
                                    title="Due Tomorrow!"
                                  >
                                    Tomorrow
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </div>

                      <div className="w-12  flex flex-col items-center py-4 space-y-4">
                        {/*<Badge className={`${getPriorityColor(task.priority)} border-0`}>{task.priority}</Badge>*/}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${getStatusColor(
                                task.status
                              )} rounded-full p-1 h-auto w-auto border-0`}
                            >
                              {getStatusIcon(task.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-0">
                            <DropdownMenuItem
                              onClick={() =>
                                updateTaskStatus(task._id!, "To Do")
                              }
                            >
                              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateTaskStatus(task._id!, "In Progress")
                              }
                            >
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateTaskStatus(task._id!, "Completed")
                              }
                            >
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
                          <TaskEditModal
                            task={task}
                            tasks={tasks}
                            setTasks={setTasks}
                            newTaskTitle={newTaskTitle}
                            setNewTaskTitle={setNewTaskTitle}
                            newTaskDetails={newTaskDetails}
                            setNewTaskDetails={setNewTaskDetails}
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                          />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task._id!)}
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

      <div className="bg-card rounded-lg p-4 shadow-sm mt-8 border-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="md:col-span-1 bg-amber-200 border-0">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-lg font-semibold mb-2">Completed Tasks</p>
              <p className="text-4xl font-bold">{completedTasks}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-1 bg-amber-300 border-0">
            <CardContent className="  flex flex-col items-center justify-center p-6">
              <p className="text-lg font-semibold mb-2">Pending tasks</p>
              <p className="text-4xl font-bold ">{inProgressTasks}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-3 border-0">
            <CardContent className="flex gap-10  items-center justify-center p-6">
              <p className="text-lg font-semibold mb-2 text-blue-300">
                Tasks created
              </p>
              <p className="text-4xl font-bold">{totalTasks}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
