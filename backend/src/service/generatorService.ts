import { createFakeClient} from "./fakerService";
import type {IClientRepo} from "../repository/IClientRepo"

type BroadcastFn = (msg:any)=>void;
let interval: NodeJS.Timeout | null = null;

export function startGenerator(repo:IClientRepo, broadcast:BroadcastFn) {
  if (interval) return;

  interval = setInterval(() => {
    const batch=[];
    for(let i=0;i<3;i++){
        const client=createFakeClient();
        repo.add(client);
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