import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import ClientDetailsPage from "./pages/ClientDetailsPage/ClientDetailsPage";
import Layout from "./layout/Layout"
import AddWorkoutPage from "./pages/AddWorkoutPage/AddWorkoutPage";
import AddExercisePage from "./pages/AddExercisePage/AddExercisePage"
import UpdateWorkoutPage from "./pages/UpdateWorkoutPage/UpdateWorkoutPage";
import { syncOperations } from "./offline/syncService";
import { useEffect, useRef, useState } from "react";
import MeasurementsTable from "./pages/MeasurementsTablePage/MeasurementsTablePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import { useAppContext } from "./context/AppContext";
import ClientDashboardPage from "./pages/ClientDashboardPage/ClientDashboardPage";
import Chat from "./components/Chat/Chat";
import { authStore } from "./auth/authStore";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = API_URL.replace(/^https/, "wss");

function App() {

  const wsRef = useRef<WebSocket | null>(null);
  const { loggedUser, setLoggedUser } = useAppContext();
  async function isBackendAlive(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/ping`); 
      return res.ok;
    } catch {
      return false;
    }
}

  useEffect(() => {
    if (!loggedUser) return;
    const interval = setInterval(async () => {
      const alive = await isBackendAlive();

      if (alive) {
        console.log("Backend back → syncing...");
        await syncOperations();
        clearInterval(interval); 
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loggedUser]);

  useEffect(() => {
    if (!loggedUser) return;
    const ws = new WebSocket(`${WS_URL}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {

      const msg = JSON.parse(event.data);

      console.log("WS message:", msg);

      if (msg.type === "CLIENTS_BATCH_CREATED") {
        window.dispatchEvent(new Event("ws-update"));
      }

      if (msg.type === "CHAT_MESSAGE") {
        window.dispatchEvent(new CustomEvent("ws-chat", { detail: msg }));
      }

    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      
    };

    return () => {
      ws.close();
    };
  }, [loggedUser]);

  useEffect(() => {
    const handler = (e: Event) => {
      wsRef.current?.send(JSON.stringify((e as CustomEvent).detail));
    };
    window.addEventListener("ws-send", handler as EventListener);
    return () => window.removeEventListener("ws-send", handler as EventListener);
  }, []);

if (!loggedUser) {
    return <LoginPage onLogin={(user) => setLoggedUser(user)} />;
  }

  if (loggedUser.role === "admin") {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/client/:id" element={<ClientDetailsPage />} />
            <Route path="/workout/add/:clientId" element={<AddWorkoutPage />} />
            <Route path="/exercise/add" element={<AddExercisePage />} />
            <Route path="/workout/:clientId/:workoutId/add-exercise" element={<AddExercisePage />} />
            <Route path="/workout/update/:clientId/:workoutId" element={<UpdateWorkoutPage />} />
            <Route path="/workout/:clientId/:workoutId" element={<AddWorkoutPage />} />
            <Route path="/client/:id/measurements" element={<MeasurementsTable />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
        <Chat />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Navigate to="/client-dashboard" />} />
          <Route path="/client-dashboard" element={<ClientDashboardPage />} />
          <Route path="*" element={<Navigate to="/client-dashboard" />} />
        </Route>
      </Routes>
      <Chat />
    </BrowserRouter>
  );
}

export default App;