import { repo } from "./clientServiceInstance";
import { StatisticsService } from "./statisticsService";

export const statisticsService = new StatisticsService(repo);