"use client"

import { useEffect, useState } from "react";


interface Task {
    
    description: string;
}

const API_URL = "http://localhost:5000/api";

function Page() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/tasks/tasks`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Erreur HTTP ! Statut : ${res.status}`);
            }
            return res.json();
          })
          .then(data => setTasks(data))
          .catch(err => console.error("Erreur API :", err));
      }, []);
      
  return (
    <div>
         <h2>Liste des tâches</h2>
      <ul>
        {tasks.map((task) => (
          <li>{task.description}</li>
        ))}
      </ul>
    </div>
  )
}

export default Page;