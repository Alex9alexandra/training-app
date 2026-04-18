export const validateId = (id: any): string | null => {
  const num = Number(id);
  if (isNaN(num) || num <= 0) {
    return "Invalid ID";
  }
  return null;
};