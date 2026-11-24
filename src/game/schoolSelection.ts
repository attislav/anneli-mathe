export const LAB_GROUPS = [
  { title: "Zahlen und Rechnen", topics: ["targetSteps", "pairs", "dotWays", "covered", "window", "detective", "machine", "packets", "split", "repack", "chocolate", "portions", "claims", "methods", "family", "rest", "balance", "code", "swap", "estimateLine"] },
  { title: "Raum und Formen", topics: ["viewpoint", "pegs", "growth", "ribbon", "folds", "tiles", "rollCube", "cubes", "tower", "route", "stairs", "map"] },
  { title: "Messen, Zeit und Geld", topics: ["rope", "parcels", "boxes", "fence", "equalFence", "juice", "bus", "morning", "sharedTime", "calendar", "weekly", "shopping", "shops", "receipt"] },
  { title: "Daten und Sachsituationen", topics: ["attributes", "library", "wheelChance", "survey", "openVotes", "strips", "bag", "wheels", "recipe", "pictures", "questions", "ways", "clarify"] },
] as const;
export type LabTopic = typeof LAB_GROUPS[number]["topics"][number];
export const LAB_TOPIC_IDS = LAB_GROUPS.flatMap<LabTopic>(group => group.topics);

export function schoolTopics(value: unknown): LabTopic[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter((id): id is LabTopic => LAB_TOPIC_IDS.some(known => id === known));
  const unique = [...new Set(valid)].slice(0, 3);
  return unique.length >= 2 ? unique : [];
}
