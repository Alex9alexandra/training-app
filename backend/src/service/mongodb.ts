import { MongoClient, Db } from "mongodb";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

let db: Db;

export async function connectMongo() {
  try{
    const client = new MongoClient(process.env.MONGODB_URL!, {
      family: 4,
    });
    await client.connect();
    db = client.db("FitnessChat");
    console.log("Connected to MongoDB");
  }catch(err){
    console.error("MongoDB connection failed:", err);
  }
  
}

export function getDb(): Db {
  return db;
}