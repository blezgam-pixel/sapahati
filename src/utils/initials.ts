/**
 * Helper to generate 2-letter initials from a person's name,
 * filtering out academic/professional titles (Dr., M.Psi., S.Psi., Psikolog, etc.)
 */
export function getPsychologistInitials(name: string): string {
  if (!name) return 'PS';

  // Strip common academic/professional titles and symbols
  const cleaned = name
    .replace(/(Dr\.|S\.Psi\.|M\.Psi\.|Psikolog|Prof\.|Sp\.KJ|,|\.)/gi, ' ')
    .trim();

  const words = cleaned.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return 'PS';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

  // First letter of first word + First letter of last word
  const first = words[0][0];
  const last = words[words.length - 1][0];
  return (first + last).toUpperCase();
}
