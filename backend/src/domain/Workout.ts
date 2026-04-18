import type { Exercise } from "./Exercise";

export interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}