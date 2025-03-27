import axios from "axios";

export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  startDate: Date;
  dueDate: Date;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/tasks";

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const token = localStorage.getItem("auth-token");
      console.log(token);
      if (!token) {
        throw new Error("there is no token");
      }

      const response = await axios.get(`${BASE_URL}/tasks`, {
        withCredentials: true,
      });

      return response.data.tasks;
    } catch (error: any) {
      console.error("error on fetching tasks:", error);
      throw new Error(error.response?.data?.message || "no task...");
    }
  },

  deleteTask: async (taskId: string): Promise<string> => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${taskId}`, {
        withCredentials: true,
      });

      return response.data.deletedTaskId;
    } catch (error: any) {
      console.error("error deleting:/:", error);
      throw new Error(
        error.response?.data?.message || "failed to delete task try again"
      );
    }
  },

  createTask: async (
    taskData: Omit<Task, "_id" | "createdAt" | "updatedAt" | "__v">
  ): Promise<Task> => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, taskData, {
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      console.error("cannot create task:", error);

      if (error.response) {
        throw new Error(error.response.data.message || "failed");
      } else if (error.request) {
        throw new Error("no response from server");
      } else {
        throw new Error("request configuration error");
      }
    }
  },

  updateTask: async (
    taskId: string,
    updateData: Partial<Omit<Task, "_id" | "createdAt" | "updatedAt" | "__v">>
  ): Promise<Task> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${taskId}`,
        updateData,
        {
          withCredentials: true,
        }
      );

      return response.data.task;
    } catch (error: any) {
      console.error("error updating task:", error);

      if (error.response) {
        throw new Error(error.response.data.message || "faield to ypdate");
      } else if (error.request) {
        throw new Error("no response from server:/");
      } else {
        throw new Error("request configuration error");
      }
    }
  },
};
