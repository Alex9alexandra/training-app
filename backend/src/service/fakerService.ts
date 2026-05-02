import { faker } from "@faker-js/faker";
import type { Client } from "../domain/Client";
import type { Workout } from "../domain/Workout";
import type { Exercise } from "../domain/Exercise";
import type { Measurement } from "../domain/Measurement";


export function createFakeClient() {
  const exercise:Exercise = {
    id: faker.number.int({ min: 1000, max: 9999 }),
    name: faker.word.words(2),
    sets: faker.number.int({ min: 3, max: 6 }),
    reps: faker.number.int({ min: 6, max: 15 }),
    weight: faker.number.int({min: 2, max: 80}),
  };

  const workout:Workout = {
    id: faker.number.int({ min: 1000, max: 9999 }),
    name: faker.word.words(2),
    exercises: [exercise],
  };

  const measurement: Measurement = {
    id: faker.number.int({ min: 1000, max: 9999 }),
    height: faker.number.int({ min: 150, max: 200 }),
    weight: faker.number.float({ min: 50, max: 120, fractionDigits: 1 }),

    muscularMassPercent: faker.number.float({ min: 30, max: 55, fractionDigits: 1 }),
    fatMassPercent: faker.number.float({ min: 10, max: 30, fractionDigits: 1 }),
    boneMassPercent: faker.number.float({ min: 8, max: 15, fractionDigits: 1 }),
    leanBodyMassPercent: faker.number.float({ min: 40, max: 75, fractionDigits: 1 }),

    date: faker.date.recent().toISOString(),
  };

  const client:Client = {
    id: faker.number.int({ min: 10000, max: 99999 }),
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 50 }),

    workouts: [workout],
    measurements: [measurement],
  };

  return client;
}