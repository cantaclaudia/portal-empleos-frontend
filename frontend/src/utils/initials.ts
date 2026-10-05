/** "Acme Corp" -> "AC". Acepta un nombre completo o varias partes. */
export const getInitials = (...parts: Array<string | null | undefined>): string => {
  const words = parts
    .flatMap((p) => (p ?? '').split(' '))
    .filter(Boolean);
    
  const initials = (parts.length > 1 ? parts.map((p) => (p ?? '').trim()[0] ?? '') : words.slice(0, 2).map((w) => w[0]))
    .join('')
    .toUpperCase();

  return initials || '?';
};