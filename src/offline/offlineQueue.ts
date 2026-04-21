import type { Client } from "../domain/Client";
import type { Exercise } from "../domain/Exercise";
import type { Workout } from "../domain/Workout";

export type Operation =
  | { type: "ADD_CLIENT"; data: Client }
  | { type: "UPDATE_CLIENT"; data: Client }
  | { type: "DELETE_CLIENT"; id: number }

  | { type: "ADD_WORKOUT"; clientId: number; data: Workout }
  | { type: "DELETE_WORKOUT"; clientId: number; workoutId: number }

  | { type: "ADD_EXERCISE"; clientId: number; workoutId: number; data: Exercise }
  | { type: "DELETE_EXERCISE"; clientId: number; workoutId: number; exerciseId: number };
export const operationQueue: Operation[] = [];