import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./AddWorkoutPage.css";
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title/Title";
import Button from "../../components/Button/Button";
import type { Exercise } from "../../domain/Exercise";
import type { Client } from "../../domain/Client";
const AddWorkoutPage: React.FC = () => {

  

  const {service,tracker}=useAppContext();
  const { clientId, workoutId: routeWorkoutId } = useParams();
  const clientIdNumber = Number(clientId);
  const [client, setClient] = useState<Client | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [workoutId, setWorkoutId] = useState<number | null>(
    routeWorkoutId ? Number(routeWorkoutId) : null
  );
  const [name, setName] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [version, setVersion] = useState(0); 

  useEffect(() => {
    const loadClient=async () =>{
      const data=await service.getClient(clientIdNumber);
      setClient(data); 
    };
    loadClient();
  },[clientIdNumber]);


  const handleSave = async () => {
    if (!name.trim()) {
      alert("Workout name required!");
      return;
    }

    const newWorkout = {
      id: Date.now(),
      name,
      exercises: []
    };

    const result = await service.addWorkout(clientIdNumber, newWorkout);
    tracker.trackAction("add", `Workout: ${name}`);
    if (result) {
      setWorkoutId(result.id);
    } else {
      alert("Failed to save workout!");
    }
  };

  const handleAddExercise = () => {
    if (!workoutId) {
      alert("Save workout first!");
      return;
    }

    navigate(`/workout/${clientIdNumber}/${workoutId}/add-exercise`);
  };

  const handleDeleteExercise = async () => {
    if (selectedExerciseId === null) {
      alert("Select an exercise first!");
      return;
    }

    await service.deleteExercise(clientIdNumber, workoutId!, selectedExerciseId);
    setSelectedExerciseId(null);
    setVersion(v => v + 1);
  };

  useEffect(() => {
    const loadExercises = async () => {
      if (!workoutId) {
        setExercises([]);
        return;
      }

      const workouts = await service.getWorkouts(clientIdNumber, 1, 50);
      const current = workouts?.data?.find(w => w.id === workoutId);
      setExercises(current ? [...current.exercises] : []);
    };
    loadExercises();
  }, [clientIdNumber, workoutId, location.key,version]);

  React.useEffect(() => {
    tracker.trackPage("AddWorkoutPage");
  }, []);

  
  if (client===null) return <div>Loading...</div>;

  return (
    <div className="add-workout-page">
      <Title title="ADD NEW WORKOUT" />

      <div className="workout-header">
        <label htmlFor="workoutName">Workout Name</label>
        <input
          id="workoutName"
          value={name}
          onChange={e => setName(e.target.value)}
          className="workout-input"
        />
        <button id="saveButton" data-testid="saveWorkoutButton" onClick={handleSave}>Save</button>
      </div>

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
          {exercises.map(ex => (
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

export default AddWorkoutPage;