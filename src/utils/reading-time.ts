// Reading time in whole minutes at 200 words a minute, at least 1. Null when there is no text.
export const readingMinutes = (body?: string): number | null => {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return words > 0 ? Math.max(1, Math.round(words / 200)) : null;
};
