export const LAB_GROUPS = [
  { title: "Zahlen und Rechnen", topics: ["pairs", "window", "detective", "machine", "packets", "split"] },
  { title: "Raum und Formen", topics: ["viewpoint", "tiles", "cubes", "route"] },
  { title: "Messen, Zeit und Geld", topics: ["rope", "bus", "calendar", "shopping", "shops"] },
  { title: "Daten und Sachsituationen", topics: ["survey", "questions"] },
] as const;
export type LabTopic = typeof LAB_GROUPS[number]["topics"][number];
export const LAB_TOPIC_IDS = LAB_GROUPS.flatMap<LabTopic>(group => group.topics);

export function schoolTopics(value: unknown): LabTopic[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter((id): id is LabTopic => LAB_TOPIC_IDS.some(known => id === known));
  const unique = [...new Set(valid)].slice(0, 3);
  return unique.length >= 2 ? unique : [];
}
