import {ClientService} from "./ClientService";
import { ClientMemoryRepo } from "../repository/ClientMemoryRepo";
import { PrismaClientRepo } from "../repository/PrismaClientRepo";

export const repo=new PrismaClientRepo();
export const clientService=new ClientService(repo);
