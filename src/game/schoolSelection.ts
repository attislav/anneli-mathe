export const LAB_GROUPS = [
  { title: "Zahlen und Rechnen", topics: ["targetSteps", "pairs", "dotWays", "window", "detective", "machine", "packets", "split", "chocolate", "portions", "claims", "methods", "family", "rest", "balance", "code", "swap", "estimateLine"] },
  { title: "Raum und Formen", topics: ["viewpoint", "pegs", "growth", "ribbon", "folds", "tiles", "rollCube", "cubes", "tower", "route", "map"] },
  { title: "Messen, Zeit und Geld", topics: ["rope", "parcels", "fence", "juice", "bus", "morning", "calendar", "weekly", "shopping", "shops", "receipt"] },
  { title: "Daten und Sachsituationen", topics: ["attributes", "survey", "strips", "bag", "wheels", "recipe", "pictures", "questions", "ways", "clarify"] },
] as const;
export type LabTopic = typeof LAB_GROUPS[number]["topics"][number];
export const LAB_TOPIC_IDS = LAB_GROUPS.flatMap<LabTopic>(group => group.topics);

export function schoolTopics(value: unknown): LabTopic[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter((id): id is LabTopic => LAB_TOPIC_IDS.some(known => id === known));
  const unique = [...new Set(valid)].slice(0, 3);
  return unique.length >= 2 ? unique : [];
}
