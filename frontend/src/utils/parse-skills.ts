export const parseSkills = (skills: string | null | undefined): string[] =>
  (skills ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);