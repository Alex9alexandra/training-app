import {ClientService} from "./ClientService";
import { ClientMemoryRepo } from "../repository/ClientMemoryRepo";

export const repo=new ClientMemoryRepo();
export const clientService=new ClientService(repo);