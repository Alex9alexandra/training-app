import React, { useState } from "react";
import { replace, useNavigate, useParams } from "react-router-dom";
import Title from "../../components/Title/Title";
import Button from "../../components/Button/Button";
import "./AddExercisePage.css";
import { useAppContext } from "../../context/AppContext";

const AddExercisePage: React.FC = () => {
  const { clientId, workoutId } = useParams();
  const navigate = useNavigate();
  const {service,tracker}=useAppContext();

  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  React.useEffect(() => {
    tracker.trackPage("AddExercisePage");
  }, []);

  const handleSave = async () => {
    if (!name || !sets || !reps || !weight) {
      alert("All fields are required!");
      return;
    }

    const newExercise = {
      id: Date.now(),
      name,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight)
    };

    try {
      await service.addExercise(Number(clientId), Number(workoutId), newExercise);

      tracker.trackAction("add", `Exercise: ${name}`);

      navigate(`/workout/update/${clientId}/${workoutId}`, {
        replace: true,
        state: { refresh: true }
      });

    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add exercise");
    }
  };

  return (
    <div className="add-exercise-page">
      <Title title="ADD NEW EXERCISE" />
      <div className="form-container">
        <div className="input-group">
          <label htmlFor="name-input">Name:</label>
          <input id="name-input" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="input-group">
          <label htmlFor="sets-input">Sets:</label>
          <input id="sets-input" type="number" value={sets} onChange={e => setSets(e.target.value)} />
        </div>

        <div className="input-group">
          <label htmlFor="reps-input">Reps:</label>
          <input id="reps-input" type="number" value={reps} onChange={e => setReps(e.target.value)} />
        </div>

        <div className="input-group">
          <label htmlFor="weight-input">Weight / kg:</label>
          <input id="weight-input" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>

        <Button onClick={handleSave} text="Save" />
      </div>
    </div>
  );
};

export default AddExercisePage;