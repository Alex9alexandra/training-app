import React from "react";
import "./WorkoutDetailsModal.css";

import type { Workout } from "../../domain/Workout";

type WorkoutDetailsModalProps = {
    workout: Workout | null;
    onClose: () => void;
};

const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({
    workout,
    onClose
}) => {

    if (!workout) return null;

    return (
        <div className="workout-modal-overlay" onClick={onClose}>

            <div
                className="workout-modal-content"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="workout-modal-header">
                    {workout.name}
                </div>

                <div className="workout-modal-body">

                    {workout.exercises.map(ex => (
                        <div key={ex.id} className="exercise-line">
                            {ex.name} * {ex.sets} * {ex.reps} ({ex.weight} kg)
                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
};

export default WorkoutDetailsModal;