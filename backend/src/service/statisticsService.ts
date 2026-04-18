import { IClientRepo } from "../repository/IClientRepo";
import { Client } from "../domain/Client";

export class StatisticsService {
  constructor(private clientRepo: IClientRepo) {}

  getStatistics() {
    const clients: Client[] = this.clientRepo.getAll();

    const totalClients = clients.length;

    const clientsActivity = clients.map((c: Client) => ({
      name: c.name,
      workouts: c.workouts.length
    }));

    let mostActiveClient = { name: "", workouts: 0 };

    clientsActivity.forEach(c => {
      if (c.workouts > mostActiveClient.workouts) {
        mostActiveClient = c;
      }
    });

    const totalWorkouts = clients.reduce(
      (sum: number, c: Client) => sum + c.workouts.length,
      0
    );

    const averageWorkouts =
      totalClients === 0 ? 0 : totalWorkouts / totalClients;

    return {
      totalClients,
      mostActiveClient,
      averageWorkouts,
      clientsActivity
    };
  }
}