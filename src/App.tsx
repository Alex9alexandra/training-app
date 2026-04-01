import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import ClientDetailsPage from "./pages/ClientDetailsPage/ClientDetailsPage";
import Layout from "./layout/Layout"
import AddWorkoutPage from "./pages/AddWorkoutPage/AddWorkoutPage";
import AddExercisePage from "./pages/AddExercisePage/AddExercisePage"
import UpdateWorkoutPage from "./pages/UpdateWorkoutPage/UpdateWorkoutPage";
function App() {
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