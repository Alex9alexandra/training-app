import type { IClientRepo } from "../repository/IClientRepo";
import type {Client} from "../domain/Client";
import type {Exercise} from "../domain/Exercise";
import type {Workout} from "../domain/Workout";
import { Measurement } from "../domain/Measurement";

export class ClientService{
    
    private repo: IClientRepo;
    constructor(repo: IClientRepo) {this.repo=repo;}

    //Client op
    addClient(client: Client) { return this.repo.add(client); }
    getAllClients(): Client[] { return this.repo.getAll(); }
    getClient(id: number): Client | undefined { return this.repo.getById(id); }
    updateClient(client: Client) { return this.repo.update(client); }
    deleteClient(id: number) { return this.repo.delete(id); }

    //Workout op
    addWorkout(clientId: number, workout: Workout): Workout|null {
    const client = this.getClient(clientId);
    if (!client) return null;
    client.workouts.push(workout);
    return workout;
    }

    getWorkouts(clientId: number): Workout[] | undefined {
        const client = this.getClient(clientId);
        return client?.workouts;
    }

    deleteWorkout(clientId: number, workoutId: number): Workout | null {
        const client = this.getClient(clientId);
        if (!client) return null;
        const index = client.workouts.findIndex(w => w.id === workoutId);
        if (index === -1) return null;
        const deleted = client.workouts[index]!;
        client.workouts.splice(index, 1);
        return deleted;
    }

    //Exercise op
     addExercise(clientId: number, workoutId: number, exercise: Exercise): Exercise | null {
        const workout = this.getWorkouts(clientId)?.find(w => w.id === workoutId);
        if (!workout) return null;
        workout.exercises.push(exercise);
        return exercise;
    }

    deleteExercise(clientId: number, workoutId: number, exerciseId: number): Exercise | null {
        const workout = this.getWorkouts(clientId)?.find(w => w.id === workoutId);
        if (!workout) return null;
        const index = workout.exercises.findIndex(e => e.id === exerciseId);
        if (index === -1) return null;
        const deleted = workout.exercises[index]!;
        workout.exercises.splice(index, 1);
        return deleted;
    }

    // Measurement op

    getMeasurements(clientId: number) {
        const client = this.getClient(clientId);

        if (!client) {
            return null;
        }

        return [...client.measurements].sort((a, b) => {

            const [dayA, monthA, yearA] = a.date.split("/").map(Number);
            const [dayB, monthB, yearB] = b.date.split("/").map(Number);

            const dateA = new Date(yearA!, monthA! - 1, dayA);
            const dateB = new Date(yearB!, monthB! - 1, dayB);

            return dateB.getTime() - dateA.getTime();
        })??[];
    }

    addMeasurement(clientId: number, measurement: Measurement): Measurement | null {
        const client = this.getClient(clientId);

        if (!client) {
            return null;
        }

        if (!client.measurements) {
            client.measurements = [];
        }

        client.measurements.push(measurement);

        return measurement;
    }

    deleteMeasurement(clientId: number, measurementId: number): Measurement | null {
        const client = this.getClient(clientId);

        if (!client || !client.measurements) {
            return null;
        }

        const index = client.measurements.findIndex(
            m => m.id === measurementId
        );

        if (index === -1) {
            return null;
        }

        const deleted = client.measurements[index]!;

        client.measurements.splice(index, 1);

        return deleted;
    }
}