import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./AddWorkoutPage.css";
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title/Title";
import Button from "../../components/Button/Button";
import type { Exercise } from "../../domain/Exercise";
import type { Workout } from "../../domain/Workout";


const AddWorkoutPage: React.FC = () => {

  

  const {service,tracker}=useAppContext();
  const { clientId, workoutId: routeWorkoutId } = useParams();
  const clientIdNumber = Number(clientId);
  const client = service.getClient(clientIdNumber);
  const location = useLocation();
  const navigate = useNavigate();

  if (!client) return <div>Client not found</div>;

  const [workoutId, setWorkoutId] = useState<number | null>(
    routeWorkoutId ? Number(routeWorkoutId) : null
  );
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [version, setVersion] = useState(0); // for delete refresh



  const handleSave = () => {
    if (!name.trim()) {
      alert("Workout name required!");
      return;
    }

    const newWorkout: Workout = {
      id: Date.now(),
      name,
      exercises: []
    };

    // ✅ Check the result of the add operation
    const success = service.addWorkout(clientIdNumber, newWorkout);
    tracker.trackAction("add", `Workout: ${name}`);
    if (success) {
      setWorkoutId(newWorkout.id);
    } else {
      alert("Failed to save workout!"); // 👈 This is the line your test is looking for!
    }
  };

  const handleAddExercise = () => {
    if (!workoutId) {
      alert("Save workout first!");
      return;
    }

    navigate(`/workout/${clientIdNumber}/${workoutId}/add-exercise`);
  };

  const handleDeleteExercise = () => {
    if (selectedExerciseId === null) {
      alert("Select an exercise first!");
      return;
    }

    service.deleteExercise(clientIdNumber, workoutId!, selectedExerciseId);
    setSelectedExerciseId(null);
    setVersion(v => v + 1); // trigger refresh
  };

  // ✅ Refresh exercises whenever workoutId changes, version changes, or location.state triggers
  useEffect(() => {
    if (!workoutId) {
      setExercises([]);
      return;
    }

    const latestWorkout = service.getWorkouts(clientIdNumber)?.find(w => w.id === workoutId);
    setExercises(latestWorkout ? [...latestWorkout.exercises] : []);
  }, [service, clientIdNumber, workoutId, location.key, location.state, version]);

  React.useEffect(() => {
    tracker.trackPage("AddWorkoutPage");
  }, []);

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
        <button id="saveButton" data-testid="saveWorkoutButton" onClick={handleSave} disabled={!name}>Save</button>
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