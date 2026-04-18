import { describe, it, expect } from "vitest";
import { StatisticsService } from "./statisticsService";
import type { Client } from "../domain/Client";

describe("StatisticsService", () => {
  const makeClient = (id: number, workouts: number): Client => ({
    id,
    name: `Client ${id}`,
    age: 25,
    workouts: Array.from({ length: workouts }, (_, i) => ({
      id: i,
      name: "Workout",
      exercises: []
    })),
    measurements: []
  });

  it("computes correct statistics for multiple clients", () => {
    const repo: any = {
      getAll: () => [
        makeClient(1, 2),
        makeClient(2, 5),
        makeClient(3, 3)
      ]
    };

    const service = new StatisticsService(repo);

    const result = service.getStatistics();

    expect(result.totalClients).toBe(3);
    expect(result.mostActiveClient.name).toBe("Client 2");
    expect(result.mostActiveClient.workouts).toBe(5);
    expect(result.averageWorkouts).toBeCloseTo(10 / 3);
  });

  it("returns zero stats for empty repo", () => {
    const repo: any = {
      getAll: () => []
    };

    const service = new StatisticsService(repo);

    const result = service.getStatistics();

    expect(result.totalClients).toBe(0);
    expect(result.averageWorkouts).toBe(0);
    expect(result.clientsActivity.length).toBe(0);
  });

  it("maps clients activity correctly", () => {
    const repo: any = {
      getAll: () => [makeClient(1, 4)]
    };

    const service = new StatisticsService(repo);

    const result = service.getStatistics();

    expect(result.clientsActivity).toEqual([
      { name: "Client 1", workouts: 4 }
    ]);
  });
});