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

  const [workouts, setWorkouts] = useState({
    data: [] as Workout[],
    totalPages: 1,
    page: 1
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = async (pageNumber:number) => {
    const data = await service.getWorkouts(clientId, pageNumber,5);
    setWorkouts(data);
  };

  const handleDelete = async () => {
    if (selectedId === null) return alert("Select a workout first!");
      await service.deleteWorkout(clientId, selectedId);
      await load(workouts.page);
      setSelectedId(null); 
  };

  React.useEffect(() => {
    load(workouts.page);
  }, [clientId,workouts.page,service]);
  
  
  return (
    <div className="workout-container">
      <div className="title">
        <Title title="Workouts" />
      </div>
      <div className="workout-content">
        <div><WorkoutList workouts={workouts} onSelect={setSelectedId} onPageChange={(newPage) => load(newPage)} page={workouts.page} /></div>
        <div><WorkoutButtons selectedId={selectedId} clientId={clientId} onDelete={handleDelete} /></div>
      </div>
    </div>
  );
};

export default WorkoutComp;