import type {Client} from "../domain/Client";
import type {Workout} from "../domain/Workout";
import type {Exercise} from "../domain/Exercise";
const API_URL = "http://localhost:3000";

export class ClientService {
    async addClient(client: Client) {
    const res = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    return res.json();
  }

  async getAllClients(page: number, limit: number):  Promise<{
  data: Client[];
  totalPages: number;
  page: number;
  }> {
    const res = await fetch(`${API_URL}/clients?page=${page}&limit=${limit}`);
    return res.json();
  }

  async getClient(id: number) :Promise<Client> {
    const res = await fetch(`${API_URL}/clients/${id}`);
    return res.json();
  }

  async updateClient(client: Client) {
    const res = await fetch(`${API_URL}/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    return res.json();
  }

  async deleteClient(id: number) :Promise<void> {
    await fetch(`${API_URL}/clients/${id}`, {
      method: "DELETE",
    });
  }
  async addWorkout(clientId: number, workout: Workout) {
    const res = await fetch(`${API_URL}/clients/${clientId}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workout),
    });
    return res.json();
  }

  async getWorkouts(clientId: number,page: number, limit: number) :  Promise<{
  data: Workout[];
  totalPages: number;
  page: number;
  }> {
    const res = await fetch(`${API_URL}/clients/${clientId}/workouts?page=${page}&limit=${limit}`);
    return res.json();
  }

  async deleteWorkout(clientId: number, workoutId: number):Promise<void> {
    await fetch(`${API_URL}/clients/${clientId}/workouts/${workoutId}`, {
      method: "DELETE",
    });
  }

  async addExercise(clientId: number, workoutId: number, exercise: Exercise) {
    const res = await fetch(
      `${API_URL}/clients/${clientId}/workouts/${workoutId}/exercises`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exercise),
      }
    );
    return res.json();
  }

  async deleteExercise(clientId: number, workoutId: number, exerciseId: number):Promise<void> {
    await fetch(
      `${API_URL}/clients/${clientId}/workouts/${workoutId}/exercises/${exerciseId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getStatistics(): Promise<{
    totalClients: number;
    mostActiveClient: {
      name: string;
      workouts: number;
    };
    averageWorkouts: number;
    clientsActivity: {
      name: string;
      workouts: number;
    }[];
  }> {
    const res = await fetch(`${API_URL}/statistics`);
    return res.json();
  }
}