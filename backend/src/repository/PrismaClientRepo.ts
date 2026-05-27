import { PrismaClient } from "@prisma/client";
import type { IClientRepo } from "./IClientRepo";
import type { Client } from "../domain/Client";
import type { Workout } from "../domain/Workout";
import type { Exercise } from "../domain/Exercise";
import type { Measurement } from "../domain/Measurement";

const prisma = new PrismaClient();

const clientInclude = {
  workouts: {
    include: { exercises: true }
  },
  measurements: true
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function mapClient(p: any): Client {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    workouts: p.workouts.map((w: any): Workout => ({
      id: w.id,
      name: w.name,
      exercises: w.exercises.map((e: any): Exercise => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
      }))
    })),
    measurements: p.measurements.map((m: any): Measurement => ({
      id: m.id,
      height: m.height,
      weight: m.weight,
      muscularMassPercent: m.muscularMassPercent,
      fatMassPercent: m.fatMassPercent,
      boneMassPercent: m.boneMassPercent,
      leanBodyMassPercent: m.leanBodyMassPercent,
      date: formatDate(m.date),
    }))
  };
}

export class PrismaClientRepo implements IClientRepo {

  getAll(): Client[] { throw new Error("Use getAllAsync"); }
  getById(id: number): Client | undefined { throw new Error("Use getByIdAsync"); }
  add(client: Client): Client { throw new Error("Use addAsync"); }
  update(client: Client): boolean { throw new Error("Use updateAsync"); }
  delete(id: number): Client | null { throw new Error("Use deleteAsync"); }

  async getAllAsync(search:string=""): Promise<Client[]> {
    const clients = await prisma.client.findMany({ 
        where: search?{
            name:{contains:search}
        }:{},
        include: clientInclude });
    return clients.map(mapClient);
  }

  async getByIdAsync(id: number): Promise<Client | undefined> {
    const client = await prisma.client.findUnique({ where: { id }, include: clientInclude });
    return client ? mapClient(client) : undefined;
  }

  async addAsync(client: Client): Promise<Client> {
    const created = await prisma.client.create({
      data: { name: client.name, age: client.age },
      include: clientInclude
    });
    return mapClient(created);
  }

  async updateAsync(client: Client): Promise<boolean> {
    try {
      await prisma.client.update({
        where: { id: client.id },
        data: { name: client.name, age: client.age }
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteAsync(id: number): Promise<Client | null> {
    const existing = await prisma.client.findUnique({ where: { id }, include: clientInclude });
    if (!existing) return null;
    await prisma.client.delete({ where: { id } });
    return mapClient(existing);
  }

  async getWorkoutsAsync(clientId: number): Promise<Workout[] | null> {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return null;
    const workouts = await prisma.workout.findMany({
      where: { clientId },
      include: { exercises: true }
    });
    return workouts.map((w: { id: number; name: string; exercises: Exercise[] }) => ({
      id: w.id,
      name: w.name,
      exercises: w.exercises
    }));
  }

  async addWorkoutAsync(clientId: number, workout: Workout): Promise<Workout | null> {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return null;
    const created = await prisma.workout.create({
      data: {
        name: workout.name,
        clientId,
        exercises: {
          create: (workout.exercises ?? []).map(e => ({
            name: e.name, sets: e.sets, reps: e.reps, weight: e.weight
          }))
        }
      },
      include: { exercises: true }
    });
    return { id: created.id, name: created.name, exercises: created.exercises };
  }

  async deleteWorkoutAsync(clientId: number, workoutId: number): Promise<Workout | null> {
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, clientId },
      include: { exercises: true }
    });
    if (!workout) return null;
    await prisma.workout.delete({ where: { id: workoutId } });
    return { id: workout.id, name: workout.name, exercises: workout.exercises };
  }

  async addExerciseAsync(clientId: number, workoutId: number, exercise: Exercise): Promise<Exercise | null> {
    const workout = await prisma.workout.findFirst({ where: { id: workoutId, clientId } });
    if (!workout) return null;
    const created = await prisma.exercise.create({
      data: {
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        workoutId
      }
    });
    return { id: created.id, name: created.name, sets: created.sets, reps: created.reps, weight: created.weight };
  }

  async deleteExerciseAsync(clientId: number, workoutId: number, exerciseId: number): Promise<Exercise | null> {
    const workout = await prisma.workout.findFirst({ where: { id: workoutId, clientId } });
    if (!workout) return null;
    const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId, workoutId } });
    if (!exercise) return null;
    await prisma.exercise.delete({ where: { id: exerciseId } });
    return { id: exercise.id, name: exercise.name, sets: exercise.sets, reps: exercise.reps, weight: exercise.weight };
  }

  async getMeasurementsAsync(clientId: number): Promise<Measurement[] | null> {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return null;
    const measurements = await prisma.measurement.findMany({
      where: { clientId },
      orderBy: { date: "desc" }
    });
    return measurements.map((m: { id: number; height: number; weight: number; muscularMassPercent: number; fatMassPercent: number; boneMassPercent: number; leanBodyMassPercent: number; date: Date }) => ({
      id: m.id,
      height: m.height,
      weight: m.weight,
      muscularMassPercent: m.muscularMassPercent,
      fatMassPercent: m.fatMassPercent,
      boneMassPercent: m.boneMassPercent,
      leanBodyMassPercent: m.leanBodyMassPercent,
      date: formatDate(m.date),
    }));
  }

  async addMeasurementAsync(clientId: number, measurement: Measurement): Promise<Measurement | null> {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return null;
    const created = await prisma.measurement.create({
      data: {
        clientId,
        height: measurement.height,
        weight: measurement.weight,
        muscularMassPercent: measurement.muscularMassPercent,
        fatMassPercent: measurement.fatMassPercent,
        boneMassPercent: measurement.boneMassPercent,
        leanBodyMassPercent: measurement.leanBodyMassPercent,
        date: new Date(measurement.date)
      }
    });
    return { ...created, date: formatDate(created.date) };
  }

  async deleteMeasurementAsync(clientId: number, measurementId: number): Promise<Measurement | null> {
    const m = await prisma.measurement.findFirst({ where: { id: measurementId, clientId } });
    if (!m) return null;
    await prisma.measurement.delete({ where: { id: measurementId } });
    return { ...m, date: formatDate(m.date) };
  }

  async getStatisticsAsync() {
    const clients = await prisma.client.findMany({
      include: { workouts: true }
    });
    const totalClients = clients.length;
    const clientsActivity = clients.map((c: { name: string; workouts: { id: number }[] }) => ({
      name: c.name,
      workouts: c.workouts.length
    }));
    const mostActiveClient = clientsActivity.reduce(
      (best : { name: string; workouts: number }, c: { name: string; workouts: number }) => c.workouts > best.workouts ? c : best,
      { name: "", workouts: 0 }
    );
    const totalWorkouts = clientsActivity.reduce((sum: number, c: { name: string; workouts: number }) => sum + c.workouts, 0);
    return {
      totalClients,
      mostActiveClient,
      averageWorkouts: totalClients === 0 ? 0 : totalWorkouts / totalClients,
      clientsActivity
    };
  }
}