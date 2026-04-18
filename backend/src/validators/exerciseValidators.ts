export const validateExercise = (exercise: any): string | null => {
  if (!exercise) return "Exercise is required";

  if (typeof exercise.name !== "string" || exercise.name.trim() === "") {
    return "Invalid name";
  }

  if (typeof exercise.sets !== "number" || exercise.sets <= 0) {
    return "Invalid sets";
  }

  if (typeof exercise.reps !== "number" || exercise.reps <= 0) {
    return "Invalid reps";
  }

  if (typeof exercise.weight !== "number" || exercise.weight < 0) {
    return "Invalid weight";
  }

  return null;
};