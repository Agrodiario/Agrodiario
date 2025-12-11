/**
 * Converte uma string de data (YYYY-MM-DD ou ISO) para um objeto Date
 * sem problemas de timezone
 */
export function parseDateSafe(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }

  // Se tem 'T' é ISO, pega apenas a parte da data
  const dateOnly = dateString.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);

  // Cria a data no timezone local
  return new Date(year, month - 1, day);
}

/**
 * Formata uma data para o formato brasileiro dd/mm/yyyy
 */
export function formatDateBR(date: string | Date): string {
  const d = parseDateSafe(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Converte data do formato dd/mm/yyyy para YYYY-MM-DD
 */
export function formatDateISO(dateBR: string): string {
  const [day, month, year] = dateBR.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
