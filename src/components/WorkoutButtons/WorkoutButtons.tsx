import React,{useState} from "react";
import "./WorkoutButtons.css";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";

type WorkoutButtonsProps = {
  selectedId: number | null;
  clientId: number;
  onDelete:()=>void;
};

const WorkoutButtons: React.FC<WorkoutButtonsProps> = ({ selectedId,clientId ,onDelete}) => {
  const navigate = useNavigate();
  const handleAdd = () => {
    navigate(`/workout/add/${clientId}`);
  };


  const handleUpdate = () => {
    if (selectedId === null) {
      alert("Select a workout first!");
      return;
    }

    navigate(`/workout/update/${clientId}/${selectedId}`);
  };

  return (
    <div className="workout-buttons">
      <div className="top">
        <Button text="Add" onClick={handleAdd} />
      </div>

      <div className="bottom">
        <Button text="Delete" onClick={onDelete} />
        <Button text="Update" onClick={handleUpdate} />
      </div>
    </div>
  );
};

export default WorkoutButtons;