import {ClientService} from "./ClientService";
import { ClientMemoryRepo } from "../repository/ClientMemoryRepo";

const repo=new ClientMemoryRepo();
export const clientService=new ClientService(repo);