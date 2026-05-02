import type {Client} from "../domain/Client";
import type {Workout} from "../domain/Workout";
import type {Exercise} from "../domain/Exercise";
const API_URL = "http://localhost:3000";
import { operationQueue } from "../offline/offlineQueue";
import {sharedRepo} from "../repository/LocalClientRepo";
import type { Measurement } from "../domain/Measurement";

export class ClientService {
  async addClient(client: Client) {
    try{
    const res = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!res.ok) {
      throw new Error("Server error");
    }
    return await res.json();
    }catch(error){
      console.log("Offline -> saving locally");
      const clientSnapshot = structuredClone(client);
      sharedRepo.add(client);
      operationQueue.push({ type: "ADD_CLIENT", data: clientSnapshot });
      return client;
    }
  }

  async getAllClients(page: number, limit: number):  Promise<{
  data: Client[];
  totalPages: number;
  page: number;
  }> {
    try{
    const res = await fetch(`${API_URL}/clients?page=${page}&limit=${limit}`);
    if (!res.ok) {
      throw new Error("Server error");
    }
    return await res.json();
    }catch(error){
      console.log("Offline -> fetching from local repo");
      const allClients = sharedRepo.getAll();
      const totalPages = Math.ceil(allClients.length / limit);
      const paginatedClients = allClients.slice((page - 1) * limit, page * limit);
      //no op needed to push
      return {
        data: paginatedClients,
        totalPages,
        page,
      };
    }
  }

  async getClient(id: number) :Promise<Client> {
    try{
    const res = await fetch(`${API_URL}/clients/${id}`);
    if (!res.ok) {
      throw new Error("Server error");
    }
    return await res.json();
    }catch(error){
      console.log("Offline -> fetching from local repo");
      const client =  sharedRepo.getAll().find(c => c.id === id);
      if (!client) {
        throw new Error("Client not found in local repo");
      }
      //no op needed to push
      return client;
    }
  }

  async updateClient(client: Client) {
    try{
    const res = await fetch(`${API_URL}/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    if (!res.ok) {
      throw new Error("Server error");
    }
    return await res.json();
    }catch(error){
      console.log("Offline -> updating locally");
      const clientSnapshot = structuredClone(client);
      sharedRepo.update(client);
      operationQueue.push({ type: "UPDATE_CLIENT", data: clientSnapshot });
      return client;
    }
  }

  async deleteClient(id: number) :Promise<void> {
    try{
    const res= await fetch(`${API_URL}/clients/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Server error");
    }
    }catch(error){
      console.log("Offline -> deleting locally");
      sharedRepo.delete(id);
      operationQueue.push({ type: "DELETE_CLIENT", id });
    }
  }

  async addWorkout(clientId: number, workout: Workout) {
    try{
      const res = await fetch(`${API_URL}/clients/${clientId}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workout),
      });
      if (!res.ok) {
        throw new Error("Server error");
      }
      return await res.json();
    }catch(error){
      console.log("Offline -> saving locally");
      const client = sharedRepo.getAll().find(c => c.id === clientId);
      if (!client) {
        throw new Error("Client not found in local repo");
      }
      const workoutSnapshot= structuredClone(workout);
      client.workouts.push(workout);
      sharedRepo.update(client);
      operationQueue.push({ type: "ADD_WORKOUT", clientId, data: workoutSnapshot });
      return workout;
    }
  }

  async getWorkouts(clientId: number,page: number, limit: number) :  Promise<{
  data: Workout[];
  totalPages: number;
  page: number;
  }> {
    try{
    const res = await fetch(`${API_URL}/clients/${clientId}/workouts?page=${page}&limit=${limit}`);
    if (!res.ok) {
      throw new Error("Server error");
    }
    return await res.json();
    }catch(error){
      console.log("Offline -> fetching from local repo");
      const client = sharedRepo.getAll().find(c => c.id === clientId);
      if (!client) {
        throw new Error("Client not found in local repo");
      }
      const totalPages = Math.ceil(client.workouts.length / limit);
      const paginatedWorkouts = client.workouts.slice((page - 1) * limit, page * limit);
      //no op needed to push
      return {
        data: paginatedWorkouts,
        totalPages,
        page,
      };
    }
  }

  async deleteWorkout(clientId: number, workoutId: number):Promise<void> {
    try{
    const res=await fetch(`${API_URL}/clients/${clientId}/workouts/${workoutId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Server error");
    }
    }catch(error){
      console.log("Offline -> deleting locally");
      const client = sharedRepo.getAll().find(c => c.id === clientId);
      if (client) {
        client.workouts = client.workouts.filter(w => w.id !== workoutId);
        sharedRepo.update(client);
        operationQueue.push({ type: "DELETE_WORKOUT", clientId, workoutId });
      }
      
    }
  }

  async addExercise(clientId: number, workoutId: number, exercise: Exercise) {
    try{
    const res = await fetch(
      `${API_URL}/clients/${clientId}/workouts/${workoutId}/exercises`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exercise),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add exercise");
    }

    return await res.json();
    }catch(error){
      console.log("Offline -> saving locally");
      const client = sharedRepo.getAll().find(c => c.id === clientId);
      if (!client) {
        throw new Error("Client not found in local repo");
      }
      const workout = client.workouts.find(w => w.id === workoutId);
      if (!workout) {
        throw new Error("Workout not found in local repo");
      }
      const exefciseSnapshot=structuredClone(exercise);
      workout.exercises.push(exercise);
      sharedRepo.update(client);
      operationQueue.push({ type: "ADD_EXERCISE", clientId, workoutId, data: exefciseSnapshot });
      return exercise;
    }
  }

  async deleteExercise(clientId: number, workoutId: number, exerciseId: number):Promise<void> {
    try{
    const res=await fetch(
      `${API_URL}/clients/${clientId}/workouts/${workoutId}/exercises/${exerciseId}`,
      {
        method: "DELETE",
      }
    );
    if (!res.ok) {
      throw new Error("Server error");
    }
    }catch(error){
      console.log("Offline -> deleting locally");
      const client = sharedRepo.getAll().find(c => c.id === clientId);
      if (client) {
        const workout = client.workouts.find(w => w.id === workoutId);
        if (workout) {
          workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
          sharedRepo.update(client);
          operationQueue.push({ type: "DELETE_EXERCISE", clientId, workoutId, exerciseId });
        }
      }
      
    }
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
    try{
    const res = await fetch(`${API_URL}/statistics`);
    if (!res.ok) {
      throw new Error("Server error");
    }
    return await res.json();
    }catch(error){
      console.log("Offline -> calculating statistics from local repo");
      const clients = sharedRepo.getAll();
      const totalClients = clients.length;
      const mostActiveClient = clients.reduce((max, client) => {
        const workoutCount = client.workouts.length;
        return workoutCount > max.workouts ? { ...client, workouts: workoutCount } : max;
      }, { name: "", workouts: 0 });
      const averageWorkouts = totalClients > 0 ? clients.reduce((sum, client) => sum + client.workouts.length, 0) / totalClients : 0;
      const clientsActivity = clients.map(client => ({
        name: client.name,
        workouts: client.workouts.length
      }));
      //no op needed to push
      return {
        totalClients,
        mostActiveClient,
        averageWorkouts,
        clientsActivity
      };

    }
  }

  async getMeasurements(clientId: number) {
    try {

      const res = await fetch(
        `${API_URL}/clients/${clientId}/measurements`
      );

      if (!res.ok) {
        throw new Error("Server error");
      }

      return await res.json();

    } catch (error) {

      console.log("Offline -> fetching measurements locally");

      const client = sharedRepo.getAll().find(
        c => c.id === clientId
      );

      if (!client) {
        throw new Error("Client not found");
      }

      return client.measurements;
    }
  }

  async addMeasurement(clientId: number, measurement: Measurement) {
    const res = await fetch(
        `${API_URL}/clients/${clientId}/measurements`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(measurement)
        }
    );

    if (!res.ok) {
      throw new Error("Failed to add measurement");
    }

    return await res.json();
  }

}