export const LAB_GROUPS = [
  { title: "Zahlen und Rechnen", topics: ["pairs", "window", "detective", "machine", "packets", "split", "chocolate", "claims", "methods", "family", "rest", "balance", "code", "swap"] },
  { title: "Raum und Formen", topics: ["viewpoint", "tiles", "cubes", "tower", "route", "map"] },
  { title: "Messen, Zeit und Geld", topics: ["rope", "parcels", "fence", "juice", "bus", "morning", "calendar", "weekly", "shopping", "shops"] },
  { title: "Daten und Sachsituationen", topics: ["survey", "wheels", "recipe", "pictures", "questions", "ways", "clarify"] },
] as const;
export type LabTopic = typeof LAB_GROUPS[number]["topics"][number];
export const LAB_TOPIC_IDS = LAB_GROUPS.flatMap<LabTopic>(group => group.topics);

export function schoolTopics(value: unknown): LabTopic[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter((id): id is LabTopic => LAB_TOPIC_IDS.some(known => id === known));
  const unique = [...new Set(valid)].slice(0, 3);
  return unique.length >= 2 ? unique : [];
}
