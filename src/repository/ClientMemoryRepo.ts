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
    add(client: Client): void {
        this.clients.push(client);
    }
    update(client: Client): boolean {
        const index= this.clients.findIndex(c=>c.id===client.id);
        if(index===-1) return false;
        this.clients[index]=client;
        return true;
    }
    delete(id: number): boolean {
        const index=this.clients.findIndex(c=> c.id===id);
        if(index===-1) return false;
        this.clients.splice(index,1);
        return true;
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

        const client1: Client = {
            id: 1,
            name: "Ana",
            age: 25,
            workouts: [
                {
                    id: 1,
                    name: "Flexibility Training",
                    exercises: [
                        { id: 1, name: "Stretching", sets: 3, reps: 10 ,weight:0},
                        { id: 2, name: "Yoga", sets: 2, reps: 8,weight:0 }
                    ]
                },
                {
                    id: 2,
                    name: "Strength Training",
                    exercises: [
                        { id: 3, name: "Push-ups", sets: 3, reps: 12 ,weight:0},
                        { id: 4, name: "Squats", sets: 3, reps: 15,weight:0 }
                    ]
                }
            ],
            measurements: [
                {
                    height: 170,
                    weight: 60,
                    muscularMassPercent: 30,
                    fatMassPercent: 20,
                    boneMassPercent: 10,
                    leanBodyMassPercent: 40,
                    date: this.getPastDate(0)
                },
                {
                    height: 170,
                    weight: 62,
                    muscularMassPercent: 28,
                    fatMassPercent: 22,
                    boneMassPercent: 10,
                    leanBodyMassPercent: 40,
                    date: this.getPastDate(1)
                }
            ]
        };

        const client2: Client = {
            id: 2,
            name: "Maria",
            age: 30,
            workouts: [
                {
                    id: 3,
                    name: "Cardio Training",
                    exercises: [
                        { id: 5, name: "Running", sets: 1, reps: 30,weight:0 },
                        { id: 6, name: "Cycling", sets: 1, reps: 20,weight:0 }
                    ]
                },
                {
                    id: 4,
                    name: "HIIT",
                    exercises: [
                        { id: 7, name: "Burpees", sets: 3, reps: 10 ,weight:0},
                        { id: 8, name: "Jump Squats", sets: 3, reps: 12 ,weight:0}
                    ]
                }
            ],
            measurements: []
        };

        for (let i = 0; i < 6; i++) {
            client2.measurements.push({
                height: 165,
                weight: 70 - i,
                muscularMassPercent: 25 + i,
                fatMassPercent: 30 - i,
                boneMassPercent: 10,
                leanBodyMassPercent: 35 + i,
                date: this.getPastDate(i)
            });
        }

        this.clients.push(client1);
        this.clients.push(client2);
    }

}