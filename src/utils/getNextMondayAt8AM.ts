export const getNextMondayAt8AM = (): Date => {
  const now = new Date();

  // Clona a data atual
  const date = new Date(now);
  const day = date.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado

  // Calcula quantos dias faltam para a próxima segunda-feira
  const daysUntilMonday = (8 - day) % 7 || 7;

  date.setDate(date.getDate() + daysUntilMonday);
  date.setHours(8, 0, 0, 0); // 08:00:00.000

  return date;
};
