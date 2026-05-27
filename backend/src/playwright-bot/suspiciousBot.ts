import https from "https";
import fetch from "node-fetch";

const BASE_URL = "https://192.168.0.102:3000";

const agent = new https.Agent({ rejectUnauthorized: false });

interface Step1Response { tempToken: string; securityQuestion: string; }
interface Step2Response { tempToken: string; }
interface Step3Response { token: string; }

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    agent,
  } as any);
  return res.json() as Promise<T>;
}

async function apiGet(path: string, token: string): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    agent,
  } as any);
  return res.json();
}

async function login(): Promise<string> {
  console.log("[BOT] Step 1: login...");
  const step1 = await apiPost<Step1Response>("/auth/login", {
    username: "test.user",
    password: "user123",
  });
  console.log("[BOT] Step 1 response:", step1);

  console.log("[BOT] Step 2: verify security question...");
  const step2 = await apiPost<Step2Response>("/auth/verify-question", {
    tempToken: step1.tempToken,
    securityAnswer: "pet",
  });
  console.log("[BOT] Step 2 response:", step2);

  console.log("[BOT] Step 3: verify pin...");
  const step3 = await apiPost<Step3Response>("/auth/verify-pin", {
    tempToken: step2.tempToken,
    pin: "1234",
  });
  console.log("[BOT] Step 3 response:", step3);

  if (!step3.token) {
    throw new Error("Login failed — no token received");
  }

  console.log("[BOT] Login successful");
  return step3.token;
}

async function runSuspiciousBehaviour(token: string) {
  console.log("\n[BOT] Starting suspicious behaviour simulation...\n");

  console.log("[BOT] Behaviour 1: Rapid scraping of all endpoints...");
  const endpoints = [
    "/clients",
    "/statistics",
    "/group-classes/stats-naive",
    "/group-classes/stats-optimized",
    "/clients",
    "/statistics",
    "/group-classes/stats-optimized",
    "/clients",
    "/statistics",
    "/clients",
  ];

  for (const ep of endpoints) {
    await apiGet(ep, token);
    console.log(`  [BOT] Hit: ${ep}`);
  }

  console.log("\n[BOT] Behaviour 2: Rapid repeated login attempts...");
  for (let i = 0; i < 8; i++) {
    await apiPost("/auth/login", {
      username: "test.user",
      password: i % 3 === 0 ? "user123" : "wrongpassword",
    });
    console.log(`  [BOT] Login attempt ${i + 1}`);
  }

  console.log("\n[BOT] Behaviour 3: Mass data harvesting — fetching all clients...");
  const clients = await apiGet("/clients", token) as any[];
  if (Array.isArray(clients)) {
    const toFetch = clients.slice(0, 20);
    for (const client of toFetch) {
      await apiGet(`/clients/${client.id}`, token);
      console.log(`  [BOT] Fetched client ${client.id}`);
    }
  }

  console.log("\n[BOT] Behaviour 4: Hammering stats endpoint 15 times...");
  for (let i = 0; i < 15; i++) {
    await apiGet("/group-classes/stats-naive", token);
    console.log(`  [BOT] Stats hit ${i + 1}`);
  }

  console.log("\n[BOT] Simulation complete.");
}

async function main() {
  try {
    const token = await login();
    await runSuspiciousBehaviour(token);

    console.log("\n[BOT] Now check your server logs or call:");
    console.log(`  GET ${BASE_URL}/monitoring/analyse`);
    console.log("to see what the AI detected.\n");
  } catch (err) {
    console.error("[BOT] Error:", err);
  }
}

main();
