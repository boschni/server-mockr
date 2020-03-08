export function fuzzyMatch(value: string, needle: string): boolean {
  const words = needle.trim().split(" ");
  const matchWords = words.every(word => value.includes(word));
  return needle === "" || matchWords;
}
