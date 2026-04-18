import type { IClientRepo } from "../repository/IClientRepo";
import type {Client} from "../domain/Client";
import type {Exercise} from "../domain/Exercise";
import type {Workout} from "../domain/Workout";

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
}