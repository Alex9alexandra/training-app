import type {Workout} from "./Workout"
import type {Measurement} from "./Measurement"

export interface Client {
  id: number;
  name: string;
  age: number;
  workouts: Workout[];
  measurements: Measurement[];
}