export const validateWorkout = (workout: any): string | null => {
  if (!workout) return "Workout is required";

  if (typeof workout.name !== "string" || workout.name.trim() === "") {
    return "Invalid workout name";
  }

  return null;
};