import type { IClientRepo } from "../repository/IClientRepo";
import type { PrismaClientRepo } from "../repository/PrismaClientRepo";
import type {Client} from "../domain/Client";
import type {Exercise} from "../domain/Exercise";
import type {Workout} from "../domain/Workout";
import { Measurement } from "../domain/Measurement";

export class ClientService{
    
    private repo: PrismaClientRepo;
    constructor(repo: PrismaClientRepo) {this.repo=repo;}

    async addClient(client: Client) { return this.repo.addAsync(client); }
    async getAllClients(search: string="") { return this.repo.getAllAsync(search); }
    async getClient(id: number) { return this.repo.getByIdAsync(id); }
    async updateClient(client: Client) { return this.repo.updateAsync(client); }
    async deleteClient(id: number) { return this.repo.deleteAsync(id); }

    async addWorkout(clientId: number, workout: Workout) { return this.repo.addWorkoutAsync(clientId, workout); }
    async getWorkouts(clientId: number) { return this.repo.getWorkoutsAsync(clientId); }
    async deleteWorkout(clientId: number, workoutId: number) { return this.repo.deleteWorkoutAsync(clientId, workoutId); }


    async addExercise(clientId: number, workoutId: number, exercise: Exercise) { return this.repo.addExerciseAsync(clientId, workoutId, exercise); }
    async deleteExercise(clientId: number, workoutId: number, exerciseId: number) { return this.repo.deleteExerciseAsync(clientId, workoutId, exerciseId); }



    async getMeasurements(clientId: number) { return this.repo.getMeasurementsAsync(clientId); }
    async addMeasurement(clientId: number, measurement: Measurement) { return this.repo.addMeasurementAsync(clientId, measurement); }
    async deleteMeasurement(clientId: number, measurementId: number) { return this.repo.deleteMeasurementAsync(clientId, measurementId); }

    async getStatistics() { return this.repo.getStatisticsAsync(); }
}