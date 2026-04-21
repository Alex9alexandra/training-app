import { sharedRepo } from "../repository/LocalClientRepo";
import { operationQueue } from "./offlineQueue";

const API_URL = "http://localhost:3000";
let syncing = false;

export async function syncOperations() {
  if (syncing) return;

  syncing = true;

  try {
    while (operationQueue.length > 0) {
      const op = operationQueue[0];

      switch (op.type) {
        case "ADD_CLIENT":
          await fetch(`${API_URL}/clients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(op.data),
          });
          break;

        case "UPDATE_CLIENT":
          await fetch(`${API_URL}/clients/${op.data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(op.data),
          });
          break;

        case "DELETE_CLIENT":
          await fetch(`${API_URL}/clients/${op.id}`, {
            method: "DELETE",
          });
          break;

        case "ADD_WORKOUT":
          await fetch(`${API_URL}/clients/${op.clientId}/workouts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(op.data),
          });
          break;

        case "DELETE_WORKOUT":
          await fetch(`${API_URL}/clients/${op.clientId}/workouts/${op.workoutId}`, {
            method: "DELETE",
          });
          break;

        case "ADD_EXERCISE":
          await fetch(`${API_URL}/clients/${op.clientId}/workouts/${op.workoutId}/exercises`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(op.data),
          });
          break;

        case "DELETE_EXERCISE":
          await fetch(`${API_URL}/clients/${op.clientId}/workouts/${op.workoutId}/exercises/${op.exerciseId}`, {
            method: "DELETE",
          });
          break;
      }

      operationQueue.shift();
    }

    sharedRepo.clear();
    window.dispatchEvent(new Event("sync-done"));

  } finally {
    syncing = false;
  }
}