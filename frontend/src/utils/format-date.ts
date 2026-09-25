const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface DateParts {
  y: number;
  m: number;
  d: number;
}

function parseParts(value: string): DateParts | null {
  const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(value);
  if (match) {
    const parts = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
    return parts.m >= 1 && parts.m <= 12 ? parts : null;
  }

  // Formatos como "Fri, 15 Nov 2024 00:00:00 GMT" (los usa /getApplicationStatus).
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return { y: parsed.getUTCFullYear(), m: parsed.getUTCMonth() + 1, d: parsed.getUTCDate() };
}

/** 2024-03-02 -> 02/03/2024 */
export function formatDate(value: string): string {
  const parts = parseParts(value);
  if (!parts) return value;
  return `${String(parts.d).padStart(2, '0')}/${String(parts.m).padStart(2, '0')}/${parts.y}`;
}

/** 2020/06/14 -> jun 2020 */
export function formatMonthYear(value: string): string {
  const parts = parseParts(value);
  if (!parts) return value;
  return `${MONTHS[parts.m - 1]} ${parts.y}`;
}