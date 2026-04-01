import type { IClientRepo } from "../repository/IClientRepo";
import type {Client} from "../domain/Client";
import type {Exercise} from "../domain/Exercise";
import type {Workout} from "../domain/Workout";

export class ClientService{
    
    private repo: IClientRepo;
    constructor(repo: IClientRepo) {this.repo=repo;}

    //Client op
    addClient(client: Client) { this.repo.add(client); }
    getAllClients() { return this.repo.getAll(); }
    getClient(id: number) { return this.repo.getById(id); }
    updateClient(client: Client) { return this.repo.update(client); }
    deleteClient(id: number) { return this.repo.delete(id); }

    //Workout op
    addWorkout(clientId: number, workout: Workout): boolean {
    const client = this.getClient(clientId);
    if (!client) return false;
    client.workouts.push(workout);
    return true;
    }

    getWorkouts(clientId: number): Workout[] | undefined {
        const client = this.getClient(clientId);
        return client?.workouts;
    }

    deleteWorkout(clientId: number, workoutId: number): boolean {
        const client = this.getClient(clientId);
        if (!client) return false;
        const index = client.workouts.findIndex(w => w.id === workoutId);
        if (index === -1) return false;
        client.workouts.splice(index, 1);
        return true;
    }

    //Exercise op
     addExercise(clientId: number, workoutId: number, exercise: Exercise): boolean {
        const workout = this.getWorkouts(clientId)?.find(w => w.id === workoutId);
        if (!workout) return false;
        workout.exercises.push(exercise);
        return true;
    }

    deleteExercise(clientId: number, workoutId: number, exerciseId: number): boolean {
        const workout = this.getWorkouts(clientId)?.find(w => w.id === workoutId);
        if (!workout) return false;
        const index = workout.exercises.findIndex(e => e.id === exerciseId);
        if (index === -1) return false;
        workout.exercises.splice(index, 1);
        return true;
    }
}