import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import ClientDetailsPage from "./pages/ClientDetailsPage/ClientDetailsPage";
import Layout from "./layout/Layout"
import AddWorkoutPage from "./pages/AddWorkoutPage/AddWorkoutPage";
import AddExercisePage from "./pages/AddExercisePage/AddExercisePage"
import UpdateWorkoutPage from "./pages/UpdateWorkoutPage/UpdateWorkoutPage";
import { syncOperations } from "./offline/syncService";
import { useEffect } from "react";
function App() {

  async function isBackendAlive(): Promise<boolean> {
    try {
      const res = await fetch("http://localhost:3000/clients");
      return res.ok;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const alive = await isBackendAlive();

      if (alive) {
        console.log("Backend back → syncing...");
        await syncOperations();
        clearInterval(interval); 
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      console.log("WS message:", msg);

      if (msg.type === "CLIENTS_BATCH_CREATED") {
        window.dispatchEvent(new Event("ws-update"));
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <BrowserRouter> 
      <Routes> 
        <Route path="/" element={<Layout />}> 
          <Route path="/" element={<DashboardPage />} /> 
          <Route path="/client/:id" element={<ClientDetailsPage/>}/> 
          <Route path="/workout/add/:clientId" element={<AddWorkoutPage />} />
          <Route path="/exercise/add" element={<AddExercisePage />} />
          <Route path="/workout/:clientId/:workoutId/add-exercise" element={<AddExercisePage />} />
          <Route path="/workout/update/:clientId/:workoutId" element={<UpdateWorkoutPage />} />
          <Route path="/workout/:clientId/:workoutId" element={<AddWorkoutPage />} />
        </Route> 
      </Routes> 
    </BrowserRouter>
  );
}

export default App;