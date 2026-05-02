import type {Client} from "../domain/Client";
import type {IClientRepo}  from "./IClientRepo";

export class ClientMemoryRepo implements IClientRepo{
    private clients: Client[]=[];

    constructor(initialClients: Client[]=[])
    {
        this.clients=[];
        if (initialClients.length > 0) {
            this.clients = initialClients;
        } else {
            this.initializeRepository();
        }
    }
    getAll(): Client[] {
        return this.clients
    }
    getById(id: number): Client | undefined {
        return this.clients.find(c=>c.id===id);
    }
    add(client: Client): Client {
        this.clients.push(client);
        return client;
    }
    update(client: Client): boolean {
        const index= this.clients.findIndex(c=>c.id===client.id);
        if(index===-1) return false;
        this.clients[index]=client;
        return true;
    }
    delete(id: number): Client | null {
        const index=this.clients.findIndex(c=> c.id===id);
        if(index===-1) return null;
        const deleted=this.clients[index]!;
        this.clients.splice(index,1);
        return deleted;
    }



    private getPastDate(weeksAgo: number): string {
        const date = new Date();
        date.setDate(date.getDate() - weeksAgo * 14);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    initializeRepository(): void {
        this.clients = [];

        const workoutTypes:string[] = [
            "HIIT",
            "Strength - Upper Body",
            "Strength - Lower Body",
            "Push Day",
            "Pull Day",
            "Leg Day",
            "Cardio Endurance",
            "Mobility & Recovery"
        ];

        const exercisePool: string[] = [
            "Squats", "Bench Press", "Deadlift", "Pull-ups",
            "Burpees", "Kettlebell Swings", "Lunges", "Plank",
            "Rowing", "Jump Rope", "Shoulder Press"
        ];

        const getRandomExercises = (workoutId: number) => {
            const exercises = [];
            const count = 3 + (workoutId % 3);

            for (let i = 0; i < count; i++) {
                exercises.push({
                    id: workoutId * 10 + i,
                    name: exercisePool[(workoutId + i) % exercisePool.length]!,
                    sets: 3 + (i % 2),
                    reps: 8 + (i * 2),
                    weight: 20 + (i * 5)
                });
            }

            return exercises;
        };

        const makeWorkouts = (clientId: number, count: number) => {
            const workouts = [];

            for (let i = 1; i <= count; i++) {
                workouts.push({
                    id: clientId * 100 + i,
                    name: workoutTypes[(i + clientId) % workoutTypes.length]!,
                    exercises: getRandomExercises(clientId * 100 + i)
                });
            }

            return workouts;
        };

        const getMondayDate = (weeksAgo: number) => {
            const date = new Date();
            date.setDate(date.getDate() - weeksAgo * 14);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        };

        const makeMeasurements = (baseWeight: number, trend: number) => {
            return [
                {
                    id: 1,
                    height: 175,
                    weight: baseWeight,
                    muscularMassPercent: 32,
                    fatMassPercent: 18,
                    boneMassPercent: 12,
                    leanBodyMassPercent: 38,
                    date: getMondayDate(4)
                },
                {
                    id: 2,
                    height: 175,
                    weight: baseWeight + trend,
                    muscularMassPercent: 33,
                    fatMassPercent: 17,
                    boneMassPercent: 12,
                    leanBodyMassPercent: 38,
                    date: getMondayDate(2)
                },
                {
                    id: 3,
                    height: 175,
                    weight: baseWeight + trend * 2,
                    muscularMassPercent: 34,
                    fatMassPercent: 16,
                    boneMassPercent: 12,
                    leanBodyMassPercent: 38,
                    date: getMondayDate(0)
                }
            ];
        };

        const clientsData = [
            {
                id: 1,
                name: "Andrei Popescu",
                age: 26,
                workouts: makeWorkouts(1, 6), 
                measurements: makeMeasurements(72, 1)
            },
            {
                id: 2,
                name: "Maria Ionescu",
                age: 27,
                workouts: makeWorkouts(2, 4),
                measurements: makeMeasurements(60, -0.5)
            },
            {
                id: 3,
                name: "Alexandru Stan",
                age: 25,
                workouts: makeWorkouts(3, 3),
                measurements: makeMeasurements(80, 0.8)
            },
            {
                id: 4,
                name: "Elena Dumitrescu",
                age: 30,
                workouts: makeWorkouts(4, 5),
                measurements: makeMeasurements(65, -1)
            },
            {
                id: 5,
                name: "Radu Mihai",
                age: 28,
                workouts: makeWorkouts(5, 2),
                measurements: makeMeasurements(90, 0.3)
            },
            {
                id: 6,
                name: "Ioana Georgescu",
                age: 29,
                workouts: makeWorkouts(6, 7), 
                measurements: makeMeasurements(58, -0.8)
            }
        ];

        this.clients = clientsData;
    }

}