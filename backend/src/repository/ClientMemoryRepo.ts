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



    //initialization
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

        const makeExercises = (workoutId: number) => [
            { id: workoutId * 10 + 1, name: "Exercise A", sets: 3, reps: 10, weight: 20 },
            { id: workoutId * 10 + 2, name: "Exercise B", sets: 4, reps: 12, weight: 25 }
        ];

        const makeWorkouts = (clientId: number): any[] => {
            const workouts = [];

            for (let i = 1; i <= 6; i++) {
                workouts.push({
                    id: clientId * 100 + i,
                    name: `Workout ${i}`,
                    exercises: makeExercises(clientId * 100 + i)
                });
            }

            return workouts;
        };

        const makeMeasurements = () => [
            {
                height: 170,
                weight: 70,
                muscularMassPercent: 30,
                fatMassPercent: 20,
                boneMassPercent: 10,
                leanBodyMassPercent: 40,
                date: this.getPastDate(0)
            },
            {
                height: 170,
                weight: 72,
                muscularMassPercent: 31,
                fatMassPercent: 21,
                boneMassPercent: 10,
                leanBodyMassPercent: 38,
                date: this.getPastDate(1)
            }
        ];

        for (let c = 1; c <= 6; c++) {
            this.clients.push({
                id: c,
                name: `Client ${c}`,
                age: 20 + c,
                workouts: makeWorkouts(c),
                measurements: makeMeasurements()
            });
        }
    }

}