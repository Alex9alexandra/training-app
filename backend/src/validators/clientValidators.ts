export const validateClient = (client: any): string | null => {
  if (!client) return "Client is required";

  if (typeof client.name !== "string" || client.name.trim() === "") {
    return "Invalid client name";
  }

  return null;
};