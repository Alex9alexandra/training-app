import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../AddWorkoutPage/AddWorkoutPage.css"; 
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title/Title";
import Button from "../../components/Button/Button";
import type { Exercise } from "../../domain/Exercise";  
import type { Client } from "../../domain/Client";
import type { Workout } from "../../domain/Workout";
const UpdateWorkoutPage: React.FC = () => {
  const { clientId, workoutId } = useParams();

  const clientIdNumber = Number(clientId);
  const workoutIdNumber = Number(workoutId);

  const [client, setClient] = useState<Client | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const {service,tracker}=useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const clientData = await service.getClient(clientIdNumber);
      setClient(clientData);

      const workouts = await service.getWorkouts(clientIdNumber, 1, 50);
      const current = workouts.data.find(w => w.id === workoutIdNumber);
      setExercises(current ? current.exercises : []);
    };

    loadData();
  }, [clientIdNumber, workoutIdNumber, location.key]);

  const handleAddExercise = () => {
    navigate(`/workout/${clientIdNumber}/${workoutIdNumber}/add-exercise`);
  };

  const handleDeleteExercise = async () => {
    if (selectedExerciseId === null) {
      alert("Select an exercise first!");
      return;
    }

    const exercise=exercises.find(ex=>ex.id===selectedExerciseId);
    await service.deleteExercise(clientIdNumber, workoutIdNumber, selectedExerciseId);
    tracker.trackAction("delete",`Exercise: ${exercise?.name ?? selectedExerciseId}`)
    setExercises(prev=>prev.filter(ex=>ex.id!==selectedExerciseId));
    setSelectedExerciseId(null);
  };

  

  React.useEffect(() => {
    tracker.trackPage("UpdateWorkoutPage");
  }, []);

  if(client === null) return <div>Loading...</div>;
  return (
    <div className="add-workout-page">

      <Title title="Exercises" />

      <table className="exercise-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Weight / kg</th>
          </tr>
        </thead>

        <tbody>
          {exercises.map((ex) => (
            <tr
              key={ex.id}
              onClick={() => setSelectedExerciseId(ex.id)}
              className={selectedExerciseId === ex.id ? "selected" : ""}
            >
              <td>{ex.name}</td>
              <td>{ex.sets}</td>
              <td>{ex.reps}</td>
              <td>{ex.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="exercise-buttons">
        <Button onClick={handleAddExercise} text="Add Exercise" />
        <Button onClick={handleDeleteExercise} text="Delete Exercise" />
      </div>
    </div>
  );
};

export default UpdateWorkoutPage;