interface Task {
    title: string;
    description: string;
    status: boolean;
  }

  const API_URL = 'http://localhost:5000/api';
  
  export const getAllTasks = async (): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_URL}/tasks/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`);
      }
  
      return await response.json() as Task[];
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches :", error);
      throw error;
    }
  };

  
  