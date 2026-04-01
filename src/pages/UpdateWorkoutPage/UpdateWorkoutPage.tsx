import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../AddWorkoutPage/AddWorkoutPage.css"; 
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title/Title";
import Button from "../../components/Button/Button";

const UpdateWorkoutPage: React.FC = () => {
  const { clientId, workoutId } = useParams();

  const clientIdNumber = Number(clientId);
  const workoutIdNumber = Number(workoutId);

  const {service,tracker}=useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const client = service.getClient(clientIdNumber);
  if (!client) return <div>Client not found</div>;

  const [version, setVersion] = useState(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const workouts = service.getWorkouts(clientIdNumber) ?? [];
  const currentWorkout = workouts.find(w => w.id === workoutIdNumber);
  const exercises = currentWorkout?.exercises ?? [];

  const handleAddExercise = () => {
    navigate(`/workout/${clientIdNumber}/${workoutIdNumber}/add-exercise`);
  };

  const handleDeleteExercise = () => {
    if (selectedExerciseId === null) {
      alert("Select an exercise first!");
      return;
    }

    const exercise=exercises.find(ex=>ex.id===selectedExerciseId);
    service.deleteExercise(clientIdNumber, workoutIdNumber, selectedExerciseId);
    tracker.trackAction("delete",`Exercise: ${exercise?.name ?? selectedExerciseId}`)
    setSelectedExerciseId(null);
    setVersion(v => v + 1); 
  };

  React.useEffect(() => {
    setVersion(v => v + 1);
  }, [location.key]);

  React.useEffect(() => {
    tracker.trackPage("UpdateWorkoutPage");
  }, []);

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