import type { Measurement } from "../domain/Measurement";

export const validateMeasurement = (measurement: any): string | null => {
  if (!measurement) return "Measurement is required";

  if (typeof measurement.id !== "number" || measurement.id <= 0) {
    return "Invalid measurement id";
  }

  if (typeof measurement.height !== "number" || measurement.height <= 0) {
    return "Invalid height";
  }

  if (typeof measurement.weight !== "number" || measurement.weight <= 0) {
    return "Invalid weight";
  }

  if (
    typeof measurement.muscularMassPercent !== "number" ||
    measurement.muscularMassPercent < 0 ||
    measurement.muscularMassPercent > 100
  ) {
    return "Invalid muscular mass percent";
  }

  if (
    typeof measurement.fatMassPercent !== "number" ||
    measurement.fatMassPercent < 0 ||
    measurement.fatMassPercent > 100
  ) {
    return "Invalid fat mass percent";
  }

  if (
    typeof measurement.boneMassPercent !== "number" ||
    measurement.boneMassPercent < 0 ||
    measurement.boneMassPercent > 100
  ) {
    return "Invalid bone mass percent";
  }

  if (
    typeof measurement.leanBodyMassPercent !== "number" ||
    measurement.leanBodyMassPercent < 0 ||
    measurement.leanBodyMassPercent > 100
  ) {
    return "Invalid lean body mass percent";
  }

  if (typeof measurement.date !== "string" || measurement.date.trim() === "") {
    return "Invalid date";
  }

  const parsedDate = Date.parse(measurement.date);
  if (isNaN(parsedDate)) {
    return "Invalid date format";
  }

  return null;
};