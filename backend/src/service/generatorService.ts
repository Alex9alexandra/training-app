import { createFakeClient} from "./fakerService";
import { PrismaClientRepo } from "../repository/PrismaClientRepo";


type BroadcastFn = (msg:any)=>void;
let interval: NodeJS.Timeout | null = null;

export function startGenerator(repo:PrismaClientRepo, broadcast:BroadcastFn) {
  if (interval) return;

  interval = setInterval(async () => {
    const batch=[];
    for(let i=0;i<3;i++){
        const fakeClient=createFakeClient();
        const client=await repo.addAsync(fakeClient);
        batch.push(client);
    }

    broadcast({
      type: "CLIENTS_BATCH_CREATED",
      payload: batch
    });
  }, 2000);
}

export function stopGenerator() {
  if (interval) {
    clearInterval(interval);
    interval = null;
    console.log("Generator stopped");
  }
}