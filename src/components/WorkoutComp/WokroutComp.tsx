import React, { useState } from "react";
import { type Workout } from "../../domain/Workout"; // import from domain
import "./WorkoutComp.css";

import Title from "../Title/Title";
import WorkoutList from "../WorkoutList/WorkoutList";
import WorkoutButtons from "../WorkoutButtons/WorkoutButtons";
import { useAppContext } from "../../context/AppContext";
import { useLocation } from "react-router-dom";
type WorkoutCompProps = {
  clientId: number;
};


const WorkoutComp: React.FC<WorkoutCompProps> = ({ clientId }) => {
  const {service,tracker}=useAppContext();

  const [workouts, setWorkouts] = useState<Workout[]>(service.getWorkouts(clientId) ?? []);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleDelete = () => {
        if (selectedId === null) return alert("Select a workout first!");
          service.deleteWorkout(clientId, selectedId);
          setWorkouts(service.getWorkouts(clientId) ?? []); 
          setSelectedId(null); 
  };
  const location = useLocation();

  React.useEffect(() => {
    setWorkouts(service.getWorkouts(clientId) ?? []);
  }, [location]);
  return (
    <div className="workout-container">
      <div className="title">
        <Title title="Workouts" />
      </div>
      <div className="workout-content">
        <div><WorkoutList workouts={workouts} onSelect={setSelectedId} /></div>
        <div><WorkoutButtons selectedId={selectedId} clientId={clientId} onDelete={handleDelete} /></div>
      </div>
    </div>
  );
};

export default WorkoutComp;